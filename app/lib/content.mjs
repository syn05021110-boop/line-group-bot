/**
 * 強み棚卸し(profile)をもとに Threads 投稿文 / note 下書きを生成する。
 * ※ 生成のみ。投稿は行わない（半自動＝下書きツール）。
 */

import { completeJSON } from "./anthropic.mjs";

function profileContext(profile) {
  return `# この人の強み棚卸し
総括: ${profile.summary}

強み:
${(profile.strengths || []).map((s) => `- ${s.title}: ${s.why}（根拠: ${s.evidence}）`).join("\n")}

売れる/活かせるもの:
${(profile.sellable || []).map((s) => `- ${s.product_idea} → ターゲット: ${s.target} / 収益化: ${s.monetization}`).join("\n")}

発信テーマ案: ${(profile.themes || []).join(" / ")}
主なターゲット: ${profile.audience}`;
}

const THREADS_SYSTEM = `あなたは、フォロワー10万人超のアカウントを何個も育てた Threads 運用のプロです。
与えられた「強み棚卸し」をもとに、その人のアカウントの"プロフィール文"と、伸びる投稿を複数作ります。

## フック（冒頭2行）の設計 ※最重要
次のような実証済みパターンから、投稿ごとに最適なものを選ぶ:
- 逆説/常識否定（例:「頑張るほど副業がうまくいかない理由」）
- 具体数字/実績（例:「未経験から3ヶ月でフォロワー1000人になった話」）
- 失敗談/告白（例:「正直、最初の投稿は3いいねでした」）
- 読者の悩みズバリ（例:「"自分には発信することがない"と思ってる人へ」）

## 投稿ルール
- 1投稿は日本語で最大500字程度。スマホで読みやすいよう、1〜2文ごとに改行し余白を作る。
- 必ず「本人の実体験・強み・固有エピソード」から書く。一般論・きれいごとにしない。
- 冒頭2行で手を止めさせ、最後まで読ませる流れを作る。
- 末尾は押し売りにならない自然なCTA（プロフィールのリンク/公式LINEへ誘導）。
- ハッシュタグは2〜4個、日本語で実際に検索される語。

## プロフィール文（bio）
- 120字以内。「何者か＋誰の役に立つか＋実績や親近感」を凝縮し、フォローしたくなる文にする。

## 出力形式（厳守）
必ず次のJSONだけを返す。前後に説明文やコードフェンスを付けない。
{
  "bio": "Threadsプロフィール文案（120字以内）",
  "posts": [
    {
      "theme": "この投稿のテーマ",
      "hook": "冒頭2行のフック",
      "body": "本文（フックを含む投稿全文。そのままコピペして投稿できる完成形）",
      "hashtags": ["#タグ1", "#タグ2"],
      "cta": "末尾のCTA文言"
    }
  ]
}
- posts は指定テーマに沿って、フックのパターンを散らして4〜5個。`;

const NOTE_SYSTEM = `あなたは、有料noteで累計1万部を売ったプロの編集者兼ライターです。
与えられた「強み棚卸し」をもとに、その人が公開すべき note 記事の下書きを1本、そのまま出せる完成度で作ります。

## note 記事のルール
- 本人の実体験・強み・固有エピソードを軸にした、読者の役に立つ記事。一般論の寄せ集めは厳禁。
- 冒頭200字で読者の悩みに深く共感し、「これは私のための記事だ」と思わせて読み進めさせる。
- 見出し（##）で構造化し、各章に具体例・手順・数字を入れて説得力を持たせる。
- 読者が明日から動ける「実践パート」を必ず入れる。
- 「稼げる」等の誇大表現は使わない（景表法配慮）。
- 末尾に、価値提供の延長として自然なCTA（公式LINEなどフロント商品への誘導）。
- 本文は2500〜4000字程度。読みやすい改行と、要所に太字（**）を使う。

## 出力形式（厳守）
必ず次のJSONだけを返す。前後に説明文やコードフェンスを付けない。
{
  "titles": ["タイトル案を3つ"],
  "outline": ["見出し構成（各見出しを配列で）"],
  "draft": "本文の下書き全文（Markdown可。見出しは ## を使う）",
  "cta": "末尾のCTA文言"
}`;

/**
 * Threads 投稿文を生成
 * @param {Object} profile
 * @param {string} [theme] - 任意: 特定テーマに絞る場合
 */
export async function generateThreads(profile, theme) {
  const themeLine = theme
    ? `\n\n# 今回フォーカスするテーマ\n「${theme}」を中心に投稿を作ってください。`
    : "";
  const result = await completeJSON({
    system: THREADS_SYSTEM,
    messages: [{ role: "user", content: profileContext(profile) + themeLine }],
    maxTokens: 3500,
  });
  return { bio: result.bio || "", posts: result.posts || [] };
}

/**
 * note 記事の下書きを生成
 * @param {Object} profile
 * @param {string} [theme]
 */
export async function generateNote(profile, theme) {
  const themeLine = theme
    ? `\n\n# 今回の記事テーマ\n「${theme}」で書いてください。`
    : "";
  return completeJSON({
    system: NOTE_SYSTEM,
    messages: [{ role: "user", content: profileContext(profile) + themeLine }],
    maxTokens: 8000,
  });
}
