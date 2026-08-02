#!/usr/bin/env node
/**
 * timeline.json から縦型動画を組み立てる（ffmpeg）。
 *
 *   node drama/tools/animatic.mjs --dry-run     # 実行せずコマンドだけ表示
 *   node drama/tools/animatic.mjs               # 全カットを繋いで書き出す
 *   node drama/tools/animatic.mjs --cut C12     # 1カットだけ確認
 *   node drama/tools/animatic.mjs --audio ep01/assets/audio/mix.wav
 *
 * type:"clip" のカットは clips/<id>.mp4 があればそれを使い、無ければ静止画に
 * フォールバックする。**つまり i2v を1本も作っていなくても通しの動画が出る。**
 * 先にこれで尺とテンポを固めてから、動かすカットだけ差し替えるのが速い。
 *
 * 必要なもの: ffmpeg と日本語フォント。
 *   macOS   brew install ffmpeg
 *   Ubuntu  sudo apt install ffmpeg fonts-noto-cjk
 */

import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const run = promisify(execFile);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ASSETS = path.join(ROOT, 'ep01', 'assets');
const OUT = path.join(ROOT, 'ep01', 'out');
const TMP = path.join(OUT, '.tmp');

const argv = process.argv.slice(2);
const DRY = argv.includes('--dry-run');
const cutIdx = argv.indexOf('--cut');
const only = cutIdx >= 0 ? argv[cutIdx + 1] : null;
const audio = argv.includes('--audio') ? argv[argv.indexOf('--audio') + 1] : null;

const die = (m) => { console.error(`\n✗ ${m}\n`); process.exit(1); };

const FONT_CANDIDATES = [
  process.env.TELOP_FONT,
  '/System/Library/Fonts/ヒラギノ角ゴシック W6.ttc',
  '/System/Library/Fonts/Hiragino Sans GB.ttc',
  '/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc',
  '/usr/share/fonts/truetype/noto/NotoSansCJK-Bold.ttc',
  'C:/Windows/Fonts/meiryob.ttc',
].filter(Boolean);

function findFont() {
  const found = FONT_CANDIDATES.find((f) => existsSync(f));
  if (!found && !DRY) {
    die(
      '日本語フォントが見つかりません。\n' +
        '  TELOP_FONT=/path/to/font.ttc を指定するか、日本語フォントを入れてください。\n' +
        '  Ubuntu: sudo apt install fonts-noto-cjk'
    );
  }
  return found || '<FONT_NOT_FOUND>';
}

/** 全角前提でざっくり折り返す。句読点が行頭に来ないよう軽く調整する。 */
function wrap(text, max) {
  const lines = [];
  let line = '';
  for (const ch of text) {
    if (line.length >= max && !'。、」』！？'.includes(ch)) {
      lines.push(line);
      line = '';
    }
    line += ch;
  }
  if (line) lines.push(line);
  return lines.join('\n');
}

/** 素材の実体パスを解決する。clip は mp4 を優先し、無ければ静止画に落とす。 */
function resolveSource(cut) {
  if (cut.type === 'black') return { kind: 'black' };

  if (cut.type === 'clip') {
    const clip = path.join(ASSETS, 'clips', `${cut.id}.mp4`);
    if (existsSync(clip)) return { kind: 'clip', file: clip };
  }
  const still = path.join(ASSETS, `${cut.src}.png`);
  if (!existsSync(still) && !DRY) {
    die(`${cut.id} の素材がありません: ${path.relative(ROOT, still)}\n  先に画像を生成してください。`);
  }
  return { kind: 'still', file: still, fellBack: cut.type === 'clip' };
}

function motionFilter(motion, frames, W, H) {
  // ズーム前に一度大きく作らないと zoompan が階段状にガタつく
  const pre = `scale=${W * 2}:${H * 2}:force_original_aspect_ratio=increase,crop=${W * 2}:${H * 2}`;
  const zp = (z, x, y) =>
    `${pre},zoompan=z='${z}':x='${x}':y='${y}':d=${frames}:s=${W}x${H}:fps=30`;
  const cx = 'iw/2-(iw/zoom/2)';
  const cy = 'ih/2-(ih/zoom/2)';

  switch (motion) {
    case 'push_in':
      return zp(`min(zoom+0.0012,1.25)`, cx, cy);
    case 'pull_out':
      return zp(`if(lte(zoom,1.0),1.25,max(1.0,zoom-0.0012))`, cx, cy);
    case 'pan_right':
      return zp('1.2', `min(on/${frames}*(iw-iw/zoom),iw-iw/zoom)`, cy);
    case 'pan_left':
      return zp('1.2', `max((1-on/${frames})*(iw-iw/zoom),0)`, cy);
    default: // hold
      return `${pre},scale=${W}:${H}`;
  }
}

