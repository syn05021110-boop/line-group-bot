/**
 * アフィリエイト自動投稿デーモン
 *
 * 動作:
 *   - 起動時に1回、その後 GENERATE_INTERVAL_HOURS ごとに DMM/FANZA から新作を取得して
 *     Claude で投稿文を生成し、スプシに追記する
 *   - 起動時に1回、その後 POST_INTERVAL_HOURS ごとに「アフィリエイト_候補」シートから
 *     未投稿の候補を1件取り出して X に投稿し、ステータスを更新する
 *
 * 実行:
 *   npm run auto-post
 *
 * Render.com では Background Worker としてデプロイ推奨。
 *
 * 環境変数（オプション）:
 *   POST_INTERVAL_HOURS      投稿間隔（時間、デフォルト 4）
 *   GENERATE_INTERVAL_HOURS  候補生成間隔（時間、デフォルト 24）
 *   POSTS_PER_GENERATION     1回の生成サイクルで作る候補数（デフォルト 10）
 *   DMM_FLOOR / DMM_SORT     生成時の検索条件
 */

import dotenv from "dotenv";
import { join, dirname } from "path";
import { fetchItems } from "../lib/dmm.mjs";
import { generatePostText } from "../lib/affiliate.mjs";
import { postTweet } from "../lib/x-poster.mjs";
import {
  fetchAffiliatePrompt,
  fetchPostedItemIds,
  appendPostCandidate,
  fetchUnpostedCandidates,
  updateCandidateStatus,
} from "../lib/sheets.mjs";

const PROJECT_ROOT = join(dirname(import.meta.url.replace("file://", "")), "..");
dotenv.config({ path: join(PROJECT_ROOT, ".env") });

const POST_INTERVAL_HOURS = Number(process.env.POST_INTERVAL_HOURS || 4);
const GENERATE_INTERVAL_HOURS = Number(process.env.GENERATE_INTERVAL_HOURS || 24);
const POSTS_PER_GENERATION = Number(process.env.POSTS_PER_GENERATION || 10);

const POST_INTERVAL_MS = POST_INTERVAL_HOURS * 60 * 60 * 1000;
const GENERATE_INTERVAL_MS = GENERATE_INTERVAL_HOURS * 60 * 60 * 1000;

function nowJst() {
  return new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
}

async function runGenerationCycle() {
  console.log(`\n[${nowJst()}] 候補生成サイクル開始`);
  try {
    const items = await fetchItems({
      apiId: process.env.DMM_API_ID,
      affiliateId: process.env.DMM_AFFILIATE_ID,
      site: process.env.DMM_SITE || "FANZA",
      service: process.env.DMM_SERVICE || "digital",
      floor: process.env.DMM_FLOOR || "videoa",
      sort: process.env.DMM_SORT || "rank",
      hits: Math.min(POSTS_PER_GENERATION * 3, 100),
    });

    const posted = await fetchPostedItemIds();
    const newItems = items
      .filter((it) => !posted.has(it.id))
      .slice(0, POSTS_PER_GENERATION);

    if (newItems.length === 0) {
      console.log("  → 新規作品なし");
      return;
    }

    const systemPrompt = await fetchAffiliatePrompt();
    if (!systemPrompt) {
      console.error("  → アフィリエイト_プロンプト の A1 が空です");
      return;
    }

    let ok = 0;
    let ng = 0;
    for (const item of newItems) {
      try {
        const postText = await generatePostText(item, systemPrompt);
        await appendPostCandidate({
          itemId: item.id,
          title: item.title,
          postText,
          affiliateURL: item.affiliateURL,
          imageURL: item.imageURL,
        });
        ok++;
      } catch (err) {
        ng++;
        console.error(`  ✗ [${item.id}] ${err.message}`);
      }
    }
    console.log(`  → 生成完了: 成功${ok} / 失敗${ng}`);
  } catch (err) {
    console.error(`[generate] 致命的エラー: ${err.message}`);
  }
}

async function runPostCycle() {
  console.log(`\n[${nowJst()}] 投稿サイクル開始`);
  try {
    const candidates = await fetchUnpostedCandidates(1);
    if (candidates.length === 0) {
      console.log("  → 未投稿候補なし、スキップ");
      return;
    }

    const c = candidates[0];
    const fullText = `${c.postText}\n\n${c.affiliateURL}`;

    try {
      const result = await postTweet({ text: fullText, imageUrl: c.imageURL });
      await updateCandidateStatus(c.rowIndex, `投稿済 ${result.url}`);
      console.log(`  ✓ 投稿成功: ${c.title.slice(0, 40)}`);
      console.log(`    ${result.url}`);
    } catch (err) {
      await updateCandidateStatus(c.rowIndex, `失敗: ${err.message.slice(0, 200)}`);
      console.error(`  ✗ 投稿失敗: ${err.message}`);
    }
  } catch (err) {
    console.error(`[post] 致命的エラー: ${err.message}`);
  }
}

function validateEnv() {
  const required = [
    "DMM_API_ID",
    "DMM_AFFILIATE_ID",
    "ANTHROPIC_API_KEY",
    "SPREADSHEET_ID",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "X_API_KEY",
    "X_API_SECRET",
    "X_ACCESS_TOKEN",
    "X_ACCESS_TOKEN_SECRET",
  ];
  const missing = required.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    console.error("以下の環境変数が未設定です:");
    missing.forEach((k) => console.error(`  - ${k}`));
    process.exit(1);
  }
}

async function main() {
  validateEnv();

  console.log("=".repeat(60));
  console.log("アフィリエイト自動投稿デーモン起動");
  console.log(`  投稿間隔:   ${POST_INTERVAL_HOURS} 時間ごと（≒${Math.round(24 / POST_INTERVAL_HOURS)}投稿/日）`);
  console.log(`  生成間隔:   ${GENERATE_INTERVAL_HOURS} 時間ごと`);
  console.log(`  生成数/回:  ${POSTS_PER_GENERATION} 件`);
  console.log("=".repeat(60));

  // 起動時の初回実行: まず候補を補充してから投稿
  await runGenerationCycle();
  await runPostCycle();

  // 定期実行のスケジュール
  setInterval(runPostCycle, POST_INTERVAL_MS);
  setInterval(runGenerationCycle, GENERATE_INTERVAL_MS);

  console.log(`\n[${nowJst()}] デーモン継続実行中...`);
}

// SIGTERM などで graceful に止まれるようにする
process.on("SIGTERM", () => {
  console.log("\nSIGTERM 受信、シャットダウン");
  process.exit(0);
});
process.on("SIGINT", () => {
  console.log("\nSIGINT 受信、シャットダウン");
  process.exit(0);
});

main().catch((err) => {
  console.error("起動エラー:", err.message);
  console.error(err.stack);
  process.exit(1);
});
