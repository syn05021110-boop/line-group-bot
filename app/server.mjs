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

/* ===== 有料解放（アクセスコード方式） =====
 * UNLOCK_CODE 環境変数に設定した合言葉を、購入者に手動発行する。
 * 無料: ヒヤリング / 強み棚卸し / Threads(3投稿までの味見)
 * 有料: X / Instagram / TikTok / note / 有料note構成 / プロフィール一括 / カレンダー
 */
const UNLOCK_CODE = process.env.UNLOCK_CODE || "";

function isUnlocked(req) {
  return UNLOCK_CODE !== "" && req.get("x-unlock-token") === UNLOCK_CODE;
}

function requireUnlock(req, res) {
  if (isUnlocked(req)) return true;
  res.status(402).json({ error: "この機能は有料プラン限定です", locked: true });
  return false;
}

app.post("/api/unlock", (req, res) => {
  const code = req.body && req.body.code ? String(req.body.code).trim() : "";
  if (UNLOCK_CODE === "")
    return res.status(400).json({ error: "解放コードが未設定です（運営にお問い合わせください）" });
  if (code && code === UNLOCK_CODE) return res.json({ ok: true, token: UNLOCK_CODE });
  return res.status(401).json({ error: "コードが違います" });
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
