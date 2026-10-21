import { readFileSync, writeFileSync, readdirSync } from 'fs';

const RAW = 'https://raw.githubusercontent.com/syn05021110-boop/line-group-bot/claude/threads-note-income-app-fr3bhv/marketing/';
const CARD_RE = /!\[この記事のポイント\]\(([^)]+)\)/;

function block({ tag, file, eyecatch, card }) {
  let md = readFileSync(file, 'utf8');
  const title = (md.match(/^#\s+(.+)$/m) || [, ''])[1].trim();
  // 本文：先頭の # タイトル行を除く
  let body = md.replace(/^#\s+.+\n?/, '').trim();
  // 本文カードのマーカーを、URL付きの読める注記に置換
  body = body.replace(CARD_RE, `【本文カード画像をここに挿入 → ${RAW}${card}】`);
  return `
<!-- ======================== ${tag} ======================== -->
## ${tag}　${title}

**見出し画像（トップ画）**：${RAW}${eyecatch}
**本文カード画像**：${RAW}${card}　←「まとめ」直前の【…】の位置に入れる

\`\`\`markdown
${body}
\`\`\`
`;
}

const blocks = [];
const toc = [];

// SEO 12本
for (const f of readdirSync('marketing/notes-seo').filter(f => /^seo-\d+.*\.md$/.test(f)).sort()) {
  const n = f.match(/seo-(\d+)/)[1];
  const tag = `[SEO ${n}]`;
  const title = (readFileSync(`marketing/notes-seo/${f}`, 'utf8').match(/^#\s+(.+)$/m) || [, ''])[1].trim();
  toc.push(`- ${tag} ${title}`);
  blocks.push(block({ tag, file: `marketing/notes-seo/${f}`, eyecatch: `note-images-seo/seo-${n}.png`, card: `note-images-seo/body/seo-${n}-body.png` }));
}
// note 20本
for (let i = 1; i <= 20; i++) {
  const n = String(i).padStart(2, '0');
  const tag = `[note ${n}]`;
  const title = (readFileSync(`marketing/notes/note-${n}.md`, 'utf8').match(/^#\s+(.+)$/m) || [, ''])[1].trim();
  toc.push(`- ${tag} ${title}`);
  blocks.push(block({ tag, file: `marketing/notes/note-${n}.md`, eyecatch: `note-images/note-${n}.png`, card: `note-images/body/note-${n}-body.png` }));
}

const header = `# note記事 32本 コピペ用まとめ（他の場所・他のチャットへの持ち出し用）

このファイル1枚で、どこでも投稿を作れます。使い方：

1. 下の目次から記事を選ぶ
2. その記事ブロックの **\`\`\`markdown … \`\`\`** の中（本文）をコピー → 貼りたい先（note／別のClaudeチャット等）に貼る
3. **見出し画像**のURLを開いて保存 → note のトップ画に設定
4. 本文中の **【本文カード画像をここに挿入 → URL】** の位置に、そのURLの画像を入れる（行は消す）
5. 末尾の CTA（LINE \`lin.ee/RzyA13P\` ＋ アプリURL）はそのままでOK

※ 画像はすべて公開URL（GitHub raw）。リンクを開けば誰でも保存できます。
※ 下書き自動投入でやる場合は \`marketing/note-json/RUN-GUIDE.md\`（runner方式）を参照。

---

## 目次（全32本）

${toc.join('\n')}

---
`;

writeFileSync('marketing/HANDOFF-POSTS.md', header + blocks.join('\n'));
console.log('DONE marketing/HANDOFF-POSTS.md', '(' + blocks.length + '本)');
