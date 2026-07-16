/**
 * 副業「下書きツール」MVP サーバー（ステートレス版）
 *
 * フロー:
 *   1. ヒヤリング開始 → 深掘りインタビュー（Claude が1問ずつ）
 *   2. 十分に集まったら強み棚卸しを自動生成
 *   3. 棚卸しをもとに 各SNS/note の下書きを生成
 *
 * ※ 会話状態(transcript)と棚卸し(profile)は「画面側」が保持し、毎回サーバーに渡す。
 *    サーバーはセッションを保存しない＝再デプロイ/スリープ復帰で消えない。
 */

import express from "express";
import crypto from "crypto";
import { join, dirname } from "path";
import dotenv from "dotenv";

import { interviewTurn, synthesizeStrengths } from "./lib/hearing.mjs";
import {
  generateThreads,
  generateNote,
  generateX,
  generateInstagram,
  generateCalendar,
  generatePaidNote,
  generateTikTok,
  generateProfiles,
} from "./lib/content.mjs";

const PROJECT_ROOT = dirname(import.meta.url.replace("file://", ""));
dotenv.config({ path: join(PROJECT_ROOT, ".env") });

const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(express.static(join(PROJECT_ROOT, "public")));

// 共通エラーラッパ
const wrap = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (err) {
    console.error("[api error]", err.message);
    res.status(500).json({ error: err.message || "サーバーエラー" });
  }
};

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", model: "claude-opus-4-8" });
});

// 管理用：コード発行ページ
app.get("/admin", (req, res) => res.sendFile(join(PROJECT_ROOT, "public", "admin.html")));
// 決済成功ページ（Stripeの支払い後の戻り先）
app.get("/success", (req, res) => res.sendFile(join(PROJECT_ROOT, "public", "success.html")));

/* ===== 有料解放（期限つき個別コード方式） =====
 * ・買い切り = 無期限の署名コード
 * ・月額     = 31日など期限つきの署名コード（期限切れで自動的に使えなくなる＝解約で止まる）
 * ・発行は /admin ページから（ADMIN_KEY 認証）。DB不要・再起動に強い（署名検証のみ）。
 *
 * 環境変数:
 *   UNLOCK_CODE   … 永久マスターコード（任意・自分のテスト用にも使える）
 *   UNLOCK_SECRET … 署名鍵（未設定なら UNLOCK_CODE を流用）
 *   ADMIN_KEY     … コード発行ページの管理パスワード（必須）
 */
const UNLOCK_CODE = process.env.UNLOCK_CODE || "";
const UNLOCK_SECRET = process.env.UNLOCK_SECRET || UNLOCK_CODE || "";
const ADMIN_KEY = process.env.ADMIN_KEY || "";

function signPayload(payload) {
  return crypto.createHmac("sha256", UNLOCK_SECRET).update(payload).digest("base64url");
}

// exp: エポック秒（0 = 無期限）
function mintCode(exp) {
  const payload = Buffer.from(JSON.stringify({ exp })).toString("base64url");
  return `${payload}.${signPayload(payload)}`;
}

