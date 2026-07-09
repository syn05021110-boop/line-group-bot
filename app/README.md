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
├── tools/
│   └── make-icons.mjs   ← PWAアイコン生成（依存なし・pure Node）
├── public/              ← フロントエンド（HTML/CSS/JS）
│   ├── manifest.webmanifest ← PWA マニフェスト
│   ├── sw.js            ← Service Worker（オフライン起動・キャッシュ）
│   └── icons/           ← アイコン（192/512/apple-touch, 生成物）
└── data/                ← セッション保存先（gitignore）
```

## PWA（ホーム画面に追加してアプリのように使う）

このアプリは PWA として動作する。スマホで開くと「ホーム画面に追加」でき、
アプリのように全画面起動・オフラインでもシェル表示される。

- **Android / Chrome**: 画面に出る「追加」バナー（またはメニューの「アプリをインストール」）
- **iOS / Safari**: 共有ボタン →「ホーム画面に追加」
- アイコンを作り直す場合: `npm run icons`

> ⚠️ インストール（ホーム画面追加）は **HTTPS 環境が必須**（localhost は例外）。
> スマホで実際に追加するには、下記のデプロイで HTTPS の URL を用意する。

## デプロイ（Render.com 例）

1. Render.com で **Web Service** を新規作成し、このリポジトリを接続
2. **Root Directory**: `app`
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`
5. 環境変数に `ANTHROPIC_API_KEY` を設定（`PORT` は Render が自動注入）
6. デプロイ後の `https://<your-app>.onrender.com` をスマホで開けば PWA として追加可能
7. 公式LINE等の集客導線から、この URL に誘導する

> Render は HTTPS を自動付与するため、PWA インストール要件を満たす。
> セッションは現状 JSON ファイル保存（無料プランは再起動で消える可能性あり）。
> 永続化が必要になったら DB（Phase2）へ。

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
