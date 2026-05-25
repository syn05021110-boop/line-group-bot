/**
 * 既存の「line-group-bot 管理」スプシに、アフィリエイト用の2シートを追加する
 * 実行: node tools/init-affiliate-sheets.mjs
 *
 * 追加されるシート:
 *   1. アフィリエイト_プロンプト  ← A1セルに投稿文生成プロンプト
 *   2. アフィリエイト_候補       ← 生成された投稿候補（コピペ用）
 */

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { google } from "googleapis";
import dotenv from "dotenv";

const PROJECT_ROOT = join(dirname(import.meta.url.replace("file://", "")), "..");
dotenv.config({ path: join(PROJECT_ROOT, ".env") });

const TOKENS_PATH = process.env.GOOGLE_TOKENS_PATH || join(PROJECT_ROOT, "credentials", "tokens.json");

const DEFAULT_AFFILIATE_PROMPT = `あなたは X (Twitter) でアダルト作品を紹介するアフィリエイターです。
渡された作品情報をもとに、思わずクリックしたくなる紹介投稿文を1つ生成してください。

## 投稿のルール

- 全体で 130 文字以内（X の投稿はリンク・画像と合わせると 140 字制限に当たるため余白を残す）
- 冒頭1行目で目を引く（疑問・感嘆・数字・煽り のいずれか）
- 改行を1〜2回入れて読みやすくする
- 絵文字は2〜4個まで。多すぎるとスパムっぽく見える
- 作品の魅力（女優・ジャンル・シチュエーション）を具体的に1つだけ強調する
- 露骨すぎる表現は避ける（X の自動審査回避）。連想させる程度に抑える
- ハッシュタグは付けない（呼び出し側で必要なら付ける）
- アフィリエイトリンクや画像URLは付けない（呼び出し側で結合する）

## 文体

- 毎回違うパターンで書く。「〜が話題！」「〜すぎる」などのテンプレを連発しない
- 自然な日本語。AI生成感を消す
- 一人称・口調は作品の雰囲気に合わせて柔軟に変える

## 出力形式

投稿本文のみを返してください。前置きや説明は不要です。
`;

async function main() {
  if (!process.env.SPREADSHEET_ID) {
    console.error("SPREADSHEET_ID が .env に設定されていません");
    process.exit(1);
  }
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error("GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET が .env に設定されていません");
    process.exit(1);
  }

  let tokens;
  if (process.env.GOOGLE_TOKENS_JSON) {
    tokens = JSON.parse(process.env.GOOGLE_TOKENS_JSON);
  } else if (existsSync(TOKENS_PATH)) {
    tokens = JSON.parse(readFileSync(TOKENS_PATH, "utf-8"));
  } else {
    console.error(`トークンが見つかりません: ${TOKENS_PATH}`);
    process.exit(1);
  }

  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  auth.setCredentials(tokens);

  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = process.env.SPREADSHEET_ID;

  // 既存シート一覧を取得
  const meta = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties.title",
  });
  const existing = meta.data.sheets.map((s) => s.properties.title);

  const toAdd = [];
  if (!existing.includes("アフィリエイト_プロンプト")) {
    toAdd.push({ addSheet: { properties: { title: "アフィリエイト_プロンプト" } } });
  }
  if (!existing.includes("アフィリエイト_候補")) {
    toAdd.push({ addSheet: { properties: { title: "アフィリエイト_候補" } } });
  }

  if (toAdd.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: toAdd },
    });
    console.log(`シートを追加しました: ${toAdd.map((r) => r.addSheet.properties.title).join(", ")}`);
  } else {
    console.log("既にアフィリエイト用シートが存在します（スキップ）");
  }

  // アフィリエイト_プロンプト の A1 が空ならデフォルトプロンプトを書き込む
  const promptRes = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "'アフィリエイト_プロンプト'!A1",
  });
  if (!promptRes.data.values?.[0]?.[0]) {
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: "'アフィリエイト_プロンプト'!A1",
      valueInputOption: "RAW",
      requestBody: { values: [[DEFAULT_AFFILIATE_PROMPT]] },
    });
    console.log("デフォルトの投稿生成プロンプトを書き込みました");
  } else {
    console.log("アフィリエイト_プロンプト の A1 は既に内容があるため上書きしません");
  }

  // アフィリエイト_候補 のヘッダー行を書き込む（毎回上書きでOK）
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "'アフィリエイト_候補'!A1:G1",
    valueInputOption: "RAW",
    requestBody: {
      values: [[
        "日時",
        "作品ID",
        "タイトル",
        "投稿文",
        "アフィリエイトリンク",
        "画像URL",
        "ステータス",
      ]],
    },
  });
  console.log("シート「アフィリエイト_候補」のヘッダーを設定しました");

  console.log("\n--- 完了 ---");
  console.log(`スプシURL: https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`);
  console.log("\n次のステップ:");
  console.log("  1. .env に DMM_API_ID と DMM_AFFILIATE_ID を追加");
  console.log("  2. npm run generate-posts で投稿候補を生成");
}

main().catch((err) => {
  console.error("エラー:", err.message);
  process.exit(1);
});
