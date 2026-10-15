import pkg from '/opt/node22/lib/node_modules/playwright/index.js';
import { mkdirSync, existsSync, rmSync } from 'fs';
const { chromium } = pkg;
const OUTDIR = 'marketing/note-images-seo';
if (existsSync(OUTDIR)) rmSync(OUTDIR, { recursive: true });
mkdirSync(OUTDIR, { recursive: true });

// slug / カテゴリ / 見出し画像用の短い題名（2行）
const DATA = [
  { n: '01', cat: '副業の始め方', title: '会社員がAIで副業を\n始める5ステップ' },
  { n: '02', cat: '強み発見', title: '"強みがない"を\nAIが5分で解決' },
  { n: '03', cat: 'AI活用', title: 'ChatGPTとClaude\n副業ならどっち？' },
  { n: '04', cat: 'プロンプト', title: '"いい感じにして"を\nやめるだけで変わる' },
  { n: '05', cat: '発信の型', title: '会社にバレず\n発信する3つの工夫' },
  { n: '06', cat: '時短術', title: 'スキマ5分で進む\nAI副業の作業リスト' },
  { n: '07', cat: '副業の始め方', title: '0円で始める\nAI副業ロードマップ' },
  { n: '08', cat: 'AI活用', title: 'AIの文が"薄い"\n原因と直し方3つ' },
  { n: '09', cat: '発信の型', title: 'Threadsとnote\nどっちから始める？' },
  { n: '10', cat: '収益化', title: '副業の"最初の商品"\n何を売る？' },
  { n: '11', cat: '発信の型', title: '発信が伸びない時\n見直す3つ' },
  { n: '12', cat: '発信の型', title: 'AI時代に\n"自分の言葉"で書く意味' },
];

const esc = s => s.replace(/</g, '&lt;');
// 「」"" 数字＋ステップ/分/円/つ/本 を黄色ハイライト
function hl(s) {
  s = esc(s);
  s = s.replace(/(「[^」]+」|"[^"]+"|“[^”]+”)/g, '<span class="hl">$1</span>');
  s = s.replace(/(\d+(?:ステップ|分|円|つ|本|ヶ月|個|割))/g, '<span class="hl">$1</span>');
  return s.replace(/\n/g, '<br>');
}
const tpl = (cat, title) => `<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}body{width:1280px;height:670px;overflow:hidden}
.card{position:relative;width:1280px;height:670px;background:#0E1525;overflow:hidden;
 font-family:-apple-system,'Hiragino Kaku Gothic ProN','Hiragino Sans','Noto Sans JP',sans-serif;padding:92px 96px}
.card::before{content:"";position:absolute;inset:0;background:radial-gradient(60% 50% at 78% 18%,#1b2a48 0%,transparent 60%)}
.grid{position:absolute;inset:0;opacity:.05;background-image:radial-gradient(#fff 1px,transparent 1.4px);background-size:34px 34px}
.chip{position:relative;z-index:2;display:inline-block;background:#FFD23F;color:#0E1525;font-weight:900;
 font-size:30px;letter-spacing:.02em;padding:12px 26px;border-radius:999px}
.title{position:relative;z-index:2;margin-top:44px;color:#fff;font-weight:900;font-size:88px;line-height:1.36;letter-spacing:-.02em}
.hl{color:#FFD23F}
.bar{position:absolute;z-index:2;left:96px;bottom:150px;width:120px;height:12px;background:#FFD23F;border-radius:6px}
.brand{position:absolute;z-index:2;left:96px;bottom:70px;display:flex;align-items:center;gap:16px;color:#aab6cc;font-weight:800;font-size:32px}
.brand .sq{width:30px;height:30px;background:#FFD23F;border-radius:8px}
</style></head><body><div class="card">
<div class="grid"></div>
<div class="chip">${esc(cat)}</div>
<div class="title">${hl(title)}</div>
<div class="bar"></div>
<div class="brand"><span class="sq"></span>副業ドラフト ・ @shachiku_mao</div>
</div></body></html>`;

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1280, height: 670 }, deviceScaleFactor: 2 });
for (const d of DATA) {
  await p.setContent(tpl(d.cat, d.title), { waitUntil: 'load' });
  await p.waitForTimeout(80);
  await p.screenshot({ path: `${OUTDIR}/seo-${d.n}.png` });
  console.log('seo-' + d.n);
}
await b.close();
console.log('DONE', DATA.length);
