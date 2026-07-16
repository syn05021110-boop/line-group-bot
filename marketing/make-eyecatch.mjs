import pkg from '/opt/node22/lib/node_modules/playwright/index.js';
import { readFileSync, readdirSync } from 'fs';
const { chromium } = pkg;

const files = readdirSync('marketing/notes').filter(f => /^note-\d+\.md$/.test(f)).sort();

// タイトルからカテゴリを推定（note一覧での識別性UP）
function category(title) {
  if (/Threads/i.test(title)) return 'Threads攻略';
  if (/Instagram/i.test(title)) return 'Instagram';
  if (/(^|[^A-Za-z])X(で| )/.test(title)) return 'X（旧Twitter）';
  if (/note/i.test(title)) return 'note術';
  if (/AI/.test(title)) return 'AI活用';
  if (/棚卸し|強み|言語化/.test(title)) return '強み棚卸し';
  if (/続|やめる|仕組み|時間|設計/.test(title)) return '継続の技術';
  if (/フォロワー|信頼|発信|ネタ/.test(title)) return '発信の型';
  return '副業の始め方';
}

const template = (title, num, cat) => `<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
body{width:1280px;height:670px;font-family:'Hiragino Sans','Noto Sans JP',sans-serif;overflow:hidden}
.card{position:relative;width:1280px;height:670px;background:#07070d;color:#fff;padding:66px 76px;
 display:flex;flex-direction:column;justify-content:center;overflow:hidden}
/* 奥行きのあるグラデーション光源 */
.card::before{content:"";position:absolute;inset:0;background:
 radial-gradient(38% 55% at 8% 0%,rgba(99,102,241,.55),transparent 60%),
 radial-gradient(42% 50% at 102% 12%,rgba(236,72,153,.40),transparent 58%),
 radial-gradient(46% 52% at 88% 108%,rgba(168,85,247,.42),transparent 60%),
 radial-gradient(60% 60% at 50% 130%,rgba(56,189,248,.14),transparent 60%);}
/* 細かいグリッド */
.card::after{content:"";position:absolute;inset:0;opacity:.5;background-image:
 linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),
 linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);
 background-size:52px 52px;mask-image:radial-gradient(75% 75% at 50% 45%,#000 55%,transparent 100%)}
.inner{position:relative;z-index:2}
.top{position:absolute;top:56px;left:76px;right:76px;z-index:2;display:flex;align-items:center;justify-content:space-between}
.badge{display:inline-flex;align-items:center;gap:12px;font-size:25px;font-weight:800;color:#d7d3ff;letter-spacing:.02em}
.dot{width:15px;height:15px;border-radius:50%;background:linear-gradient(120deg,#6366f1,#a855f7,#ec4899);box-shadow:0 0 18px rgba(168,85,247,.8)}
.cat{font-size:23px;font-weight:800;color:#fff;padding:11px 22px;border-radius:999px;
 background:linear-gradient(120deg,rgba(99,102,241,.28),rgba(236,72,153,.28));
 border:1.5px solid rgba(255,255,255,.28);backdrop-filter:blur(4px);letter-spacing:.03em}
.title{font-size:60px;font-weight:800;line-height:1.42;letter-spacing:.005em;max-width:1000px;
 line-break:strict;word-break:normal;
 border-left:12px solid;border-image:linear-gradient(180deg,#6366f1,#a855f7,#ec4899) 1;padding-left:36px;
 text-shadow:0 2px 30px rgba(0,0,0,.35)}
.foot{position:absolute;left:76px;bottom:50px;z-index:2;font-size:27px;color:#b9b7d0;font-weight:700;
 display:flex;align-items:center;gap:12px}
.arrow{color:#c9a2ff}
.no{position:absolute;right:64px;bottom:30px;z-index:2;font-size:150px;font-weight:900;line-height:1;
 color:rgba(255,255,255,.06);letter-spacing:-.04em}
</style></head><body><div class="card">
<div class="top"><div class="badge"><span class="dot"></span>副業ドラフト ・ @shachiku_mao</div>
<div class="cat">${cat}</div></div>
<div class="inner"><div class="title">${title.replace(/</g, '&lt;')}</div></div>
<div class="foot">AIがあなたの強みを引き出す下書きツール<span class="arrow">→</span></div>
<div class="no">${String(num).padStart(2, '0')}</div>
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
