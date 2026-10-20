import { readFileSync, writeFileSync, readdirSync } from 'fs';

// ---------- Markdown → note用HTML（build-note-paste.mjs と同じ変換） ----------
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function inline(s) {
  s = esc(s);
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
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
    if (line.trim().startsWith('```')) { flushPara(); flushList(); inCode = true; codeBuf = []; continue; }
    if (line.trim() === '') { flushPara(); flushList(); continue; }
    if (/^## /.test(line)) { flushPara(); flushList(); html += '<h2>' + inline(line.slice(3)) + '</h2>'; continue; }
    if (/^### /.test(line)) { flushPara(); flushList(); html += '<h3>' + inline(line.slice(4)) + '</h3>'; continue; }
    if (/^# /.test(line)) { continue; }
    if (/^---+$/.test(line.trim())) { flushPara(); flushList(); html += '<hr>'; continue; }
    if (/^[-・]\s/.test(line)) { flushPara(); if (!inList) { html += '<ul>'; inList = true; } html += '<li>' + inline(line.replace(/^[-・]\s/, '')) + '</li>'; continue; }
    if (/^>\s/.test(line)) { flushPara(); flushList(); html += '<blockquote>' + inline(line.slice(2)) + '</blockquote>'; continue; }
    flushList(); para.push(line);
  }
  flushPara(); flushList();
  if (inCode) html += '<pre>' + esc(codeBuf.join('\n')) + '</pre>';
  return html;
}

// ---------- JSON生成 ----------
const CARD_RE = /!\[この記事のポイント\]\(([^)]+)\)/;
function build({ file, imgDir, eyeName, cardName }) {
  let md = readFileSync(file, 'utf8');
  const title = (md.match(/^#\s+(.+)$/m) || [, ''])[1].trim();
  let pre = md, post = '';
  const m = md.match(CARD_RE);
  if (m) { const parts = md.split(m[0]); pre = parts[0]; post = parts.slice(1).join(m[0]); }
  const segs = [{ t: 'img', v: eyeName, eye: true }, { t: 'html', v: mdToHtml(pre) }];
  if (m && cardName) { segs.push({ t: 'img', v: cardName }); segs.push({ t: 'html', v: mdToHtml(post) }); }
  return { title, imgDir, segs };
}

const OUT = 'marketing/note-json';
let count = 0;

// SEO 12本
for (const f of readdirSync('marketing/notes-seo').filter(f => /^seo-\d+.*\.md$/.test(f)).sort()) {
  const n = f.match(/seo-(\d+)/)[1];
  const j = build({ file: `marketing/notes-seo/${f}`, imgDir: 'note-images-seo', eyeName: `seo-${n}.png`, cardName: `body/seo-${n}-body.png` });
  writeFileSync(`${OUT}/seo-${n}.json`, JSON.stringify(j));
  console.log('seo-' + n + '.json', '-', j.title.slice(0, 20)); count++;
}
// note 20本
for (let i = 1; i <= 20; i++) {
  const n = String(i).padStart(2, '0');
  const j = build({ file: `marketing/notes/note-${n}.md`, imgDir: 'note-images', eyeName: `note-${n}.png`, cardName: `body/note-${n}-body.png` });
  writeFileSync(`${OUT}/note-${n}.json`, JSON.stringify(j));
  console.log('note-' + n + '.json', '-', j.title.slice(0, 20)); count++;
}
console.log('DONE', count);
