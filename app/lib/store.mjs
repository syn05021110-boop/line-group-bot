/**
 * セッション保存（MVP: JSONファイル + メモリ）
 * 本番では DB に置き換える前提。認証は未実装（Phase2）。
 *
 * セッション構造:
 * {
 *   id, createdAt, updatedAt,
 *   transcript: [{ role: "assistant"|"user", content }],  // ヒヤリング対話
 *   turns: number,                                          // 質問回数
 *   profile: {...} | null,                                  // 強み棚卸し結果
 *   drafts: { threads: [...] | null, note: {...} | null }
 * }
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { randomUUID } from "crypto";

const PROJECT_ROOT = join(dirname(import.meta.url.replace("file://", "")), "..");
const DATA_DIR = join(PROJECT_ROOT, "data");
const STORE_PATH = join(DATA_DIR, "sessions.json");

let sessions = new Map();

// 起動時にファイルから復元
(function load() {
  try {
    if (existsSync(STORE_PATH)) {
      const raw = JSON.parse(readFileSync(STORE_PATH, "utf-8"));
      sessions = new Map(Object.entries(raw));
    }
  } catch (err) {
    console.error("[store] 読み込み失敗（新規で開始）:", err.message);
    sessions = new Map();
  }
})();

function persist() {
  try {
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
    const obj = Object.fromEntries(sessions);
    writeFileSync(STORE_PATH, JSON.stringify(obj, null, 2));
  } catch (err) {
    console.error("[store] 保存失敗:", err.message);
  }
}

export function createSession() {
  const now = new Date().toISOString();
  const session = {
    id: randomUUID(),
    createdAt: now,
    updatedAt: now,
    transcript: [],
    turns: 0,
    profile: null,
    drafts: { threads: null, x: null, note: null },
  };
  sessions.set(session.id, session);
  persist();
  return session;
}

export function getSession(id) {
  return sessions.get(id) || null;
}

export function saveSession(session) {
  session.updatedAt = new Date().toISOString();
  sessions.set(session.id, session);
  persist();
  return session;
}
