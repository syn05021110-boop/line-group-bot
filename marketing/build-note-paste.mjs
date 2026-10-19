import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, readdirSync } from 'fs';

const OUT = 'marketing/notes-paste';
if (existsSync(OUT)) rmSync(OUT, { recursive: true });
mkdirSync(OUT, { recursive: true });

// ---------- Markdown → note用HTML ----------
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function inline(s) {
  s = esc(s);
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  // 裸URLをリンク化（href属性内は除く）
  s = s.replace(/(^|[^"=>\/])((?:https?:\/\/)[^\s<]+)/g, '$1<a href="$2">$2</a>');
  return s;
}
function mdToHtml(md) {
  const lines = md.split('\n');
  let html = '', inList = false, inCode = false, codeBuf = [], para = [];
  const flushPara = () => { if (para.length) { html += '<p>' + inline(para.join(' ')) + '</p>'; para = []; } };
  const flushList = () => { if (inList) { html += '</ul>'; inList = false; } };
  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');
    if (inCode) { if (line.trim() === '```') { html += '<pre>' + esc(codeBuf.join('\n')) + '</pre>'; inCode = false; codeBuf = []; } else codeBuf.push(raw); continue; }
    if (line.trim() === '```' || line.trim().startsWith('```')) { flushPara(); flushList(); inCode = true; codeBuf = []; continue; }
    if (line.trim() === '') { flushPara(); flushList(); continue; }
    if (/^## /.test(line)) { flushPara(); flushList(); html += '<h2>' + inline(line.slice(3)) + '</h2>'; continue; }
    if (/^### /.test(line)) { flushPara(); flushList(); html += '<h3>' + inline(line.slice(4)) + '</h3>'; continue; }
    if (/^# /.test(line)) { continue; } // タイトル行はスキップ
    if (/^---+$/.test(line.trim())) { flushPara(); flushList(); html += '<hr>'; continue; }
    if (/^[-・]\s/.test(line)) { flushPara(); if (!inList) { html += '<ul>'; inList = true; } html += '<li>' + inline(line.replace(/^[-・]\s/, '')) + '</li>'; continue; }
    if (/^>\s/.test(line)) { flushPara(); flushList(); html += '<blockquote>' + inline(line.slice(2)) + '</blockquote>'; continue; }
    flushList(); para.push(line);
  }
  flushPara(); flushList();
  if (inCode) html += '<pre>' + esc(codeBuf.join('\n')) + '</pre>';
  return html;
}

// ---------- 記事リスト ----------
const CARD_RE = /!\[この記事のポイント\]\(([^)]+)\)/;
function buildArticle({ file, eyecatch, title, idx }) {
  let md = readFileSync(file, 'utf8');
  // タイトル（1行目 # ...）
  const titleLine = (md.match(/^#\s+(.+)$/m) || [, title])[1].trim();
  // 本文カードで分割
  let cardPath = null, pre = md, post = '';
  const m = md.match(CARD_RE);
  if (m) {
    cardPath = m[1];
    const parts = md.split(m[0]);
    pre = parts[0];
    post = parts.slice(1).join(m[0]);
  }
  const preHtml = mdToHtml(pre);
  const postHtml = post ? mdToHtml(post) : '';
  const eyeName = eyecatch.split('/').pop();
  const cardName = cardPath ? cardPath.split('/').pop() : null;
  const cardRel = cardPath ? '../' + cardPath : null; // notes-paste/ からの相対

  let bodyBlocks = '';
  bodyBlocks += `<div class='seg'><button onclick='cp("s1",this)'>本文1をコピー</button><div class='body' id='s1'>${preHtml}</div></div>`;
  if (cardName) {
    bodyBlocks += `<div class='img'><div class='badge'>本文中に挿入：${cardName}（この記事のポイント）</div><img src='${cardRel}'></div>`;
    bodyBlocks += `<div class='seg'><button onclick='cp("s2",this)'>本文2をコピー</button><div class='body' id='s2'>${postHtml}</div></div>`;
  }

  return `<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>note貼り付け用｜${esc(titleLine)}</title>
<style>
body{font-family:"Hiragino Sans",sans-serif;background:#f4f4f2;color:#222;margin:0;padding:24px 16px 80px}
main{max-width:760px;margin:0 auto}
.guide{background:#fff8d6;border:1px solid #e8d77a;border-radius:10px;padding:14px 18px;line-height:1.8;font-size:15px}
.seg,.titlebox{background:#fff;border:1px solid #ddd;border-radius:10px;padding:18px 22px;margin:18px 0}
button{background:#222;color:#fff;border:0;border-radius:8px;padding:8px 14px;font-size:14px;cursor:pointer}
button.done{background:#2e7d32}
.body{line-height:1.9;font-size:16px;margin-top:12px}
.body h2{font-size:22px;margin:28px 0 8px}
.body h3{font-size:18px;margin:22px 0 6px}
.body pre{background:#f1f1ef;border:1px solid #ddd;border-radius:8px;padding:12px;white-space:pre-wrap;font-size:14px}
.body blockquote{border-left:4px solid #ccc;margin:12px 0;padding:4px 14px;color:#555}
.body ul{padding-left:1.4em}
.body hr{border:0;border-top:1px solid #ddd;margin:22px 0}
.img{margin:18px 0;text-align:center}
.img img{max-width:100%;border-radius:8px;border:1px solid #ddd}
.badge{display:inline-block;background:#1565c0;color:#fff;border-radius:6px;padding:4px 10px;font-size:13px;margin-bottom:8px}
.badge.eye{background:#b26a00}
</style></head><body><main>
<div class="guide"><b>使い方</b><br>
1. 「タイトルをコピー」→ note のタイトル欄に貼る<br>
2. オレンジのラベルの画像（見出し画像）を note の見出し画像に設定<br>
3. 「本文1をコピー」→ note本文に貼る<br>
4. 青いラベルの位置（本文の途中）に、同じ名前の画像をアップして挿入<br>
5. 「本文2をコピー」→ 続きを貼る<br>
※ 見出しが普通の文字になったら、その行を選んで「大見出し」に設定してください</div>
<div class="titlebox"><button onclick='cp("t",this)'>タイトルをコピー</button><div class="body" id="t">${esc(titleLine)}</div></div>
<div class='img'><div class='badge eye'>見出し画像に設定：${eyeName}</div><img src='../${eyecatch}'></div>
${bodyBlocks}
</main>
<script>
function cp(id,b){const r=document.createRange();r.selectNodeContents(document.getElementById(id));
const s=getSelection();s.removeAllRanges();s.addRange(r);const ok=document.execCommand('copy');s.removeAllRanges();
b.textContent=ok?'コピーしました':'コピーできませんでした（手動で選択してください）';b.classList.add('done');}
</script></body></html>`;
}

// SEO 12本
const seoFiles = readdirSync('marketing/notes-seo').filter(f => /^seo-\d+.*\.md$/.test(f)).sort();
const articles = [];
for (const f of seoFiles) {
  const n = f.match(/seo-(\d+)/)[1];
  articles.push({ out: `seo-${n}.html`, file: `marketing/notes-seo/${f}`, eyecatch: `note-images-seo/seo-${n}.png`, idx: `S${n}` });
}
// note 20本
for (let i = 1; i <= 20; i++) {
  const n = String(i).padStart(2, '0');
  articles.push({ out: `note-${n}.html`, file: `marketing/notes/note-${n}.md`, eyecatch: `note-images/note-${n}.png`, idx: n });
}

const indexRows = [];
for (const a of articles) {
  const html = buildArticle(a);
  writeFileSync(`${OUT}/${a.out}`, html);
  const title = (readFileSync(a.file, 'utf8').match(/^#\s+(.+)$/m) || [, a.out])[1].trim();
  indexRows.push(`<li><a href="${a.out}">${a.out.startsWith('seo') ? '【SEO】' : '【note】'} ${esc(title)}</a></li>`);
  console.log('built', a.out);
}

// index
const index = `<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>note下書きキット（全32本）</title>
<style>body{font-family:"Hiragino Sans",sans-serif;background:#f4f4f2;color:#222;max-width:820px;margin:0 auto;padding:30px 20px}
h1{font-size:22px}li{margin:8px 0;line-height:1.6}a{color:#1565c0}.note{background:#fff8d6;border:1px solid #e8d77a;border-radius:10px;padding:14px 18px;line-height:1.8}</style>
</head><body><h1>note下書きキット（全32本）</h1>
<div class="note">各記事のページを開いて、ボタンでコピー → noteの下書きに貼るだけ。<br>画像（見出し＋本文カード）は、ラベルの位置に同名ファイルを挿入してください。</div>
<ul>${indexRows.join('')}</ul></body></html>`;
writeFileSync(`${OUT}/index.html`, index);
console.log('DONE', articles.length, '+ index');