function verifySignedCode(code) {
  if (!UNLOCK_SECRET || typeof code !== "string" || !code.includes(".")) return false;
  const [payload, sig] = code.split(".");
  if (!payload || !sig) return false;
  const expected = signPayload(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  let data;
  try {
    data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return false;
  }
  const exp = Number(data.exp) || 0;
  if (exp !== 0 && Date.now() / 1000 > exp) return false; // 期限切れ
  return true;
}

function tokenValid(token) {
  if (!token) return false;
  if (UNLOCK_CODE && token === UNLOCK_CODE) return true; // 永久マスターコード
  return verifySignedCode(token);
}

function isUnlocked(req) {
  return tokenValid(req.get("x-unlock-token"));
}

function requireUnlock(req, res) {
  if (isUnlocked(req)) return true;
  res.status(402).json({ error: "この機能は有料プラン限定です", locked: true });
  return false;
}

// 顧客がコードを入力して解放
app.post("/api/unlock", (req, res) => {
  const code = req.body && req.body.code ? String(req.body.code).trim() : "";
  if (!code) return res.status(400).json({ error: "コードを入力してください" });
  if (tokenValid(code)) return res.json({ ok: true, token: code });
  return res.status(401).json({ error: "コードが違うか、有効期限が切れています" });
});

// Stripe決済完了 → 自動でコードを発行（成功ページから呼ばれる）
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || "";

app.post(
  "/api/stripe/redeem",
  wrap(async (req, res) => {
    const sessionId = req.body && req.body.session_id ? String(req.body.session_id) : "";
    if (!STRIPE_SECRET_KEY)
      return res.status(400).json({ error: "STRIPE_SECRET_KEY が未設定です（Renderで設定してください）" });
    if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId))
      return res.status(400).json({ error: "決済セッションが正しくありません" });

    // Stripeに問い合わせて支払い状況を確認
    const r = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
      { headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` } }
    );
    const s = await r.json();
    if (!r.ok) return res.status(400).json({ error: "Stripeの照会に失敗しました" });

    const paid = s.payment_status === "paid" || s.payment_status === "no_payment_required";
    if (!paid) return res.status(402).json({ error: "お支払いがまだ確認できていません" });

    // subscription=月額（31日）/ payment=買い切り（無期限）
    const monthly = s.mode === "subscription";
    // 期限は「支払い日」基準にして、ページ再訪問で不正に延長されないようにする
    const created = Number(s.created) || Math.floor(Date.now() / 1000);
    const exp = monthly ? created + 31 * 86400 : 0;
    const code = mintCode(exp);
    const expiresAt =
      exp === 0
        ? "無期限（買い切り）"
        : new Date(exp * 1000).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
    res.json({ code, expiresAt, plan: monthly ? "月額プラン" : "買い切りプラン" });
  })
);

// 管理者がコードを発行（/admin ページから）
app.post("/api/admin/issue", (req, res) => {
  const { adminKey, days } = req.body || {};
  if (!ADMIN_KEY)
    return res.status(400).json({ error: "ADMIN_KEY が未設定です（Renderの環境変数に設定してください）" });
  if (!UNLOCK_SECRET)
    return res.status(400).json({ error: "UNLOCK_CODE（署名鍵）が未設定です" });
  if (String(adminKey || "") !== ADMIN_KEY)
    return res.status(401).json({ error: "管理パスワードが違います" });

  const d = Number(days);
  const exp = d && d > 0 ? Math.floor(Date.now() / 1000) + d * 86400 : 0;
  const code = mintCode(exp);
  const expiresAt =
    exp === 0
      ? "無期限（買い切り）"
      : new Date(exp * 1000).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
  res.json({ code, expiresAt });
});

/** 受け取った transcript を安全な形に整える */
function sanitizeTranscript(input) {
  if (!Array.isArray(input)) return [];
  return input
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: m.content }))
    .slice(-40); // 念のため上限
}

/**
 * ヒヤリング開始：最初の質問を返す（transcript も返す）
 */
app.post(
  "/api/hearing/start",
  wrap(async (req, res) => {
    const turn = await interviewTurn([], null);
    const transcript = [{ role: "assistant", content: turn.reply }];
    res.json({ transcript, reply: turn.reply, done: turn.done, progress: turn.progress });
  })
);

/**
 * ヒヤリング回答：画面から transcript + 今回の回答を受け取り、次の質問 or 締め(+棚卸し)を返す
 */
app.post(
  "/api/hearing/message",
  wrap(async (req, res) => {
    const { transcript, answer } = req.body || {};
    if (!answer || !String(answer).trim())
      return res.status(400).json({ error: "回答が空です" });

    const t = sanitizeTranscript(transcript);
    t.push({ role: "user", content: String(answer).trim() });

    const turn = await interviewTurn(t, null);
    t.push({ role: "assistant", content: turn.reply });

    let profile = null;
    if (turn.done) {
      profile = await synthesizeStrengths(t);
    }

    res.json({ transcript: t, reply: turn.reply, done: turn.done, progress: turn.progress, profile });
  })
);

/**
 * 強み棚卸しの（再）生成：transcript から作る
 */
app.post(
  "/api/strengths",
  wrap(async (req, res) => {
    const t = sanitizeTranscript(req.body && req.body.transcript);
    if (!t.length) return res.status(400).json({ error: "先にヒヤリングを行ってください" });
    const profile = await synthesizeStrengths(t);
    res.json({ profile });
  })
);

/* ===== 生成系エンドポイント（画面から profile + transcript + theme を受け取る） ===== */

function readGenInput(req) {
  const { profile, transcript, theme } = req.body || {};
  return { profile, transcript: sanitizeTranscript(transcript), theme: theme || "" };
}

// Threads（無料・味見3本）
app.post(
  "/api/generate/threads",
  wrap(async (req, res) => {
    const { profile, transcript, theme } = readGenInput(req);
    if (!profile) return res.status(400).json({ error: "先にヒヤリングを完了してください" });
    const result = await generateThreads(profile, theme, transcript);
    if (!isUnlocked(req) && Array.isArray(result.posts)) {
      result.posts = result.posts.slice(0, 3);
    }
    res.json(result);
  })
);

// 有料の生成系（要 UNLOCK）
function lockedRoute(generator) {
  return wrap(async (req, res) => {
    const { profile, transcript, theme } = readGenInput(req);
    if (!profile) return res.status(400).json({ error: "先にヒヤリングを完了してください" });
    if (!requireUnlock(req, res)) return;
    const result = await generator(profile, theme, transcript);
    res.json(result);
  });
}

app.post("/api/generate/x", lockedRoute(generateX));
app.post("/api/generate/instagram", lockedRoute(generateInstagram));
app.post("/api/generate/tiktok", lockedRoute(generateTikTok));
app.post("/api/generate/calendar", lockedRoute(generateCalendar));
app.post("/api/generate/paidnote", lockedRoute(generatePaidNote));
app.post("/api/generate/profiles", lockedRoute(generateProfiles));

// note は {note} でラップして返す（フロント互換）
app.post(
  "/api/generate/note",
  wrap(async (req, res) => {
    const { profile, transcript, theme } = readGenInput(req);
    if (!profile) return res.status(400).json({ error: "先にヒヤリングを完了してください" });
    if (!requireUnlock(req, res)) return;
    const note = await generateNote(profile, theme, transcript);
    res.json({ note });
  })
);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`fukugyo-draft-app running on http://localhost:${PORT}`);
  console.log(`ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? "設定済み" : "(未設定)"}`);
  console.log(`UNLOCK_CODE: ${UNLOCK_CODE ? "設定済み" : "(未設定 — 有料機能はロックされたまま)"}`);
});