async function telopFilter(cut, tl, font) {
  if (!cut.telop) return null;
  const txt = path.join(TMP, `${cut.id}.txt`);
  if (!DRY) await writeFile(txt, wrap(cut.telop, tl.telop.wrapChars), 'utf8');
  // textfile を使うのは、日本語と記号のエスケープ地獄を避けるため
  return [
    `drawtext=fontfile='${font}'`,
    `textfile='${txt}'`,
    'fontcolor=white',
    `fontsize=${tl.telop.fontSize}`,
    'borderw=5',
    'bordercolor=black',
    'line_spacing=14',
    'x=(w-text_w)/2',
    `y=${cut.telopY ?? tl.telop.y}`,
  ].join(':');
}

async function renderCut(cut, tl, font) {
  const { width: W, height: H, fps } = tl.output;
  const dur = cut.end - cut.start;
  const frames = Math.round(dur * fps);
  const src = resolveSource(cut);
  const out = path.join(TMP, `${cut.id}.mp4`);

  const input =
    src.kind === 'black'
      ? ['-f', 'lavfi', '-i', `color=c=black:s=${W}x${H}:d=${dur}:r=${fps}`]
      : src.kind === 'clip'
        ? ['-i', src.file]
        : ['-loop', '1', '-t', String(dur), '-i', src.file];

  const chain = [];
  if (src.kind === 'clip') {
    chain.push(`scale=${W}:${H}:force_original_aspect_ratio=increase`, `crop=${W}:${H}`, `fps=${fps}`);
  } else if (src.kind === 'still') {
    chain.push(motionFilter(cut.motion, frames, W, H));
  }
  chain.push('setsar=1');

  const telop = await telopFilter(cut, tl, font);
  if (telop) chain.push(telop);

  const args = [
    '-y', ...input,
    '-t', String(dur),
    '-vf', chain.join(','),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18',
    '-pix_fmt', 'yuv420p', '-r', String(fps),
    '-an', out,
  ];

  const label = src.fellBack ? `${cut.id} (静止画で代用)` : cut.id;
  console.log(`  ${label.padEnd(22)} ${dur}s  ${cut.motion}`);
  if (DRY) {
    console.log(`    ffmpeg ${args.map((a) => (a.includes(' ') ? `"${a}"` : a)).join(' ')}\n`);
    return out;
  }
  await run('ffmpeg', args);
  return out;
}

// ---- 実行 ----

const tl = JSON.parse(await readFile(path.join(ROOT, 'timeline.json'), 'utf8'));
const cuts = only ? tl.cuts.filter((c) => c.id === only) : tl.cuts;
if (!cuts.length) die(`カット ${only} は timeline.json にありません`);

const total = tl.cuts.at(-1).end;
if (total > 60) console.warn(`! 総尺 ${total}秒。ショートは60秒以内に収めること。\n`);

const font = findFont();
if (!DRY) {
  await rm(TMP, { recursive: true, force: true });
  await mkdir(TMP, { recursive: true });
}
console.log(`\nフォント: ${font}\n${cuts.length}カットを書き出します\n`);

const files = [];
for (const cut of cuts) files.push(await renderCut(cut, tl, font));

const outFile = path.join(OUT, only ? `${only}.mp4` : 'animatic.mp4');
if (DRY) {
  console.log(`\n（dry-run）結合先: ${path.relative(ROOT, outFile)}\n`);
  process.exit(0);
}

if (files.length === 1) {
  await run('cp', [files[0], outFile]);
} else {
  const list = path.join(TMP, 'concat.txt');
  await writeFile(list, files.map((f) => `file '${f}'`).join('\n'), 'utf8');
  const args = ['-y', '-f', 'concat', '-safe', '0', '-i', list];
  // 音声を渡されたら映像は再エンコードせずに多重化する
  if (audio) args.push('-i', audio, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest');
  else args.push('-c', 'copy');
  args.push(outFile);
  await run('ffmpeg', args);
}

await rm(TMP, { recursive: true, force: true });
console.log(`\n完了: ${path.relative(ROOT, outFile)}  (${total}秒)\n`);
console.log('確認: 音を消しても意味が通るか / 0〜3秒で引きがあるか / ラスト5秒で反転しているか\n');
