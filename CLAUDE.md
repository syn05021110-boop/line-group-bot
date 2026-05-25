# line-group-bot — LINE グループチャット Q&A Bot

公式LINEアカウントをグループチャットに参加させ、受講生の質問に Claude API で自動回答するBot。
佐藤 + 受講生 + Bot の3人グループで運用する。

## コマンド一覧

```bash
npm install                          # 依存関係インストール
npm start                            # サーバー起動（本番）
npm run dev                          # サーバー起動（開発・ファイル変更で自動再起動）
node tools/init-spreadsheet.mjs      # 管理スプシを新規作成（初回のみ）

# アフィリエイト投稿生成ツール
npm run init-affiliate               # アフィリエイト用シートを既存スプシに追加（初回のみ）
npm run generate-posts               # DMM/FANZA から作品取得 → 投稿候補を生成
npm run generate-posts -- --hits=10 --sort=date    # オプション付き実行
npm run generate-posts -- --dry-run                # 書き込まず生成内容のみ表示
```

## プロジェクト構成

```
line-group-bot/
├── CLAUDE.md                ← このファイル
├── package.json
├── server.mjs               ← メインサーバー（Express + LINE Webhook）
├── lib/
│   ├── ai.mjs               ← Claude API 回答生成（LINE Bot 用）
│   ├── sheets.mjs           ← Google Sheets 読み書き
│   ├── dmm.mjs              ← DMM/FANZA Web Service API クライアント
│   └── affiliate.mjs        ← Claude による投稿文生成
├── tools/
│   ├── init-spreadsheet.mjs       ← 管理スプシ作成スクリプト
│   ├── init-affiliate-sheets.mjs  ← アフィリエイト用シート追加
│   └── generate-posts.mjs         ← アフィリエイト投稿候補生成
├── credentials/
│   └── tokens.json          ← Google OAuth トークン
├── .env                     ← 環境変数（秘匿）
├── .env.example             ← 環境変数テンプレート
└── .gitignore
```

## スプレッドシート構成

1つのスプレッドシート「line-group-bot 管理」に3シート:

### シート1: `システムプロンプト`
- A1セルにシステムプロンプト全文を格納
- Bot の性格・回答ルール・トーンを定義
- スプシ上で直接編集すれば、コード変更なしで Bot の振る舞いを調整できる
- 5分間キャッシュ

### シート2: `ナレッジ`
- A列: カテゴリ、B列: 質問、C列: 回答
- Bot が回答時に参照するQ&A集
- 手動で追加・編集する運用
- 5分間キャッシュ

### グループ別シート: `{groupId}`
- グループごとに自動でシートが作成される（シート名 = LINE のグループID）
- A列: 日時、B列: ユーザーID、C列: 発言者、D列: メッセージ
- 全メッセージ（受講生 + Bot）を時系列で記録
- 回答生成時に直近10件を参照
- リアルタイム（キャッシュなし）
- 新しいグループが追加されると、自動でシートが追加される

## アーキテクチャ

```
受講生がグループLINEにメッセージ送信
    ↓
LINE Platform → Webhook → server.mjs
    ↓
handleEvent():
  1. テキストメッセージ + グループチャットのみ処理
  2. 管理者（佐藤さん）のメッセージはスキップ
  3. 管理者宛メンションが含まれるメッセージもスキップ
  4. 「応答生成中...」を即返信（replyToken）
  5. 受講生のメッセージをスプシに記録
  6. スプシから並列取得: システムプロンプト + ナレッジ + 会話履歴
  7. Claude API で回答生成
  8. Bot の回答をスプシに記録
  9. 本回答を push message でグループに送信
```

## Bot の動作ルール

| 状況 | Bot の動作 |
|------|----------|
| 受講生がメッセージを送る | 自動回答する |
| 佐藤さんがメッセージを送る | 無視する |
| 受講生が佐藤さん宛にメンション | 無視する（佐藤さんに任せる） |
| テキスト以外（画像・スタンプ等） | 無視する |
| 1対1トーク | 無視する（グループのみ） |

## 環境変数

