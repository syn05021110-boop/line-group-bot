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
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import dotenv from "dotenv";

import { publishThreadsPost, refreshThreadsToken, threadsConfigured } from "./lib/threads.mjs";
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
app.use(express.static(join(PROJECT_ROOT, "public")));

// Stripe webhook は署名検証のため「生ボディ」が必要。express.json より前に登録する。
app.post("/api/stripe/webhook", express.raw({ type: "*/*" }), (req, res) => stripeWebhook(req, res));

app.use(express.json({ limit: "2mb" }));

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
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";
const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const MAIL_FROM = process.env.MAIL_FROM || "副業ドラフト <onboarding@resend.dev>";

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

/* ===== Stripe Webhook（月額の翌月自動更新 → 新コードをメール送信） =====
 * ・毎月の自動課金が成功すると Stripe が invoice.paid を送ってくる
 * ・そのたびに 31日の新しいコードを発行し、購入者のメールに自動送信する
 * ・購入者はメールのコードをアプリの「解放コード」欄に入れれば継続利用できる
 *
 * 環境変数:
 *   STRIPE_WEBHOOK_SECRET … Stripeの「Webhook署名シークレット(whsec_...)」
 *   RESEND_API_KEY        … Resend の APIキー（メール送信）
 *   MAIL_FROM             … 送信元（例: 副業ドラフト <no-reply@あなたのドメイン>）
 */

// Resend でメール送信（依存追加なし・fetch のみ）
async function sendCodeEmail(to, code, expiresAt) {
  if (!RESEND_API_KEY) {
    console.warn("[webhook] RESEND_API_KEY 未設定のためメール送信をスキップ:", to);
    return false;
  }
  if (!to) {
    console.warn("[webhook] 宛先メールが無いため送信スキップ");
    return false;
  }
  const html = `
    <div style="font-family:-apple-system,'Hiragino Sans','Noto Sans JP',sans-serif;line-height:1.8;color:#1a1a2e">
      <h2 style="margin:0 0 8px">今月分の解放コードをお届けします</h2>
      <p>副業ドラフトをご利用いただきありがとうございます。<br>月額プランの自動更新が完了しました。</p>
      <p>下のコードをアプリの「解放コード」欄に貼り付けてください。</p>
      <div style="background:#0f0f1a;color:#f4f3fb;border:1px solid #a855f7;border-radius:10px;padding:14px;font-size:14px;word-break:break-all;margin:12px 0">
        ${code}
      </div>
      <p style="color:#555;font-size:13px">有効期限：${expiresAt}</p>
      <p style="color:#555;font-size:13px">※コードは端末に一度入れれば有効期限まで再入力は不要です。次回の更新時にまた新しいコードをお送りします。</p>
    </div>`;
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: MAIL_FROM,
        to: [to],
        subject: "【副業ドラフト】今月分の解放コード（自動更新）",
        html,
      }),
    });
    if (!r.ok) {
      const t = await r.text();
      console.error("[webhook] Resend送信失敗:", r.status, t);
      return false;
    }
    console.log("[webhook] 解放コードをメール送信:", to);
    return true;
  } catch (e) {
    console.error("[webhook] Resend例外:", e.message);
    return false;
  }
}

// Stripe署名の検証（built-in crypto のみ。Stripe SDK不要）
function verifyStripeSignature(rawBody, sigHeader, secret) {
  if (!sigHeader || !secret) return false;
  const parts = Object.fromEntries(
    sigHeader.split(",").map((kv) => kv.split("=").map((x) => x.trim()))
  );
  const t = parts.t;
  const v1 = parts.v1;
  if (!t || !v1) return false;
  // タイムスタンプの許容範囲（±5分）でリプレイを防ぐ
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - Number(t)) > 300) return false;
  const signed = `${t}.${rawBody.toString("utf8")}`;
  const expected = crypto.createHmac("sha256", secret).update(signed).digest("hex");
  const a = Buffer.from(v1);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// Webhook本体（express.raw で生ボディを受け取る）
