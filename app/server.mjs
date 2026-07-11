/**
 * 副業「下書きツール」MVP サーバー
 *
 * フロー:
 *   1. ヒヤリング開始 → 深掘りインタビュー（Claude が1問ずつ）
 *   2. 十分に集まったら強み棚卸しを自動生成
 *   3. 棚卸しをもとに Threads 投稿文 / note 下書きを生成
 *   4. 下書きはコピー / ワンタップ投稿補助（投稿自体は本人）
 *
 * ※ 決済・認証・自動投稿は含まない（Phase2以降）。
 */

import express from "express";
import { join, dirname } from "path";
import dotenv from "dotenv";

import { createSession, getSession, saveSession } from "./lib/store.mjs";
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
app.use(express.json({ limit: "1mb" }));
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

/**
 * ヒヤリング開始：セッションを作り、最初の質問を返す
 */
app.post(
  "/api/hearing/start",
  wrap(async (req, res) => {
    const session = createSession();
    const turn = await interviewTurn(session.transcript, null);

    session.transcript.push({ role: "assistant", content: turn.reply });
    session.turns = turn.progress;
    saveSession(session);

    res.json({
      sessionId: session.id,
      reply: turn.reply,
      done: turn.done,
      progress: turn.progress,
    });
  })
);

/**
 * ヒヤリング回答：ユーザーの回答を受け、次の質問 or 締め（＋棚卸し）を返す
 */
app.post(
  "/api/hearing/message",
  wrap(async (req, res) => {
    const { sessionId, answer } = req.body || {};
    const session = getSession(sessionId);
    if (!session) return res.status(404).json({ error: "セッションが見つかりません" });
    if (!answer || !String(answer).trim())
      return res.status(400).json({ error: "回答が空です" });

    session.transcript.push({ role: "user", content: String(answer).trim() });

    const turn = await interviewTurn(session.transcript, null);
    session.transcript.push({ role: "assistant", content: turn.reply });
    session.turns = turn.progress;

    let profile = null;
    if (turn.done) {
      // インタビュー終了 → 強み棚卸しを生成
      profile = await synthesizeStrengths(session.transcript);
      session.profile = profile;
    }
    saveSession(session);

    res.json({
      reply: turn.reply,
      done: turn.done,
      progress: turn.progress,
      profile,
    });
  })
);

/**
 * 手動で棚卸しを（再）生成したい場合
 */
app.post(
  "/api/strengths",
  wrap(async (req, res) => {
    const { sessionId } = req.body || {};
    const session = getSession(sessionId);
    if (!session) return res.status(404).json({ error: "セッションが見つかりません" });

    const profile = await synthesizeStrengths(session.transcript);
    session.profile = profile;
    saveSession(session);
    res.json({ profile });
  })
);

/**
 * Threads 投稿文を生成
 */
app.post(
  "/api/generate/threads",
  wrap(async (req, res) => {
    const { sessionId, theme } = req.body || {};
    const session = getSession(sessionId);
    if (!session || !session.profile)
      return res.status(400).json({ error: "先にヒヤリングを完了してください" });

    const result = await generateThreads(session.profile, theme, session.transcript);
    session.drafts.threads = result;
    saveSession(session);
    res.json(result);
  })
);

/**
 * X（旧Twitter）投稿文を生成
 */
app.post(
  "/api/generate/x",
  wrap(async (req, res) => {
    const { sessionId, theme } = req.body || {};
    const session = getSession(sessionId);
    if (!session || !session.profile)
      return res.status(400).json({ error: "先にヒヤリングを完了してください" });

    const result = await generateX(session.profile, theme, session.transcript);
    session.drafts.x = result;
    saveSession(session);
    res.json(result);
  })
);

/**
 * note 下書きを生成
 */
app.post(
  "/api/generate/note",
  wrap(async (req, res) => {
    const { sessionId, theme } = req.body || {};
    const session = getSession(sessionId);
    if (!session || !session.profile)
      return res.status(400).json({ error: "先にヒヤリングを完了してください" });

    const note = await generateNote(session.profile, theme, session.transcript);
    session.drafts.note = note;
    saveSession(session);
    res.json({ note });
  })
);

// 生成系エンドポイントの共通ファクトリ（profile必須・結果をdraftsに保存）
function generationRoute(draftKey, generator) {
  return wrap(async (req, res) => {
    const { sessionId, theme } = req.body || {};
    const session = getSession(sessionId);
    if (!session || !session.profile)
      return res.status(400).json({ error: "先にヒヤリングを完了してください" });
    const result = await generator(session.profile, theme, session.transcript);
    session.drafts[draftKey] = result;
    saveSession(session);
    res.json(result);
  });
}

app.post("/api/generate/instagram", generationRoute("instagram", generateInstagram));
app.post("/api/generate/tiktok", generationRoute("tiktok", generateTikTok));
app.post("/api/generate/calendar", generationRoute("calendar", generateCalendar));
app.post("/api/generate/paidnote", generationRoute("paidnote", generatePaidNote));
app.post("/api/generate/profiles", generationRoute("profiles", generateProfiles));

/**
 * セッションの現在状態を取得（リロード復帰用）
 */
app.get(
  "/api/session/:id",
  wrap(async (req, res) => {
    const session = getSession(req.params.id);
    if (!session) return res.status(404).json({ error: "セッションが見つかりません" });
    res.json({ session });
  })
);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`fukugyo-draft-app running on http://localhost:${PORT}`);
  console.log(`ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? "設定済み" : "(未設定)"}`);
});
