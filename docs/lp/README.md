# LP（ランディングページ）

チュートリアル教材を紹介するための LP です。2つのバリエーションがあります。

| ファイル | 用途 |
|---------|------|
| [`index.html`](./index.html) | スタンドアロン版。ブラウザで直接開ける（GitHub Pages 配信向け） |
| [`utage.html`](./utage.html) | **UTAGE 貼り付け用**。html/head/body 無し、スコープ済み |

---

## UTAGE への貼り付け手順

### 1. UTAGE 管理画面でページ編集を開く

UTAGE にログインし、新規ページを作成または既存ページを編集します。

### 2. カスタム HTML ブロックを追加

ページ編集画面で **「カスタムHTML」** または **「コード」** ブロック（プランによって名称が違うことがあります）を追加します。

### 3. `utage.html` の中身をコピペ

このリポジトリの `docs/lp/utage.html` を開き、**全ての中身をコピー** して、UTAGE のコードブロックに貼り付けます。

### 4. CTA リンクの確認

CTA ボタン（class="lp-cta"）の遷移先は、UTAGE 販売ページ
`https://utage-system.com/p/P8RZmter21Ai` に設定済みです。

別の URL に変えたい場合は、ファイル内 2 箇所の
`href="https://utage-system.com/p/P8RZmter21Ai"` を編集してください。

### 5. プレビューで確認

UTAGE のプレビュー機能で表示を確認します。崩れがある場合は下の「トラブル対応」を参照。

---

## UTAGE 用に施した調整

| 項目 | 内容 |
|------|------|
| ルート要素 | `<html>/<head>/<body>` を撤去し、`<div class="lp-root">` でラップ |
| スタイルのスコープ | 全 CSS を `.lp-root` 配下に閉じ込めて UTAGE のテーマと干渉しないように |
| Tailwind 設定 | `corePlugins: { preflight: false }` で UTAGE 既存要素の見た目を壊さない |
| Tailwind 優先度 | `important: ".lp-root"` で UTAGE の CSS に負けにくく |
| 追従ヘッダー | 撤去（UTAGE のグローバルヘッダーと衝突するため） |
| 内部ナビ | カリキュラムへのアンカー `#lp-chapters` のみ残置 |
| CTA リンク | UTAGE 販売ページ `https://utage-system.com/p/P8RZmter21Ai` を設定済み |
| 改行対策 | UTAGE が自動 `<br>` 挿入する問題を避けるため、流れる本文は1行に整形 |
| 理想の未来セクション | FAQ と最終 CTA の間に「読み終わった頃のあなた」を訴求するブロックを追加 |
| フォント | Noto Sans JP を Google Fonts から読み込み |

---

## トラブル対応

### Q. レイアウトが崩れる

- UTAGE のテンプレートが `body` に強い CSS を当てている可能性があります。`utage.html` の `<style>` ブロック内のセレクタを `.lp-root` で完全にスコープしているはずですが、UTAGE 側が `!important` で上書きしている場合は対象セレクタの末尾にも `!important` を足してください。

### Q. Tailwind が効かない

- UTAGE のセキュリティ設定で外部 JavaScript がブロックされている可能性があります。プラン設定で「外部スクリプトを許可」にしてください。
- もしくは `<script src="https://cdn.tailwindcss.com"></script>` の代わりに、ビルド済みの CSS を直接埋め込む方法に切り替える必要があります。

### Q. アイコンが絵文字で寂しい

- 元の `index.html` では SVG アイコンを使っていましたが、UTAGE での貼り付けやすさを優先して絵文字に置き換えました。SVG に戻したい場合は `index.html` のアイコン部分（`<svg>`要素）をコピーしてきてください。

### Q. セクションを 1 つずつ別ブロックに分けたい

`utage.html` の各 `<!-- ===== セクション名 ===== -->` コメントで区切られた `<section>` を、それぞれ別のコードブロックに貼り付けることができます。
ただし **先頭の `<link>` + `<script>` + `<style>` + `<div class="lp-root">` の開始タグ** はページの先頭ブロックに、`</div>` の閉じタグは最後のブロックに置く必要があります。

---

## ローカルで見た目を確認したいとき

```bash
# 普通の HTML として開く
open docs/lp/index.html       # Mac
start docs/lp/index.html      # Windows

# utage.html の単独プレビュー（簡易サーバー）
cd docs/lp
python3 -m http.server 8000
# → http://localhost:8000/utage.html
```

`utage.html` 単独だと `<html>` がないため一部ブラウザで表示が乱れることがあります。確実な見た目確認は `index.html` で行ってください。
