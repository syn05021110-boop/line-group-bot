import pkg from '/opt/node22/lib/node_modules/playwright/index.js';
import { mkdirSync, existsSync, rmSync } from 'fs';
const { chromium } = pkg;
const OUTDIR = 'marketing/note-images/body';
if (existsSync(OUTDIR)) rmSync(OUTDIR, { recursive: true });
mkdirSync(OUTDIR, { recursive: true });

// 既存note20本の「ポイントまとめ」カード
const DATA = [
  { n: '01', title: '副業の第一歩は"棚卸し"', items: ['「できない」は言語化してないだけ', '棚卸しは3ステップで掘る', 'ひとりで無理ならAIに質問させる'] },
  { n: '02', title: 'ネタがない人ほど強みがある', items: ['自分の「普通」は他人には価値', '切り捨てた経験こそ資産', '強みは"掘り出す"もの'] },
  { n: '03', title: '強みを引き出す7つの質問', items: ['強みは質問で引き出す', '答えを"つなげる"と強みになる', 'つなげる作業はAIが得意'] },
  { n: '04', title: 'Threads 0→1000 最初の3手', items: ['誰の役に立つかを1人に絞る', 'プロフで"何者か"を一言', '自分の実体験から書く'] },
  { n: '05', title: 'Xで伸びるフックの型4選', items: ['逆説・常識否定', '具体的な数字', '失敗談・告白', '悩みをそのまま言う'] },
  { n: '06', title: 'インスタのプロフの型', items: ['「肩書き＋誰の役に立つか」を明記', '得られる変化を一言で', '発信内容と一貫させる'] },
  { n: '07', title: 'noteで挫折しない書き方', items: ['挫折の原因は"白紙"', '5ブロックのテンプレに沿う', '最初の1本は完璧を捨てる'] },
  { n: '08', title: '時間がなくても続ける方法', items: ['気合いで続く人はいない', '続くのは"仕組み"', '用意する時間も惜しいならAI'] },
  { n: '09', title: 'AIで"自分らしさ"を出す', items: ['丸投げは没個性になる', '自分の"体験"を素材として渡す', '人＝体験、AI＝整える'] },
  { n: '10', title: '3日でやめる人と続く人', items: ['続かない原因はやる気頼み', '続く人は"仕組み化"', '仕組み作りのハードルも下げる'] },
  { n: '11', title: '"元○○"はそれだけで武器', items: ['業界の当たり前は外では専門知', '"元○○"が信頼を生む', '職歴も副業も全部使える'] },
  { n: '12', title: '売れるnoteの"構成"', items: ['売れないのは構成の問題', '無料と有料の境界線が9割', '構成は"設計"できる'] },
  { n: '13', title: '1週間分を30分で用意', items: ['毎日作るからしんどい', 'まとめて作る', '鍵は「型」と「AI」'] },
  { n: '14', title: '"何者でもない自分"が信頼される', items: ['実績がなくても信頼は作れる', '完成品より"変化の過程"', '信頼には順番がある'] },
  { n: '15', title: '第一歩は"商品"より"言語化"', items: ['商品を先に作ると売れにくい', '先にやるのは言語化', '順番＝言語化→発信→商品'] },
  { n: '16', title: '少数でも仕事につながる', items: ['フォロワー数≠収益', '"濃いファン10人"の力', '数より"深さ"を作る'] },
  { n: '17', title: 'ネタが尽きない人の違い', items: ['尽きる人はその場で探す', '尽きない人はネタ帳を持つ', '棚卸しで"在庫"が見える'] },
  { n: '18', title: '人の心が動く投稿の3条件', items: ['自分だけの具体的な体験', '感情が動いた瞬間', '読者への「あなたへ」の一言'] },
  { n: '19', title: '発信の設計図 4要素', items: ['誰に（たった1人）', '何を（発信の軸）', 'どこで（媒体を決める）', 'どう続けるか（型と頻度）'] },
  { n: '20', title: '会社員のうちに"自分メディア"を', items: ['会社員は"実験できる"環境', '発信は資産として積み上がる', '今しか語れないことがある'] },
];

const esc = s => s.replace(/</g, '&lt;');
const hlItem = s => esc(s).replace(/(「[^」]+」|"[^"]+"|【[^】]+】|元○○|ChatGPT|Claude|Threads|note|AI|\d+(?:人|つ|選|本|条件|要素|手|ステップ))/g, '<span class="hl">$1</span>');

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
.title{position:relative;z-index:2;font-family:'Shippori Mincho B1','Noto Sans JP',serif;font-weight:800;font-size:60px;line-height:1.3;color:#f3f5fa;margin-bottom:44px}
.items{position:relative;z-index:2;display:flex;flex-direction:column;gap:26px}
.it{display:flex;align-items:center;gap:26px}
.num{width:58px;height:58px;border-radius:14px;background:#FFD23F;color:#0E1525;display:grid;place-items:center;font-family:'Noto Sans JP',sans-serif;font-weight:900;font-size:30px;flex:none}
.tx{font-family:'Noto Sans JP',sans-serif;font-weight:700;font-size:40px;color:#e9edf6;line-height:1.4}
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
  await p.screenshot({ path: `${OUTDIR}/note-${d.n}-body.png` });
  console.log('note-' + d.n + '-body');
}
await b.close();
console.log('DONE', DATA.length);
