# note 公開準備インデックス（SEO記事12本）

> **いちばん楽な出し方**：`marketing/notes-paste/index.html` をブラウザで開く → 記事ごとにボタンでコピー → noteの下書きに貼る → ラベルの位置に画像を挿入。全32本（SEO12＋既存20）対応。


各記事＝「題名（note タイトル欄）／見出し画像（トップ画）／本文ファイル」。
note新規作成 → タイトル貼る → 見出し画像をアップ → 本文貼る → 本文中の `![この記事のポイント](...)` の行に画像を差し込む → 末尾CTAのURL確認 → 公開。
※ 本文の末尾はすでに LINE(lin.ee/RzyA13P)＋アプリURL入り。
※ 本文中の「まとめ」直前に `![この記事のポイント](note-images-seo/body/seo-XX-body.png)` を1枚入れてあります。この行の位置で、対応する body画像をドラッグ挿入してから、行は削除してください（読者の完読率・保存を狙う要点カード）。

| No | 題名（そのまま貼る） | 見出し画像 | 本文 | カテゴリ |
|----|------|------|------|------|
| 01 | 【2026年版】会社員がAIで副業を始める方法｜ゼロからの5ステップ | note-images-seo/seo-01.png | notes-seo/seo-01-ai-fukugyo-hajimekata.md | 副業の始め方 |
| 02 | 自分の強みがわからない人へ｜AIで5分で見つける方法【会社員向け】 | note-images-seo/seo-02.png | notes-seo/seo-02-tsuyomi-mitsukekata.md | 強み発見 |
| 03 | ChatGPTとClaude、副業の発信で使い分ける方法【会社員向け】 | note-images-seo/seo-03.png | notes-seo/seo-03-chatgpt-claude-tsukaiwake.md | AI活用 |
| 04 | AIプロンプトのコツ｜「いい感じにして」をやめるだけで出力が変わる | note-images-seo/seo-04.png | notes-seo/seo-04-prompt-kotsu.md | プロンプト |
| 05 | 会社にバレずに副業発信する方法｜身バレを防ぐ3つの工夫 | note-images-seo/seo-05.png | notes-seo/seo-05-kaisha-barezu-hasshin.md | 発信の型 |
| 06 | スキマ時間5分でできる、AI副業の作業リスト【会社員向け】 | note-images-seo/seo-06.png | notes-seo/seo-06-sukima-5fun-list.md | 時短術 |
| 07 | 0円から始めるAI副業｜最初の1ヶ月でやることロードマップ | note-images-seo/seo-07.png | notes-seo/seo-07-0en-1kagetsu-roadmap.md | 副業の始め方 |
| 08 | AIで書いた文章が"薄い"と感じる原因と、濃くする3つの直し方 | note-images-seo/seo-08.png | notes-seo/seo-08-ai-bunsho-usui.md | AI活用 |
| 09 | Threadsとnote、会社員はどっちから始めるべき？使い分けガイド | note-images-seo/seo-09.png | notes-seo/seo-09-threads-note-docchi.md | 発信の型 |
| 10 | 副業の"最初の商品"は何を売る？低リスクで始める順番 | note-images-seo/seo-10.png | notes-seo/seo-10-saisho-no-shohin.md | 収益化 |
| 11 | 発信が伸びないときに見直す3つのこと【チェックリスト】 | note-images-seo/seo-11.png | notes-seo/seo-11-nobinai-toki.md | 発信の型 |
| 12 | AIがある時代に、わざわざ"自分の言葉"で書く意味はあるのか | note-images-seo/seo-12.png | notes-seo/seo-12-jibun-no-kotoba-imi.md | 発信の型 |

## 公開のコツ
- 1日1本ペースで。公開したら `note-announce-drafts.md` の告知文でThreads/Xに流す
- 見出し画像は 1280×670（note最適）。デザインは紺#0E1525×黄#FFD23F で統一
- 本文中の要点カードは `note-images-seo/body/seo-XX-body.png`（1280×860）。見出し画像と同じ明朝エディトリアル調で統一済み
- 要点カードを再生成したいとき：`node marketing/make-body-cards.mjs`
