#!/usr/bin/env node
/**
 * 静止画を動画にする（image-to-video）。Google Veo を Gemini API 経由で叩く。
 *
 *   export GEMINI_API_KEY=...
 *   node drama/tools/video.mjs --list      # 動かす対象のカット一覧
 *   node drama/tools/video.mjs C1          # 1カットだけ
 *   node drama/tools/video.mjs --all       # timeline の clip カット全部
 *
 * 元画像と i2v プロンプトは timeline.json から読む。
 * 出力は drama/ep01/assets/clips/<id>.mp4。animatic.mjs が自動で拾う。
 *
 * 【重要】動かすのは表情が動く5カットだけでいい。全カット動かすと破綻と費用が
 * 跳ね上がるうえ、55秒では誰も気づかない。README の方針を参照。
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = path.join(ROOT, 'ep01', 'assets');
const CLIPS = path.join(ASSETS, 'clips');

// Veo はモデル名の変動が激しい。動かない場合は公式ドキュメントで現行IDを確認して
// GEMINI_VIDEO_MODEL で差し替えること。
const MODEL = process.env.GEMINI_VIDEO_MODEL || 'veo-3.0-generate-preview';
const BASE = 'https://generativelanguage.googleapis.com/v1beta';

const die = (m) => { console.error(`\n✗ ${m}\n`); process.exit(1); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const headers = () => ({ 'x-goog-api-key': process.env.GEMINI_API_KEY, 'content-type': 'application/json' });

/**
 * レスポンスの形はAPIバージョンで変わるので、決め打ちせずに動画URIを再帰的に探す。
 * base64 が直接返る場合もあるため両方拾う。
 */
function findVideo(node) {
  if (!node || typeof node !== 'object') return null;
  for (const [key, value] of Object.entries(node)) {
    if (typeof value === 'string') {
      if (/^https?:\/\//.test(value) && /video|\.mp4|file/i.test(key + value)) return { uri: value };
      if (value.length > 10000 && /bytes|data|b64/i.test(key)) return { b64: value };
    } else {
      const hit = findVideo(value);
      if (hit) return hit;
    }
  }
  return null;
}

async function generate(cut) {
  const still = path.join(ASSETS, `${cut.src}.png`);
  if (!existsSync(still)) die(`${cut.id} の元画像がありません: ${path.relative(ROOT, still)}`);
  if (!cut.i2v) die(`${cut.id} に i2v プロンプトが定義されていません`);

  const seconds = Math.min(Math.ceil(cut.end - cut.start), 8);
  process.stdout.write(`${cut.id} (${seconds}s) 生成開始 … `);

  const start = await fetch(`${BASE}/models/${MODEL}:predictLongRunning`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      instances: [{
        prompt: cut.i2v,
        image: { bytesBase64Encoded: (await readFile(still)).toString('base64'), mimeType: 'image/png' },
      }],
      parameters: { aspectRatio: '9:16', durationSeconds: seconds, sampleCount: 1 },
    }),
  });
  if (!start.ok) {
    console.log('失敗');
    die(`API エラー ${start.status}\n${(await start.text()).slice(0, 800)}`);
  }

  const { name } = await start.json();
  if (!name) die('オペレーション名が返りませんでした。APIの仕様変更の可能性があります。');

  // 動画生成は数分かかる。10秒ごとに最大10分待つ。
  let op;
  for (let i = 0; i < 60; i++) {
    await sleep(10_000);
    process.stdout.write('.');
    const poll = await fetch(`${BASE}/${name}`, { headers: headers() });
    if (!poll.ok) die(`ポーリング失敗 ${poll.status}\n${(await poll.text()).slice(0, 400)}`);
    op = await poll.json();
    if (op.done) break;
  }
  if (!op?.done) die(`${cut.id}: 10分待っても完了しませんでした。時間をおいて再試行してください。`);
  if (op.error) die(`${cut.id}: 生成エラー\n${JSON.stringify(op.error).slice(0, 500)}`);

  const found = findVideo(op.response);
  if (!found) die(`動画データが見つかりません。\n${JSON.stringify(op.response).slice(0, 600)}`);

  const bytes = found.b64
    ? Buffer.from(found.b64, 'base64')
    : Buffer.from(await (await fetch(found.uri, { headers: headers() })).arrayBuffer());

  await mkdir(CLIPS, { recursive: true });
  const out = path.join(CLIPS, `${cut.id}.mp4`);
  await writeFile(out, bytes);
  console.log(` → ${path.relative(ROOT, out)} (${(bytes.length / 1e6).toFixed(1)}MB)`);
  if (cut.note) console.log(`   ${cut.note}`);
}

// ---- 実行 ----

const tl = JSON.parse(await readFile(path.join(ROOT, 'timeline.json'), 'utf8'));
const argv = process.argv.slice(2);
const clipCuts = tl.cuts.filter((c) => c.type === 'clip');

if (argv.includes('--list')) {
  console.log('\n動かす対象:\n');
  for (const c of clipCuts) {
    const done = existsSync(path.join(CLIPS, `${c.id}.mp4`)) ? '✓' : ' ';
    console.log(`${done} ${c.id.padEnd(5)} ${String(c.end - c.start).padStart(2)}s  ${c.src}`);
    console.log(`      ${c.i2v}\n`);
  }
  process.exit(0);
}

if (!process.env.GEMINI_API_KEY) die('GEMINI_API_KEY が未設定です。');

const targets = argv.includes('--all')
  ? clipCuts
  : clipCuts.filter((c) => argv.includes(c.id));
if (!targets.length) die('対象を指定してください。一覧: node drama/tools/video.mjs --list');

console.log(`\nモデル: ${MODEL} / ${targets.length}本\n`);
for (const cut of targets) await generate(cut);
console.log(`\n完了。node drama/tools/animatic.mjs で通しを書き出すと自動で差し替わります。\n`);
