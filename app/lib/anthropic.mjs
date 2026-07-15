/**
 * Claude API 共通ヘルパー
 * - SDK は既存プロジェクトと同じ ^0.39.0 を利用（messages.create の最小サーフェスのみ使用）
 * - モデルは claude-opus-4-8
 * - 構造化出力は「JSONのみで返す」指示 + 堅牢なパースで実現（SDKバージョン非依存）
 */

import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
import { join, dirname } from "path";

const PROJECT_ROOT = join(dirname(import.meta.url.replace("file://", "")), "..");
dotenv.config({ path: join(PROJECT_ROOT, ".env") });

export const MODEL = "claude-opus-4-8";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * テキスト応答を1回生成する
 * @param {Object} opts
 * @param {string} opts.system - システムプロンプト
 * @param {Array}  opts.messages - [{role, content}]
 * @param {number} [opts.maxTokens=4096]
 * @returns {Promise<string>} 生成テキスト
 */
export async function complete({ system, messages, maxTokens = 4096, stopSequences }) {
  const res = await anthropic.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages,
    ...(stopSequences && stopSequences.length ? { stop_sequences: stopSequences } : {}),
  });

  // text ブロックだけを連結して返す
  return (res.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
}

/**
 * JSON を生成させて安全にパースする。
 * モデルには「JSONのみ返す」よう指示している前提。
 * ```json フェンスや前後の説明文が混ざっても最初の JSON を抽出する。
 */
export async function completeJSON({ system, messages, maxTokens = 4096 }) {
  try {
    const text = await complete({ system, messages, maxTokens });
    return extractJSON(text);
  } catch {
    // 失敗したら一度だけ、より厳しめの指示で再試行
    const strict =
      system +
      "\n\n【最重要】出力は指定のJSONオブジェクトのみ。前後に説明文・挨拶・コードフェンス（```）を一切付けないこと。";
    const text = await complete({ system: strict, messages, maxTokens });
    return extractJSON(text);
  }
}

/**
 * 文字列から最初の JSON オブジェクト/配列を抽出してパースする
 */
export function extractJSON(text) {
  if (!text) throw new Error("空の応答です");

  // ```json ... ``` フェンスを優先的に剥がす
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fence ? fence[1] : text;

  // そのままパースできればそれで返す
  try {
    return JSON.parse(candidate.trim());
  } catch {
    // 最初の { か [ から対応する括弧までを走査して抽出
    const sliced = sliceBalanced(candidate);
    if (sliced) return JSON.parse(sliced);
    throw new Error("JSON をパースできませんでした: " + text.slice(0, 200));
  }
}

/**
 * 最初の { または [ から対応する閉じ括弧までを抜き出す（文字列内の括弧は無視）
 */
function sliceBalanced(text) {
  const start = text.search(/[{[]/);
  if (start === -1) return null;

  const open = text[start];
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  let inStr = false;
  let esc = false;

  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === "\\") esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') inStr = true;
    else if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}
