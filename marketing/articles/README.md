# articles/ — 画像つきで仕上げた記事・投稿

Mac の Claude Code で作った、公開用の記事と投稿の完成品。1記事1フォルダ。

| フォルダ | 中身 | 状態 |
|---|---|---|
| `claude-code-7tools/` | note「動画で見た『Claude Codeに入れるべき7つ』を全部入れたら…」＋ Threads 投稿文（メイン＋返信4＋単発4） | note 公開済み https://note.com/maiyome_fu/n/nc48c1a6ce08b ／ Threads 未投稿 |
| `ai-starter-kit/` | note「『何を発信すればいいか分からない』が5分で消える｜AI×発信スターターキット」＋ 画像8枚 | note 公開前。**無料プレゼントはこの第1版を採用**（2026-09-28）。内容がほぼ同じ `../note-lead-magnet-v2.md`（ストーリー型）は同時には出さない |

## 各フォルダの構成
- `*.md` … 本文（`[[img:ファイル名]]` は画像を入れる位置）
- `*_paste.html` … ブラウザで開き、区切りごとの「コピー」ボタンで書式付きのまま note に貼れるページ
- `images/` … 画像（note 見出し画像 1280×670、Threads 用 1080×1350）
- `src/` … 画像と貼り付けページを作るスクリプト

## 作り直し方（Mac）
```bash
python3 marketing/articles/claude-code-7tools/src/build.py          # 7ツール記事の画像
python3 marketing/articles/ai-starter-kit/src/build_kit.py          # スターターキットの画像
python3 marketing/articles/claude-code-7tools/src/make_paste.py marketing/articles/ai-starter-kit/kit.md kit_paste.html
```
画像は HTML をヘッドレス Chrome（`~/.cache/puppeteer/chrome-headless-shell`）で PNG にしている。デザインは紺 `#0E1525` × 黄 `#FFD23F`、フォントはヒラギノ。

## 書くときのルール
- 名義は Mao（@shachiku_mao）。本名・住んでいる地域・勤務先や業界は書かない
- 実際にあったことだけを書く。確認していない体験や気持ちを足さない
- 副業ドラフトは自作商品。紹介する段落では「ここからは宣伝です」と明示する
- 無料で使える範囲は「ヒヤリング・強み棚卸し・Threads 3本まで」。「全部無料」と読める書き方はしない
- 管理用 URL・キー・決済リンクは記事に載せない
