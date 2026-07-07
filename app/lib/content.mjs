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

const THREADS_SYSTEM = `あなたは Threads の伸びる投稿を書くプロの構成作家です。
与えられた「強み棚卸し」をもとに、その人が発信すべき Threads 投稿を複数パターン作ります。

## Threads 投稿のルール
- 1投稿は日本語で最大500字程度。スマホで読みやすい改行を使う。
- 冒頭2行(フック)で必ず手を止めさせる。
- 「本人の実体験・強み」から書き、一般論にしない。
- 押し売りにならない自然なCTA(例: プロフィールのリンク/公式LINEへ)を末尾に。
- ハッシュタグは2〜4個、日本語で実際に使われるもの。

## 出力形式（厳守）
必ず次のJSONだけを返す。前後に説明文やコードフェンスを付けない。
{
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
- posts は指定テーマに沿って3〜5個。`;

const NOTE_SYSTEM = `あなたは note でよく読まれる記事を書くプロのライターです。
与えられた「強み棚卸し」をもとに、その人が公開すべき note 記事の下書きを1本作ります。

## note 記事のルール
- 本人の実体験・強みを軸にした、読者の役に立つ記事。一般論の寄せ集めにしない。
- 冒頭で読者の悩みに共感し、読み進めたくなる導入にする。
- 見出しで構造化し、具体例・手順を入れる。
- 「稼げる」等の誇大表現は使わない。
- 末尾に自然なCTA(公式LINEなどフロント商品への誘導)。
- 本文は2000〜3500字程度の、そのまま公開できる完成度の下書き。

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
    maxTokens: 3000,
  });
  return result.posts || [];
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
