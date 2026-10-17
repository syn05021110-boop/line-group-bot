import pkg from '/opt/node22/lib/node_modules/playwright/index.js';
import { mkdirSync, existsSync, rmSync } from 'fs';
const { chromium } = pkg;
const OUTDIR = 'marketing/note-images';
if (existsSync(OUTDIR)) rmSync(OUTDIR, { recursive: true });
mkdirSync(OUTDIR, { recursive: true });

const DATA = [
  { n: '01', en: 'START', jp: '副業の第一歩', title: '何もできない会社員が\nまずやる"棚卸し"' },
  { n: '02', en: 'STRENGTH', jp: '埋もれた強みの話', title: 'ネタがない人ほど\n"売れる強み"がある' },
  { n: '03', en: 'QUESTIONS', jp: '強みを引き出す質問', title: '強みが分からない人の\nたった7つの質問' },
  { n: '04', en: 'THREADS', jp: 'フォロワーの増やし方', title: 'Threadsで0→1000\n最初の3つのこと' },
  { n: '05', en: 'HOOK', jp: 'Xで伸びる型', title: 'Xで伸びる人の\n"フックの型"4選' },
  { n: '06', en: 'PROFILE', jp: 'Instagram運用', title: 'インスタのプロフ\n9割が損してる' },
  { n: '07', en: 'NOTE', jp: 'note入門', title: 'note初心者が\n挫折しない書き方' },
  { n: '08', en: 'ROUTINE', jp: '続ける技術', title: '"時間がない"でも\n発信を続ける方法' },
  { n: '09', en: 'AI', jp: 'AI活用の本質', title: 'AIを使うと\nなぜ"自分らしさ"が出る？' },
  { n: '10', en: 'CONTINUE', jp: '続く人の違い', title: '3日でやめる人と\n続く人の決定的な差' },
  { n: '11', en: 'CAREER', jp: '肩書きの作り方', title: '"元○○"という肩書きは\nそれだけで武器' },
  { n: '12', en: 'MONETIZE', jp: '売れるnoteの構成', title: '有料noteが売れる人\n"構成"の違い' },
  { n: '13', en: 'SYSTEM', jp: '投稿の仕組み化', title: '1週間分の投稿を\n30分で用意する' },
  { n: '14', en: 'TRUST', jp: '信頼のつくり方', title: '"何者でもない自分"が\n信頼される最短ルート' },
  { n: '15', en: 'WORDS', jp: '副業の第一歩', title: '副業の第一歩は\n"商品"より"言語化"' },
  { n: '16', en: 'FANS', jp: '少数で稼ぐ発信', title: 'フォロワーが少なくても\n仕事につながる共通点' },
  { n: '17', en: 'IDEAS', jp: 'ネタ切れ対策', title: 'ネタが尽きる人と\n尽きない人の違い' },
  { n: '18', en: 'WRITING', jp: '伸びる投稿の条件', title: 'AI丸投げは伸びない\n人の心が動く条件' },
  { n: '19', en: 'DESIGN', jp: '消耗しない発信', title: '消耗しないための\n"発信の設計図"' },
  { n: '20', en: 'ASSET', jp: '会社員の資産戦略', title: '会社員のうちに\n"自分メディア"を持つ' },
];

const esc = s => s.replace(/</g, '&lt;');
function hl(s){ s=esc(s); s=s.replace(/("[^"]+"|「[^」]+」)/g,'<span class="hl">$1</span>'); s=s.replace(/(\d+(?:分|円|つ|ステップ|ヶ月|個|選|割)|0→1000)/g,'<span class="hl">$1</span>'); return s.replace(/\n/g,'<br>'); }

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
.title{position:relative;z-index:2;margin-top:66px;font-family:'Shippori Mincho B1','Noto Sans JP',serif;
 font-weight:800;font-size:84px;line-height:1.48;letter-spacing:.01em;color:#f3f5fa}
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
  await p.waitForTimeout(250);
  await p.screenshot({ path: `${OUTDIR}/note-${d.n}.png` });
  console.log('note-' + d.n);
}
await b.close();
console.log('DONE', DATA.length);