async function stripeWebhook(req, res) {
  try {
    if (!STRIPE_WEBHOOK_SECRET) {
      console.warn("[webhook] STRIPE_WEBHOOK_SECRET 未設定");
      return res.status(400).send("webhook secret not set");
    }
    const raw = req.body; // Buffer（express.raw）
    const sig = req.get("stripe-signature");
    if (!verifyStripeSignature(raw, sig, STRIPE_WEBHOOK_SECRET)) {
      console.warn("[webhook] 署名検証NG");
      return res.status(400).send("invalid signature");
    }

    const event = JSON.parse(raw.toString("utf8"));

    // 月額の課金成功（初回・更新の両方で飛ぶ）。更新分だけ拾えればよい。
    if (event.type === "invoice.paid" || event.type === "invoice.payment_succeeded") {
      const inv = event.data && event.data.object ? event.data.object : {};
      // サブスクの請求のみ対象（買い切りは対象外）
      const isSubscription =
        inv.subscription || inv.billing_reason === "subscription_cycle" ||
        inv.billing_reason === "subscription_create";
      if (isSubscription) {
        // 支払い日基準で31日の新コード
        const base =
          Number(inv.created) ||
          (inv.status_transitions && Number(inv.status_transitions.paid_at)) ||
          Math.floor(Date.now() / 1000);
        const exp = base + 31 * 86400;
        const code = mintCode(exp);
        const expiresAt = new Date(exp * 1000).toLocaleString("ja-JP", {
          timeZone: "Asia/Tokyo",
        });
        const email =
          inv.customer_email ||
          (inv.customer_details && inv.customer_details.email) ||
          "";
        await sendCodeEmail(email, code, expiresAt);
        console.log(
          `[webhook] ${event.type} 処理: reason=${inv.billing_reason} email=${email || "(なし)"}`
        );
      }
    }

    // 200を返せば Stripe は成功とみなす（再送されない）
    res.json({ received: true });
  } catch (err) {
    console.error("[webhook] 例外:", err.message);
    res.status(400).send("webhook error");
  }
}

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

/* ===== Threads 自動投稿（拡散用・自分のアカウントへ） =====
 * ・投稿素材は data/threads-queue.json（配列・上から順に投稿）
 * ・外部cron（cron-job.org 等）が定期的に /api/threads/tick を叩く
 * ・「開始日時 THREADS_START」からの経過で投稿インデックスを決める（DB不要）
 * ・素材を全部出し切ったら先頭に戻ってループ（常時発信）
 *
 * 環境変数:
 *   THREADS_ACCESS_TOKEN … Threads長期トークン（threads.mjs 参照）
 *   THREADS_USER_ID       … 自分のユーザーID（未設定なら "me"）
 *   CRON_KEY              … tickを叩くための合言葉（必須・第三者の乱用防止）
 *   THREADS_START         … 投稿開始日時 ISO（例 2026-07-17T08:00:00+09:00）
 *   THREADS_INTERVAL_HOURS… 投稿間隔（時間・既定8＝1日3本）
 */
const CRON_KEY = process.env.CRON_KEY || "";
const THREADS_INTERVAL_HOURS = Number(process.env.THREADS_INTERVAL_HOURS) || 8;
const THREADS_STATE_FILE = join(PROJECT_ROOT, "data", "threads-state.json");
const postedThisProcess = new Set(); // 二重投稿ガード（同一プロセス内）

let THREADS_QUEUE = [];
try {
  THREADS_QUEUE = JSON.parse(readFileSync(join(PROJECT_ROOT, "data", "threads-queue.json"), "utf8"));
} catch {
  THREADS_QUEUE = [];
}

function threadsStart() {
  const env = process.env.THREADS_START;
  const t = env ? Date.parse(env) : NaN;
  return Number.isFinite(t) ? t : null;
}

function readThreadsState() {
  try {
    return JSON.parse(readFileSync(THREADS_STATE_FILE, "utf8"));
  } catch {
    return { lastPostedIndex: -1, start: null };
  }
}
function writeThreadsState(state) {
  try {
    writeFileSync(THREADS_STATE_FILE, JSON.stringify(state, null, 2));
  } catch (e) {
    console.warn("[threads] 状態ファイル書き込み失敗:", e.message);
  }
}

// 「今この瞬間に投稿すべきスロット番号」を経過時間から算出
function currentSlotIndex(startMs) {
  const intervalMs = THREADS_INTERVAL_HOURS * 3600 * 1000;
  const elapsed = Date.now() - startMs;
  if (elapsed < 0) return -1; // まだ開始前
  return Math.floor(elapsed / intervalMs);
}

function cronAuthed(req) {
  const key = req.query.key || (req.body && req.body.key) || req.get("x-cron-key") || "";
  return CRON_KEY && String(key) === CRON_KEY;
}

