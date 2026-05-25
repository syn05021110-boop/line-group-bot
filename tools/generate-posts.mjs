/**
 * アフィリエイト投稿候補を生成してスプシに保存する
 *
 * 実行例:
 *   node tools/generate-posts.mjs                       # デフォルト: rank, 20件
 *   node tools/generate-posts.mjs --hits=10
 *   node tools/generate-posts.mjs --sort=date --hits=30
 *   node tools/generate-posts.mjs --keyword=巨乳 --hits=5
 *   node tools/generate-posts.mjs --floor=videoc --sort=rank
 *
 * オプション:
 *   --site=FANZA           DMM.com | FANZA (デフォルト FANZA)
 *   --service=digital      digital | mono | rental など
 *   --floor=videoa         videoa (アダルト動画), videoc, anime など
 *   --sort=rank            rank | date | review | -price
 *   --hits=20              取得件数（最大100）
 *   --offset=1             検索開始位置
 *   --keyword=...          検索キーワード
 *   --dry-run              スプシに書き込まず、生成結果のみ表示
 */

import dotenv from "dotenv";
import { join, dirname } from "path";
import { fetchItems } from "../lib/dmm.mjs";
import { generatePostText } from "../lib/affiliate.mjs";
import {
  fetchAffiliatePrompt,
  fetchPostedItemIds,
  appendPostCandidate,
} from "../lib/sheets.mjs";

const PROJECT_ROOT = join(dirname(import.meta.url.replace("file://", "")), "..");
dotenv.config({ path: join(PROJECT_ROOT, ".env") });

function parseArgs(argv) {
  const args = {};
  for (const a of argv.slice(2)) {
    if (a === "--dry-run") {
      args.dryRun = true;
      continue;
    }
    const m = a.match(/^--([^=]+)=(.*)$/);
    if (m) args[m[1]] = m[2];
  }
  return args;
}

async function main() {
  const args = parseArgs(process.argv);

  const apiId = process.env.DMM_API_ID;
  const affiliateId = process.env.DMM_AFFILIATE_ID;
  if (!apiId || !affiliateId) {
    console.error("DMM_API_ID / DMM_AFFILIATE_ID が .env に設定されていません");
    console.error("https://affiliate.dmm.com/api/ で API ID を発行してください");
    process.exit(1);
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY が .env に設定されていません");
    process.exit(1);
  }

  const fetchOpts = {
    apiId,
    affiliateId,
    site: args.site || "FANZA",
    service: args.service || "digital",
    floor: args.floor || "videoa",
    sort: args.sort || "rank",
    hits: Number(args.hits || 20),
    offset: Number(args.offset || 1),
    keyword: args.keyword,
  };

  console.log("[1/4] DMM API から作品を取得中...");
  console.log(`  条件: ${JSON.stringify(fetchOpts, (k, v) => (k === "apiId" || k === "affiliateId" ? "***" : v))}`);

  const items = await fetchItems(fetchOpts);
  console.log(`  → ${items.length} 件取得`);

  if (items.length === 0) {
    console.log("対象作品なし。終了します。");
    return;
  }

  console.log("[2/4] 既に登録済みの作品IDを確認中...");
  const posted = args.dryRun ? new Set() : await fetchPostedItemIds();
  const newItems = items.filter((it) => !posted.has(it.id));
  console.log(`  → 新規 ${newItems.length} 件 / 既存 ${items.length - newItems.length} 件`);

  if (newItems.length === 0) {
    console.log("新規作品なし。終了します。");
    return;
  }

  console.log("[3/4] 投稿生成プロンプトを取得中...");
  const systemPrompt = await fetchAffiliatePrompt();
  if (!systemPrompt) {
    console.error("アフィリエイト_プロンプト シートのA1が空です。init-affiliate-sheets を実行してください。");
    process.exit(1);
  }

  console.log(`[4/4] Claude で投稿文を生成中（${newItems.length} 件）...`);
  let success = 0;
  let failed = 0;

  for (const item of newItems) {
    try {
      const postText = await generatePostText(item, systemPrompt);

      if (args.dryRun) {
        console.log("\n--- DRY RUN ---");
        console.log(`[${item.id}] ${item.title}`);
        console.log(postText);
        console.log(item.affiliateURL);
      } else {
        await appendPostCandidate({
          itemId: item.id,
          title: item.title,
          postText,
          affiliateURL: item.affiliateURL,
          imageURL: item.imageURL,
        });
      }

      success++;
      process.stdout.write(`  ✓ [${success}/${newItems.length}] ${item.title.slice(0, 40)}\n`);
    } catch (err) {
      failed++;
      console.error(`  ✗ [${item.id}] ${err.message}`);
    }
  }

  console.log(`\n--- 完了 ---`);
  console.log(`成功: ${success} 件 / 失敗: ${failed} 件`);
  if (!args.dryRun) {
    console.log(`\nスプシURL: https://docs.google.com/spreadsheets/d/${process.env.SPREADSHEET_ID}/edit`);
    console.log("「アフィリエイト_候補」シートを開いて、投稿文+リンクをXに手動投稿してください。");
  }
}

main().catch((err) => {
  console.error("エラー:", err.message);
  console.error(err.stack);
  process.exit(1);
});
