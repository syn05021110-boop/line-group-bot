#!/usr/bin/env node
/**
 * 第1話の素材を Gemini の画像生成APIでまとめて作るスクリプト。
 *
 * 使い方:
 *   export GEMINI_API_KEY=...
 *   node drama/tools/generate.mjs akari_master            # 1つだけ作る
 *   node drama/tools/generate.mjs akari_master --n 4      # 4案まとめて出す
 *   node drama/tools/generate.mjs --list                  # 対象一覧を見る
 *   node drama/tools/generate.mjs --all                   # 依存順に全部作る
 *
 * 参照画像（ref）は自動で添付される。akari_freeze を作るには akari_master が
 * 先に確定していないといけない。無ければエラーで止まる。
 *
 * 出力は drama/ep01/assets/<dir>/<name>_v<N>.png。既存ファイルは上書きしない。
 * 気に入った版を <name>.png にリネームすると、それが以降の参照元になる。
 */

import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = path.join(ROOT, 'ep01', 'assets');

// 画像生成モデル。提供状況が変わりやすいので env で差し替えられるようにしてある。
// うまく動かないときは Google の公式ドキュメントで現行のモデルIDを確認すること。
const MODEL = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
const ENDPOINT = (model) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

function die(msg) {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

/** 参照画像として渡す1枚を探す。<name>.png が確定版、無ければ最新の _vN を使う。 */
async function findRef(spec, name) {
  const dir = path.join(ASSETS, spec.targets[name].dir);
  const confirmed = path.join(dir, `${name}.png`);
  if (existsSync(confirmed)) return confirmed;

  if (!existsSync(dir)) return null;
  const versions = (await readdir(dir))
    .filter((f) => f.startsWith(`${name}_v`) && f.endsWith('.png'))
    .sort((a, b) => versionOf(a) - versionOf(b));
  if (!versions.length) return null;

  const latest = path.join(dir, versions[versions.length - 1]);
  console.warn(
    `  ! 参照に未確定版を使います: ${path.basename(latest)}\n` +
      `    確定したら ${name}.png にリネームしてください`
  );
  return latest;
}

const versionOf = (filename) => Number(filename.match(/_v(\d+)\.png$/)?.[1] ?? 0);

/** 既存の _vN を見て次の番号を返す。上書きは絶対にしない。 */
async function nextVersion(dir, name) {
  if (!existsSync(dir)) return 1;
  const used = (await readdir(dir))
    .filter((f) => f.startsWith(`${name}_v`) && f.endsWith('.png'))
    .map(versionOf);
  return used.length ? Math.max(...used) + 1 : 1;
}

function buildPrompt(spec, target) {
  const negative = [spec.negative, target.negativeExtra].filter(Boolean).join(', ');
  return [
    target.prompt,
    spec.aspect[target.aspect ?? 'cut'],
    spec.style,
    // Gemini の画像生成にはネガティブプロンプト専用の項目がないので本文に畳み込む
    `Avoid: ${negative}.`,
  ].join('\n\n');
}

async function callApi(parts, modalities) {
  const res = await fetch(ENDPOINT(MODEL), {
    method: 'POST',
    headers: {
      'x-goog-api-key': process.env.GEMINI_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts }],
      generationConfig: { responseModalities: modalities },
    }),
  });
  return res;
}

async function generateOne(spec, name, index, total) {
  const target = spec.targets[name];
  const outDir = path.join(ASSETS, target.dir);
  await mkdir(outDir, { recursive: true });

  const parts = [];
  for (const refName of target.ref ?? []) {
    const refPath = await findRef(spec, refName);
    if (!refPath) {
      die(
        `${name} は ${refName} を参照しますが、まだ生成されていません。\n` +
          `  先に: node drama/tools/generate.mjs ${refName}`
      );
    }
    parts.push({
      inline_data: { mime_type: 'image/png', data: (await readFile(refPath)).toString('base64') },
    });
  }
  parts.push({ text: buildPrompt(spec, target) });

  process.stdout.write(`[${index}/${total}] ${name} … `);

  // モデルによって responseModalities の受け付け方が違うので、IMAGE 単独で
  // 弾かれたら TEXT+IMAGE で1度だけやり直す
  let res = await callApi(parts, ['IMAGE']);
  if (!res.ok && (await res.clone().text()).includes('responseModalities')) {
    res = await callApi(parts, ['TEXT', 'IMAGE']);
  }
  if (!res.ok) {
    console.log('失敗');
    die(`API エラー ${res.status}\n${(await res.text()).slice(0, 800)}`);
  }

  const body = await res.json();
  const image = body.candidates?.[0]?.content?.parts?.find(
    (p) => p.inlineData?.data || p.inline_data?.data
  );
  if (!image) {
    console.log('画像なし');
    const reason = body.candidates?.[0]?.finishReason;
    die(
      `画像が返りませんでした${reason ? `（finishReason: ${reason}）` : ''}。\n` +
        `  安全フィルタに当たった可能性があります。プロンプトの恐怖表現を弱めてください。\n` +
        JSON.stringify(body).slice(0, 500)
    );
  }

  const v = await nextVersion(outDir, name);
  const outPath = path.join(outDir, `${name}_v${v}.png`);
  await writeFile(outPath, Buffer.from(image.inlineData?.data ?? image.inline_data.data, 'base64'));
  console.log(`→ ${path.relative(ROOT, outPath)}`);
  if (target.note) console.log(`      ${target.note}`);
}

// ---- エントリポイント ----

const spec = JSON.parse(await readFile(path.join(ROOT, 'prompts.json'), 'utf8'));
const argv = process.argv.slice(2);

if (argv.includes('--list')) {
  for (const name of spec.order) {
    const t = spec.targets[name];
    const refs = t.ref?.length ? ` ← ${t.ref.join(', ')}` : '';
    console.log(`${name.padEnd(22)} ${t.dir.padEnd(5)}${refs}`);
  }
  process.exit(0);
}

if (!process.env.GEMINI_API_KEY) {
  die('GEMINI_API_KEY が未設定です。\n  export GEMINI_API_KEY=... を実行してから再試行してください。');
}

const nFlag = argv.indexOf('--n');
const variants = nFlag >= 0 ? Number(argv[nFlag + 1]) : 1;
const names = argv.includes('--all')
  ? spec.order
  : argv.filter((a, i) => !a.startsWith('--') && (nFlag < 0 || i !== nFlag + 1));

if (!names.length) die('生成対象を指定してください。一覧: node drama/tools/generate.mjs --list');
for (const n of names) if (!spec.targets[n]) die(`未知の対象: ${n}`);

const jobs = names.flatMap((n) => Array.from({ length: variants }, () => n));
console.log(`\nモデル: ${MODEL} / ${jobs.length}枚 生成します\n`);

for (const [i, name] of jobs.entries()) {
  await generateOne(spec, name, i + 1, jobs.length);
  if (i < jobs.length - 1) await new Promise((r) => setTimeout(r, 1500)); // レート制限よけ
}

console.log(`\n完了。気に入った版を <name>.png にリネームすると、以降の参照元になります。`);
console.log(`判定基準は drama/ep01/character-sheet.md の「7. リテイク判定」を参照。\n`);
