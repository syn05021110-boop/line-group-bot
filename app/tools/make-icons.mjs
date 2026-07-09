/**
 * PWA用アイコンを依存ライブラリなしで生成する（pure Node）。
 * ブランド色のグラデ背景 + クリームのカード + 3本の下書きバー
 * = 「下書きドキュメント」を表す最小デザイン。
 *
 * 生成物: public/icons/icon-192.png / icon-512.png / apple-touch-icon.png (180)
 * 実行: node tools/make-icons.mjs
 */

import { deflateSync } from "zlib";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";

const OUT = join(dirname(import.meta.url.replace("file://", "")), "..", "public", "icons");
mkdirSync(OUT, { recursive: true });

/* ---- 色 ---- */
const lerp = (a, b, t) => Math.round(a + (b - a) * t);
const BG_TOP = [233, 150, 124];
const BG_BOT = [198, 90, 61];
const CREAM = [250, 247, 242];
const BRAND = [224, 122, 95];
const ACCENT = [61, 90, 128];

/** 角丸矩形の内包判定 */
function inRoundRect(px, py, x0, y0, x1, y1, r) {
  if (px < x0 || px > x1 || py < y0 || py > y1) return false;
  // 各コーナーの外側だけ丸める
  const cx = px < x0 + r ? x0 + r : px > x1 - r ? x1 - r : px;
  const cy = py < y0 + r ? y0 + r : py > y1 - r ? y1 - r : py;
  const dx = px - cx;
  const dy = py - cy;
  return dx * dx + dy * dy <= r * r;
}

/** 1ピクセルの色を決める */
function pixel(x, y, S) {
  const t = y / S;
  let col = [lerp(BG_TOP[0], BG_BOT[0], t), lerp(BG_TOP[1], BG_BOT[1], t), lerp(BG_TOP[2], BG_BOT[2], t)];

  // カード（中央、セーフゾーン内 ≈ 64%）
  const m = S * 0.18;
  const cx0 = m, cy0 = m, cx1 = S - m, cy1 = S - m;
  const cardR = S * 0.14;
  if (inRoundRect(x, y, cx0, cy0, cx1, cy1, cardR)) {
    col = CREAM;

    // 下書きバー（3本）
    const cw = cx1 - cx0;
    const barX = cx0 + cw * 0.16;
    const barH = S * 0.055;
    const barR = barH / 2;
    const gap = barH * 1.6;
    const groupTop = (cy0 + cy1) / 2 - (barH * 3 + gap * 2) / 2;
    const bars = [
      { w: cw * 0.62, c: BRAND },
      { w: cw * 0.7, c: ACCENT },
      { w: cw * 0.44, c: BRAND },
    ];
    for (let i = 0; i < bars.length; i++) {
      const by0 = groupTop + i * (barH + gap);
      const by1 = by0 + barH;
      if (inRoundRect(x, y, barX, by0, barX + bars[i].w, by1, barR)) {
        col = bars[i].c;
        break;
      }
    }
  }
  return [col[0], col[1], col[2], 255];
}

/* ---- PNG エンコード ---- */
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function makePNG(S) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(S, 0);
  ihdr.writeUInt32BE(S, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  // 10,11,12 = 0

  const raw = Buffer.alloc(S * (S * 4 + 1));
  let p = 0;
  for (let y = 0; y < S; y++) {
    raw[p++] = 0; // filter: none
    for (let x = 0; x < S; x++) {
      const [r, g, b, a] = pixel(x, y, S);
      raw[p++] = r;
      raw[p++] = g;
      raw[p++] = b;
      raw[p++] = a;
    }
  }

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

for (const [name, size] of [
  ["icon-192.png", 192],
  ["icon-512.png", 512],
  ["apple-touch-icon.png", 180],
]) {
  writeFileSync(join(OUT, name), makePNG(size));
  console.log("生成:", name, `(${size}x${size})`);
}
