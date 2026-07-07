# 副業ドラフト（fukugyo-draft-app）— MVP

サラリーマンの副業を後押しする「下書きツール」。
**自己ヒヤリング → 強み棚卸し → Threads 投稿文 / note 下書き生成** までを行う。
投稿自体は本人が行う「半自動（月5,000円想定）」プランの中核機能。

> 既存の LINE bot（リポジトリ直下）とは独立して動作する。

## 何ができるか（Phase1 スコープ）

1. **ヒヤリング** — AI が1問ずつ深掘りインタビューし、本人も気づいていない強みを引き出す（最重要の差別化ポイント）
2. **強み棚卸し** — 会話全体から「売れる/活かせる強み」「商品案」「発信テーマ」を構造化
3. **下書き生成**
   - Threads 投稿文（複数パターン、フック＋本文＋ハッシュタグ＋CTA）→ コピー / Threadsで開く
   - note 下書き（タイトル案＋見出し＋本文2,000〜3,500字＋CTA）→ コピー / note新規作成を開く

## 設計方針

- **note は自動投稿しない**（公式APIがなく、ブラウザ自動操作は規約・凍結リスクが高いため）。
  「下書き生成 → ワンタップでコピー → 本人が公開」に統一。
- Threads も MVP では投稿はせず、`intent/post` で本文プリフィルして開くところまで。
- 「稼げる」等の誇大表現を避けるプロンプト設計（景表法配慮）。

## セットアップ

```bash
cd app
npm install
cp .env.example .env      # ANTHROPIC_API_KEY を設定
npm start                 # http://localhost:4000
# 開発時: npm run dev
```

## 構成

```
app/
├── server.mjs           ← Express サーバー（API + 静的配信）
├── lib/
│   ├── anthropic.mjs    ← Claude 呼び出し + JSON 抽出（model: claude-opus-4-8）
│   ├── hearing.mjs      ← インタビュー進行 + 強み棚卸し
│   ├── content.mjs      ← Threads / note 生成
│   └── store.mjs        ← セッション保存（JSONファイル, MVP）
├── public/              ← フロントエンド（HTML/CSS/JS）
└── data/                ← セッション保存先（gitignore）
```

## API

| メソッド | パス | 役割 |
|---|---|---|
| POST | `/api/hearing/start` | ヒヤリング開始・最初の質問 |
| POST | `/api/hearing/message` | 回答送信 → 次の質問 or 締め（+棚卸し） |
| POST | `/api/strengths` | 棚卸しの再生成 |
| POST | `/api/generate/threads` | Threads 投稿文生成 |
| POST | `/api/generate/note` | note 下書き生成 |
| GET | `/api/session/:id` | セッション状態取得 |

## まだ入っていない（次フェーズ）

- 決済（Stripe サブスク ¥5,000 / ¥10,000）・会員管理・認証
- 特商法/解約導線
- LINE 集客導線との連携（既存 bot を土台に）
- 完全自動プラン（1週間スケジュール＋Threads公式API自動投稿、noteは下書き＋ワンタップ）