```
LINE_CHANNEL_ACCESS_TOKEN    # LINE Messaging API チャンネルアクセストークン
LINE_CHANNEL_SECRET          # LINE Messaging API チャンネルシークレット
ANTHROPIC_API_KEY            # Claude API キー
GOOGLE_CLIENT_ID             # Google OAuth クライアントID
GOOGLE_CLIENT_SECRET         # Google OAuth クライアントシークレット
SPREADSHEET_ID               # line-group-bot 管理スプレッドシートID
ADMIN_USER_ID                # 管理者の LINE ユーザーID（スキップ対象）
PORT                         # サーバーポート（デフォルト: 3000）
DMM_API_ID                   # DMM/FANZA Web Service の API ID（投稿生成用）
DMM_AFFILIATE_ID             # DMM アフィリエイトID（例: foobar-990）
```

## アフィリエイト投稿生成ツール

LINE Bot 本体とは独立した補助ツール。
DMM/FANZA Web Service API から作品情報を取得し、Claude で X (Twitter) 用の紹介投稿文を生成して、
スプシに保存する。**投稿自体は手動コピペで行う**（自動投稿はしない）。

### なぜ自動投稿しないか

- X の自動投稿は規約上、同一/類似テキストの繰り返しやアフィリエイトリンク大量投稿はスパム判定でBAN対象
- Threads (Meta) はアダルトコンテンツ全面禁止
- DMM/FANZA アフィリエイト規約上も、不自然な大量流入は報酬却下・アカウント停止対象

→ 「投稿文の下書きを高速で大量生成して人間が選別・投稿」が現実的で持続可能。

### 初回セットアップ

1. https://affiliate.dmm.com/api/ で API ID を発行
2. アフィリエイト管理画面でアフィリエイトID（例: `foobar-990`）を確認
3. `.env` に `DMM_API_ID` と `DMM_AFFILIATE_ID` を追加
4. `npm run init-affiliate` で既存スプシに以下2シートを追加:
   - `アフィリエイト_プロンプト` — A1セルに投稿生成プロンプト（編集可）
   - `アフィリエイト_候補` — 生成された投稿候補

### 運用フロー

```
npm run generate-posts -- --hits=10
    ↓
1. DMM/FANZA API から作品取得（hits件）
2. 既にスプシに登録済みの作品IDを除外（重複防止）
3. アフィリエイト_プロンプト シートから生成プロンプトを取得
4. 各作品について Claude で投稿文を生成
5. アフィリエイト_候補 シートに追記
    ↓
スプシを開いて投稿文+リンクを X に手動コピペ投稿
（ステータス列を「投稿済」に手動更新すると管理しやすい）
```

### コマンドオプション

| オプション | 説明 | デフォルト |
|----------|------|----------|
| `--site` | DMM.com / FANZA | FANZA |
| `--service` | digital / mono / rental など | digital |
| `--floor` | videoa（アダルト動画）など | videoa |
| `--sort` | rank / date / review / -price | rank |
| `--hits` | 取得件数（最大100） | 20 |
| `--offset` | 検索開始位置 | 1 |
| `--keyword` | 検索キーワード | (なし) |
| `--dry-run` | スプシに書き込まず内容確認 | - |

## デプロイ（Render.com）

1. Render.com で新しい Web Service を作成
2. ビルドコマンド: `npm install`
3. スタートコマンド: `npm start`
4. 環境変数を全て設定
5. デプロイ後、URL をコピー
6. LINE Developers Console → Messaging API設定 → Webhook URL に `https://<render-url>/webhook` を設定
7. Webhook を「利用する」に変更
8. 「応答メッセージ」を「オフ」に変更（LINE Official Account Manager で設定）

## ADMIN_USER_ID の取得方法

Bot をグループに入れた後、佐藤さんがグループでメッセージを送ると、
サーバーログに `[message] group=... user=Uxxxx...` と表示される。
この `user=` の値が佐藤さんの LINE ユーザーID。
`.env` の `ADMIN_USER_ID` にセットする。

## よくあるエラーと対処法

| エラー | 原因 | 対応 |
|--------|------|------|
| `Invalid signature` | チャンネルシークレットが違う | .env の LINE_CHANNEL_SECRET を確認 |
| `Invalid reply token` | replyToken の期限切れ（30秒） | 処理を高速化する |
| `SPREADSHEET_ID が未設定` | .env にスプシIDがない | .env を確認 |
| `トークンファイルが見つかりません` | Google認証未設定 | credentials/tokens.json を確認 |
