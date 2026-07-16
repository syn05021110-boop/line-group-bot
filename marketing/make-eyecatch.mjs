import pkg from '/opt/node22/lib/node_modules/playwright/index.js';
import { readFileSync, readdirSync } from 'fs';
const { chromium } = pkg;

const files = readdirSync('marketing/notes').filter(f => /^note-\d+\.md$/.test(f)).sort();

// タイトルからカテゴリ（Apple風の静かなラベル）を推定
function category(title) {
  if (/Threads/i.test(title)) return 'Threads';
  if (/Instagram/i.test(title)) return 'Instagram';
  if (/(^|[^A-Za-z])X(で| )/.test(title)) return 'X';
  if (/note/i.test(title)) return 'note';
  if (/AI/.test(title)) return 'AI活用';
  if (/棚卸し|強み|言語化/.test(title)) return '強み棚卸し';
  if (/続|やめる|仕組み|時間|設計/.test(title)) return '継続の技術';
  if (/フォロワー|信頼|発信|ネタ/.test(title)) return '発信の型';
  return '副業の始め方';
}

// Apple風：真っ黒・中央寄せ・巨大タイポ・余白・上品な一色アクセント
const template = (title, num, cat) => `<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
body{width:1280px;height:670px;overflow:hidden}
.card{position:relative;width:1280px;height:670px;background:#000;color:#f5f5f7;
 font-family:-apple-system,'SF Pro Display','Helvetica Neue','Hiragino Sans','Noto Sans JP',sans-serif;
 display:flex;flex-direction:column;align-items:center;justify-content:center;
 text-align:center;padding:96px 110px;overflow:hidden}
/* ごく控えめな単一グロー（Appleキーノート風） */
.card::before{content:"";position:absolute;inset:0;background:
 radial-gradient(58% 46% at 50% 40%,rgba(118,92,255,.16),transparent 72%);}
.card::after{content:"";position:absolute;left:0;right:0;bottom:0;height:42%;
 background:radial-gradient(80% 100% at 50% 100%,rgba(236,72,153,.08),transparent 70%);}
.eyebrow{position:relative;z-index:2;font-size:27px;font-weight:600;letter-spacing:.14em;
 margin-bottom:38px;text-transform:none;
 background:linear-gradient(90deg,#a9b6ff,#f0a6ff);-webkit-background-clip:text;background-clip:text;color:transparent}
.title{position:relative;z-index:2;font-size:70px;font-weight:700;line-height:1.34;
 letter-spacing:-.02em;max-width:1060px;color:#f5f5f7}
.brand{position:absolute;z-index:2;bottom:52px;left:0;right:0;text-align:center;
 font-size:24px;font-weight:600;letter-spacing:.02em;color:#6e6e78}
.idx{position:absolute;z-index:2;bottom:52px;right:64px;font-size:22px;font-weight:600;
 letter-spacing:.06em;color:#3a3a42}
</style></head><body><div class="card">
<div class="eyebrow">${cat}</div>
<div class="title">${title.replace(/</g, '&lt;')}</div>
<div class="brand">副業ドラフト</div>
<div class="idx">${String(num).padStart(2, '0')} / 20</div>
</div></body></html>`;

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1280, height: 670 }, deviceScaleFactor: 2 });
for (const f of files) {
  const num = f.match(/(\d+)/)[1];
  const title = readFileSync('marketing/notes/' + f, 'utf8').split('\n')[0].replace(/^#\s*/, '');
  const cat = category(title);
  await p.setContent(template(title, num, cat), { waitUntil: 'load' });
  await p.waitForTimeout(120);
  await p.screenshot({ path: `marketing/note-images/note-${num}.png` });
}
await b.close();
console.log('done', files.length);
