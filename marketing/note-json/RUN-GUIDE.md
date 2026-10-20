# note 下書き自動投入ガイド（全32本）

note編集画面で `note-json/runner.js` を流すと、原稿JSONを下書きとして自動入力します（タイトル・本文・見出し画像・本文中カードまで）。**note にログイン済みの Mac のブラウザ**で実行してください。

## 事前準備
1. このブランチを push 済みにする（画像・JSONを raw.githubusercontent から取得するため）
   - 生成し直す場合：`node marketing/build-note-json.mjs`（JSON）／ `node marketing/make-body-cards.mjs`・`node marketing/make-body-cards-notes.mjs`（本文カード）
2. note で「新しく記事を書く」→ 空の編集画面を開く

## 1本の手順
1. 空の記事を新規作成（editor.note.com の編集画面）
2. ブラウザの開発者ツール → Console を開く
3. `marketing/note-json/runner.js` の中身を**全文コピペして実行**（1回貼れば `window.__start` が使える）
4. `window.__start('seo-01.json')` を実行 ← 画像フォルダは JSON が自動指定
5. 入力が終わるまで待つ（`window.__res` に結果が入る。`status:"draft"` / `ph:false` ならOK）
6. `window.__close()` で閉じる → 下書き一覧に入る
7. 次の記事は「新規作成」からやり直し（runnerは毎回貼り直すのが確実）

> `window.__res` の見方：`figs`＝入った画像数、`eyecatch:true`＝見出し画像OK、`ph:false`＝プレースホルダ残りなし、`log` に各画像の ok/NG。

## 投入順（コピペ用）

### SEO 12本（検索流入ねらい・優先）
```
window.__start('seo-01.json')
window.__start('seo-02.json')
window.__start('seo-03.json')
window.__start('seo-04.json')
window.__start('seo-05.json')
window.__start('seo-06.json')
window.__start('seo-07.json')
window.__start('seo-08.json')
window.__start('seo-09.json')
window.__start('seo-10.json')
window.__start('seo-11.json')
window.__start('seo-12.json')
```

### 既存 note 20本
```
window.__start('note-01.json')
window.__start('note-02.json')
window.__start('note-03.json')
window.__start('note-04.json')
window.__start('note-05.json')
window.__start('note-06.json')
window.__start('note-07.json')
window.__start('note-08.json')
window.__start('note-09.json')
window.__start('note-10.json')
window.__start('note-11.json')
window.__start('note-12.json')
window.__start('note-13.json')
window.__start('note-14.json')
window.__start('note-15.json')
window.__start('note-16.json')
window.__start('note-17.json')
window.__start('note-18.json')
window.__start('note-19.json')
window.__start('note-20.json')
```

## 注意
- 下書きは**自動公開しません**。公開はnoteの画面で内容を確認してから手動で。
- 見出し（大見出し）が普通の文字になっていたら、その行を選んで「大見出し」に設定。
- NGが出た画像は、`log` の名前の画像を手動で差し込めばOK（`marketing/note-images*/…`）。
