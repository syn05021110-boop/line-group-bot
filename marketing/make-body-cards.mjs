import pkg from '/opt/node22/lib/node_modules/playwright/index.js';
import { mkdirSync, existsSync, rmSync } from 'fs';
const { chromium } = pkg;
const OUTDIR = 'marketing/note-images-seo/body';
if (existsSync(OUTDIR)) rmSync(OUTDIR, { recursive: true });
mkdirSync(OUTDIR, { recursive: true });

// 各SEO記事の「ポイントまとめ」カード
const DATA = [
  { n: '01', title: 'AI副業を始める順番', items: ['言語化（強みを言葉に）', '発信（仕組み化する）', '収益化（信頼が溜まってから）'] },
  { n: '02', title: '強みを引き出す3つの質問', items: ['最近「ありがとう」と言われたこと', 'よく相談されること', '時間を忘れて没頭できること'] },
  { n: '03', title: 'ChatGPT と Claude 使い分け', items: ['自然な長文 → Claude', '速さ・汎用 → ChatGPT', '強み棚卸し → どちらでもOK'] },
  { n: '04', title: 'AIに嫌われない指示の型', items: ['【誰に】○○な人向けに', '【何を】△△について', '【トーン】□□な感じで', '【長さ】120字で'] },
  { n: '05', title: '身バレを防ぐ3つの工夫', items: ['特定につながる情報を出さない', 'ハンドルネームで活動する', '体験は"学び"に変換する'] },
  { n: '06', title: 'スキマ5分でできること', items: ['ネタを10分解させる', '音声メモ→投稿文に', '1行目のフックを5案', 'コメント返信案を作る'] },
  { n: '07', title: '最初の1ヶ月ロードマップ', items: ['Week1：棚卸し', 'Week2：発信の準備', 'Week3：発信スタート', 'Week4：仕組み化'] },
  { n: '08', title: 'AI文を"濃く"する3つ', items: ['自分の具体を素材として渡す', '読者を1人にしぼる', '最後に"自分の一言"を足す'] },
  { n: '09', title: 'Threads と note の役割', items: ['Threads＝集客・拡散（入口）', 'note＝信頼・資産・検索流入', 'noteの要点をThreadsで小出し'] },
  { n: '10', title: '最初の商品の出し方', items: ['在庫ゼロのデジタル商品から', '低単価（ワンコイン〜）で', '声が集まったら単価を上げる'] },
  { n: '11', title: '伸びない時に見直す3つ', items: ['誰に向けているか（1人に絞る）', '1行目で止められているか', '反応する余白（問いかけ）があるか'] },
  { n: '12', title: 'AI時代に発信する意味', items: ['一般論はAIが量産する', '希少なのは"あなたの体験"', 'AIは増幅装置、仕上げは自分'] },
];

const esc = s => s.replace(/</g, '&lt;');
const hlItem = s => esc(s).replace(/(「[^」]+」|"[^"]+"|【[^】]+】|Week\d|ChatGPT|Claude|Threads|note)/g, '<span class="hl">$1</span>');

const tpl = (d) => `<!doctype html><html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Shippori+Mincho+B1:wght@700;800&family=Noto+Sans+JP:wght@500;700;900&display=swap">
<style>
*{margin:0;box-sizing:border-box}body{width:1280px;height:860px;overflow:hidden}
.card{position:relative;width:1280px;height:860px;overflow:hidden;padding:84px 96px;display:flex;flex-direction:column;justify-content:center;
 background:radial-gradient(90% 110% at 86% 4%,#17233d 0%,transparent 55%),linear-gradient(150deg,#0f1626 0%,#0b1120 60%,#090d16 100%)}
.grain{position:absolute;inset:0;opacity:.045;background-image:radial-gradient(#fff 1px,transparent 1.5px);background-size:30px 30px}
.ring{position:absolute;width:460px;height:460px;border:1px solid rgba(255,210,63,.12);border-radius:50%;top:-140px;right:-120px}
.kick{position:relative;z-index:2;display:flex;align-items:center;gap:20px;margin-bottom:18px}
.kick .en{font-family:'Noto Sans JP',sans-serif;font-weight:700;font-size:24px;letter-spacing:.34em;color:#FFD23F}
.kick .ln{flex:1;height:1px;background:linear-gradient(90deg,rgba(255,255,255,.18),transparent)}
.title{position:relative;z-index:2;font-family:'Shippori Mincho B1','Noto Sans JP',serif;font-weight:800;font-size:62px;line-height:1.3;color:#f3f5fa;margin-bottom:46px}
.items{position:relative;z-index:2;display:flex;flex-direction:column;gap:28px}
.it{display:flex;align-items:center;gap:26px}
.num{width:58px;height:58px;border-radius:14px;background:#FFD23F;color:#0E1525;display:grid;place-items:center;font-family:'Noto Sans JP',sans-serif;font-weight:900;font-size:30px;flex:none}
.tx{font-family:'Noto Sans JP',sans-serif;font-weight:700;font-size:42px;color:#e9edf6;line-height:1.4}
.hl{color:#FFD23F}
.brand{position:absolute;z-index:2;right:96px;bottom:50px;font-family:'Noto Sans JP',sans-serif;font-weight:700;font-size:26px;color:#71809a;display:flex;align-items:center;gap:12px}
.brand .mk{width:22px;height:22px;border-radius:6px;background:#FFD23F}
</style></head><body><div class="card">
<div class="grain"></div><div class="ring"></div>
<div class="kick"><span class="en">POINT</span><span class="ln"></span></div>
<div class="title">${esc(d.title)}</div>
<div class="items">${d.items.map((t, i) => `<div class="it"><div class="num">${i + 1}</div><div class="tx">${hlItem(t)}</div></div>`).join('')}</div>
<div class="brand"><span class="mk"></span>副業ドラフト ・ @shachiku_mao</div>
</div></body></html>`;

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1280, height: 860 }, deviceScaleFactor: 2 });
for (const d of DATA) {
  await p.setContent(tpl(d), { waitUntil: 'networkidle' });
  await p.evaluate(async () => { try { await document.fonts.ready; } catch (e) {} });
  await p.waitForTimeout(250);
  await p.screenshot({ path: `${OUTDIR}/seo-${d.n}-body.png` });
  console.log('seo-' + d.n + '-body');
}
await b.close();
console.log('DONE', DATA.length);
