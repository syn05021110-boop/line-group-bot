import pkg from '/opt/node22/lib/node_modules/playwright/index.js';
import { mkdirSync, existsSync, rmSync } from 'fs';
const { chromium } = pkg;
const OUTDIR = 'marketing/note-images-seo';
if (existsSync(OUTDIR)) rmSync(OUTDIR, { recursive: true });
mkdirSync(OUTDIR, { recursive: true });

const DATA = [
  { n: '01', en: 'START', jp: 'AI副業の始め方', title: '会社員がAIで副業を\n始める5ステップ' },
  { n: '02', en: 'STRENGTH', jp: '自分の強みの見つけ方', title: '"強みがない"を\nAIが5分で解決' },
  { n: '03', en: 'AI TOOLS', jp: 'ChatGPT & Claude', title: 'ChatGPTとClaude\n副業ならどっち？' },
  { n: '04', en: 'PROMPT', jp: 'AIへの指示のコツ', title: '"いい感じにして"を\nやめるだけで変わる' },
  { n: '05', en: 'ANONYMOUS', jp: '身バレを防ぐ発信術', title: '会社にバレず\n発信する3つの工夫' },
  { n: '06', en: '5 MINUTES', jp: 'スキマ時間の使い方', title: 'スキマ5分で進む\nAI副業の作業リスト' },
  { n: '07', en: 'ROADMAP', jp: '最初の1ヶ月プラン', title: '0円で始める\nAI副業ロードマップ' },
  { n: '08', en: 'WRITING', jp: 'AI文章の磨き方', title: 'AIの文が"薄い"\n原因と直し方3つ' },
  { n: '09', en: 'CHANNEL', jp: 'Threads & note', title: 'Threadsとnote\nどっちから始める？' },
  { n: '10', en: 'MONETIZE', jp: '最初の商品の作り方', title: '副業の"最初の商品"\n何を売る？' },
  { n: '11', en: 'GROWTH', jp: '伸びない時の見直し', title: '発信が伸びない時\n見直す3つ' },
  { n: '12', en: 'MINDSET', jp: 'AI時代の発信論', title: 'AI時代に\n"自分の言葉"で書く意味' },
];

const esc = s => s.replace(/</g, '&lt;');
function hl(s){ s=esc(s); s=s.replace(/("[^"]+"|「[^」]+」)/g,'<span class="hl">$1</span>'); s=s.replace(/(\d+(?:分|円|つ|ステップ|ヶ月|個))/g,'<span class="hl">$1</span>'); return s.replace(/\n/g,'<br>'); }

const tpl = (d) => `<!doctype html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Shippori+Mincho+B1:wght@600;700;800&family=Noto+Sans+JP:wght@500;700&display=swap">
<style>
*{margin:0;box-sizing:border-box}body{width:1280px;height:670px;overflow:hidden}
.card{position:relative;width:1280px;height:670px;overflow:hidden;padding:84px 100px;
 background:radial-gradient(90% 120% at 88% 6%,#17233d 0%,transparent 55%),linear-gradient(150deg,#0f1626 0%,#0b1120 60%,#090d16 100%)}
.grain{position:absolute;inset:0;opacity:.045;background-image:radial-gradient(#fff 1px,transparent 1.5px);background-size:30px 30px}
.ring{position:absolute;width:520px;height:520px;border:1px solid rgba(255,210,63,.14);border-radius:50%;top:-150px;right:-120px}
.ring2{position:absolute;width:300px;height:300px;border:1px solid rgba(255,255,255,.06);border-radius:50%;top:-40px;right:30px}
.kick{position:relative;z-index:2;display:flex;align-items:center;gap:22px}
.kick .en{font-family:'Noto Sans JP',sans-serif;font-weight:700;font-size:26px;letter-spacing:.34em;color:#FFD23F;white-space:nowrap}
.kick .jp{font-family:'Noto Sans JP',sans-serif;font-weight:500;font-size:27px;color:#8c9ab5;letter-spacing:.06em;white-space:nowrap}
.kick .ln{flex:1;height:1px;background:linear-gradient(90deg,rgba(255,255,255,.18),transparent)}
.title{position:relative;z-index:2;margin-top:70px;font-family:'Shippori Mincho B1','Noto Sans JP',serif;
 font-weight:800;font-size:90px;line-height:1.46;letter-spacing:.01em;color:#f3f5fa}
.hl{color:#FFD23F}
.foot{position:absolute;z-index:2;left:100px;right:100px;bottom:64px;display:flex;align-items:center;justify-content:space-between}
.foot .hairline{position:absolute;left:0;right:0;top:-34px;height:1px;background:rgba(255,255,255,.1)}
.brand{font-family:'Noto Sans JP',sans-serif;font-weight:700;font-size:30px;color:#cdd6e6;display:flex;align-items:center;gap:14px}
.brand .mk{width:26px;height:26px;border-radius:7px;background:#FFD23F}
.brand .at{color:#71809a;font-weight:500;margin-left:4px}
.idx{font-family:'Shippori Mincho B1',serif;font-size:40px;color:rgba(255,255,255,.22);font-weight:700;letter-spacing:.1em}
</style></head><body><div class="card">
<div class="grain"></div><div class="ring"></div><div class="ring2"></div>
<div class="kick"><span class="en">${d.en}</span><span class="jp">${esc(d.jp)}</span><span class="ln"></span></div>
<div class="title">${hl(d.title)}</div>
<div class="foot"><div class="hairline"></div>
 <div class="brand"><span class="mk"></span>副業ドラフト<span class="at">@shachiku_mao</span></div>
 <div class="idx">No.${d.n}</div></div>
</div></body></html>`;

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1280, height: 670 }, deviceScaleFactor: 2 });
for (const d of DATA) {
  await p.setContent(tpl(d), { waitUntil: 'networkidle' });
  await p.evaluate(async () => { try { await document.fonts.ready; } catch (e) {} });
  await p.waitForTimeout(300);
  await p.screenshot({ path: `${OUTDIR}/seo-${d.n}.png` });
  console.log('seo-' + d.n);
}
await b.close();
console.log('DONE', DATA.length);