// 外部cronが定期的に叩く。スロットが進んでいれば1本投稿する。
app.post(
  "/api/threads/tick",
  wrap(async (req, res) => {
    if (!cronAuthed(req)) return res.status(401).json({ error: "CRON_KEY が違います" });
    if (!threadsConfigured())
      return res.status(400).json({ error: "THREADS_ACCESS_TOKEN が未設定です" });
    if (!THREADS_QUEUE.length)
      return res.status(400).json({ error: "投稿素材(threads-queue.json)が空です" });

    // 開始日時：env優先、なければ状態ファイル、なければ今回を開始点として保存
    const state = readThreadsState();
    let startMs = threadsStart();
    if (startMs == null) {
      startMs = state.start ? Number(state.start) : Date.now();
      if (!state.start) writeThreadsState({ ...state, start: startMs });
    }

    const slot = currentSlotIndex(startMs);
    if (slot < 0) return res.json({ skipped: true, reason: "開始前", startMs });

    // すでにこのスロットは投稿済み → 何もしない（二重投稿防止）
    if (postedThisProcess.has(slot) || slot <= (state.lastPostedIndex ?? -1)) {
      return res.json({ skipped: true, reason: "投稿済みスロット", slot });
    }

    // 素材を使い切ったら先頭に戻ってループ
    const text = THREADS_QUEUE[slot % THREADS_QUEUE.length];
    try {
      const id = await publishThreadsPost(text);
      postedThisProcess.add(slot);
      writeThreadsState({ lastPostedIndex: slot, start: startMs });
      console.log(`[threads] 投稿成功 slot=${slot} id=${id}`);
      res.json({ posted: true, slot, id, preview: text.slice(0, 30) });
    } catch (e) {
      console.error("[threads] 投稿失敗 slot=" + slot, e.message);
      res.status(502).json({ error: e.message, slot });
    }
  })
);

// 手動テスト投稿：指定インデックスを今すぐ投稿（動作確認用）
app.post(
  "/api/threads/post-now",
  wrap(async (req, res) => {
    if (!cronAuthed(req)) return res.status(401).json({ error: "CRON_KEY が違います" });
    if (!threadsConfigured())
      return res.status(400).json({ error: "THREADS_ACCESS_TOKEN が未設定です" });
    const i = Number(req.query.index ?? (req.body && req.body.index) ?? 0);
    const text = THREADS_QUEUE[((i % THREADS_QUEUE.length) + THREADS_QUEUE.length) % THREADS_QUEUE.length];
    if (!text) return res.status(400).json({ error: "素材が空です" });
    const id = await publishThreadsPost(text);
    res.json({ posted: true, index: i, id, preview: text.slice(0, 30) });
  })
);

// 進捗確認
app.get("/api/threads/status", (req, res) => {
  if (!cronAuthed(req)) return res.status(401).json({ error: "CRON_KEY が違います" });
  const state = readThreadsState();
  const startMs = threadsStart() ?? (state.start ? Number(state.start) : null);
  const slot = startMs != null ? currentSlotIndex(startMs) : null;
  res.json({
    configured: threadsConfigured(),
    queueLength: THREADS_QUEUE.length,
    intervalHours: THREADS_INTERVAL_HOURS,
    start: startMs ? new Date(startMs).toISOString() : null,
    currentSlot: slot,
    lastPostedIndex: state.lastPostedIndex ?? -1,
  });
});

// 長期トークンの更新（新トークンを返すので環境変数を差し替える）
app.post(
  "/api/threads/refresh",
  wrap(async (req, res) => {
    if (!cronAuthed(req)) return res.status(401).json({ error: "CRON_KEY が違います" });
    const data = await refreshThreadsToken();
    const days = data.expires_in ? Math.floor(data.expires_in / 86400) : null;
    res.json({ ok: true, newToken: data.access_token, expiresInDays: days });
  })
);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`fukugyo-draft-app running on http://localhost:${PORT}`);
  console.log(`ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? "設定済み" : "(未設定)"}`);
  console.log(`UNLOCK_CODE: ${UNLOCK_CODE ? "設定済み" : "(未設定 — 有料機能はロックされたまま)"}`);
  console.log(
    `Threads自動投稿: ${threadsConfigured() ? "設定済み" : "(未設定)"} / 素材${THREADS_QUEUE.length}本 / 間隔${THREADS_INTERVAL_HOURS}h`
  );
});
