/**
 * Claude API で X (Twitter) 用のアフィリエイト投稿文を生成する
 * システムプロンプトはスプシから取得する
 */

import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
import { join, dirname } from "path";

const PROJECT_ROOT = join(dirname(import.meta.url.replace("file://", "")), "..");
dotenv.config({ path: join(PROJECT_ROOT, ".env") });

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * 1作品分の投稿文を生成する
 * 返り値はテキストのみ。アフィリエイトリンクと画像URLは呼び出し側で結合する。
 *
 * @param {object} item       lib/dmm.mjs の normalizeItem で整形済みアイテム
 * @param {string} systemPrompt スプシから取得したシステムプロンプト
 * @returns {Promise<string>} 投稿本文
 */
export async function generatePostText(item, systemPrompt) {
  const itemInfo = [
    `タイトル: ${item.title}`,
    item.actresses.length > 0 && `女優: ${item.actresses.join(", ")}`,
    item.genres.length > 0 && `ジャンル: ${item.genres.join(", ")}`,
    item.maker && `メーカー: ${item.maker}`,
    item.series && `シリーズ: ${item.series}`,
    item.date && `発売日: ${item.date}`,
    item.review && `レビュー: 平均${item.review.average}点 (${item.review.count}件)`,
  ]
    .filter(Boolean)
    .join("\n");

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 512,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content:
          "以下の作品情報をもとに、X (Twitter) 用の紹介投稿文を1つ生成してください。\n" +
          "アフィリエイトリンク・画像URL・ハッシュタグの羅列は付けず、本文だけ返してください。\n\n" +
          itemInfo,
      },
    ],
  });

  return response.content[0].text.trim();
}
