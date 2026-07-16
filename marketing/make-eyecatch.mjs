import pkg from '/opt/node22/lib/node_modules/playwright/index.js';
import { readFileSync, readdirSync, writeFileSync } from 'fs';
const { chromium } = pkg;

const files = readdirSync('marketing/notes').filter(f=>/^note-\d+\.md$/.test(f)).sort();
const template = (title, num) => `<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
body{width:1280px;height:670px;font-family:'Hiragino Sans','Noto Sans JP',sans-serif;overflow:hidden}
.card{position:relative;width:1280px;height:670px;background:#08080f;color:#fff;padding:72px 80px;display:flex;flex-direction:column;justify-content:center;overflow:hidden}
.card::before{content:"";position:absolute;inset:0;background:
 radial-gradient(50% 45% at 12% 8%,rgba(99,102,241,.42),transparent 60%),
 radial-gradient(45% 45% at 100% 20%,rgba(236,72,153,.32),transparent 55%),
 radial-gradient(45% 40% at 85% 100%,rgba(168,85,247,.30),transparent 60%);}
.inner{position:relative;z-index:1}
.badge{display:inline-flex;align-items:center;gap:10px;font-size:24px;font-weight:800;color:#cdc9ff;margin-bottom:34px;letter-spacing:.02em}
.dot{width:14px;height:14px;border-radius:50%;background:linear-gradient(120deg,#6366f1,#a855f7,#ec4899)}
.title{font-size:66px;font-weight:800;line-height:1.4;letter-spacing:.01em;border-left:10px solid;border-image:linear-gradient(180deg,#6366f1,#ec4899) 1;padding-left:34px}
.foot{position:absolute;left:80px;bottom:52px;z-index:1;font-size:26px;color:#9a99b4;font-weight:600}
.no{position:absolute;right:70px;bottom:44px;z-index:1;font-size:40px;font-weight:800;color:rgba(255,255,255,.14)}
</style></head><body><div class="card">
<div class="inner"><div class="badge"><span class="dot"></span>副業ドラフト ・ @shachiku_mao</div>
<div class="title">${title.replace(/</g,'&lt;')}</div></div>
<div class="foot">AIがあなたの強みを引き出す下書きツール</div>
<div class="no">#${num}</div>
</div></body></html>`;

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width:1280, height:670 }, deviceScaleFactor:1 });
for (const f of files){
  const num = f.match(/(\d+)/)[1];
  const title = readFileSync('marketing/notes/'+f,'utf8').split('\n')[0].replace(/^#\s*/,'');
  await p.setContent(template(title, num), { waitUntil:'load' });
  await p.waitForTimeout(120);
  await p.screenshot({ path:`marketing/note-images/note-${num}.png` });
}
await b.close();
console.log('done', files.length);
