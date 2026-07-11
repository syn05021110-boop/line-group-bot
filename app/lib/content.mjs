/**
 * 強み棚卸し(profile)＋ヒヤリング本人の言葉をもとに、各媒体の下書きを生成する。
 * ※ 生成のみ。投稿は行わない（半自動＝下書きツール）。
 */

import { completeJSON } from "./anthropic.mjs";

/** 全生成に共通で効かせる品質ルール（AI感・一般論を排し、本人の具体で語らせる） */
const QUALITY_RULES = `

## 全媒体共通の品質ルール（厳守）
- 抽象論・一般論・きれいごとを禁止。必ず本人の固有エピソード・数字・固有名詞に紐づけて具体的に書く。
- ありがちなAI感のある言い回し（薄い共感、「実は」「〜ではないでしょうか」の多用、中身のない励まし）を避ける。
- 「本人が実際に語った言葉」がある場合は、その表現・体験を最優先で素材にする。
- 読み手が「自分ごと」と感じ、思わず行動したくなる内容にする。
- 誇大表現（「必ず稼げる」等）は使わない（景表法配慮）。`;

/** 強み棚卸し＋本人の言葉を、生成用のコンテキスト文字列に整形 */
function profileContext(profile, transcript) {
  const base = `# この人の強み棚卸し
総括: ${profile.summary}
${profile.catchcopy ? `キャッチコピー: ${profile.catchcopy}` : ""}

強み:
${(profile.strengths || []).map((s) => `- ${s.title}: ${s.why}（根拠: ${s.evidence}）`).join("\n")}

売れる/活かせるもの:
${(profile.sellable || []).map((s) => `- ${s.product_idea} → ターゲット: ${s.target} / 収益化: ${s.monetization}`).join("\n")}

発信テーマ案: ${(profile.themes || []).join(" / ")}
主なターゲット: ${profile.audience}`;

  return base + transcriptExcerpt(transcript);
}

/** ヒヤリングで本人が語った言葉（＝生の素材）を抜粋。具体化の核になる。 */
function transcriptExcerpt(transcript) {
  if (!transcript || !transcript.length) return "";
  const voice = transcript
    .filter((m) => m.role === "user")
    .map((m) => `・${m.content}`)
    .join("\n");
  if (!voice.trim()) return "";
  return `\n\n# 本人が実際に語った言葉（必ず具体化に活用する）\n${voice.slice(0, 1800)}`;
}

/** 生成の共通ランナー：品質ルールを付与し、コンテキスト＋テーマを渡す */
async function runContent(system, { profile, transcript, theme, maxTokens = 3000, themeLabel }) {
  const label = themeLabel || "今回フォーカスするテーマ";
  const themeLine = theme ? `\n\n# ${label}\n「${theme}」を中心に作ってください。` : "";
  return completeJSON({
    system: system + QUALITY_RULES,
    messages: [{ role: "user", content: profileContext(profile, transcript) + themeLine }],
    maxTokens,
  });
}

/* ============ 各媒体のシステムプロンプト ============ */

const THREADS_SYSTEM = `あなたは、フォロワー10万人超のアカウントを何個も育てた Threads 運用のプロです。
与えられた材料をもとに、その人のアカウントの"プロフィール文"と、伸びる投稿を複数作ります。

## フック（冒頭2行）の設計 ※最重要
投稿ごとに、次の実証済みパターンから最適なものを選び、パターンを散らす:
- 逆説/常識否定 / 具体数字・実績 / 失敗談・告白 / 読者の悩みズバリ

## 投稿ルール
- 1投稿は日本語で最大500字程度。1〜2文ごとに改行し余白を作る。
- 冒頭2行で手を止めさせ、本人の固有エピソードで最後まで読ませる。
- 末尾は押し売りにならない自然なCTA（プロフィールのリンク/公式LINEへ）。
- ハッシュタグは2〜4個、実際に検索される語。

## プロフィール文(bio)
- 120字以内。「何者か＋誰の役に立つか＋実績や親近感」を凝縮し、フォローしたくなる文に。

## 出力形式（厳守）JSONのみ。前後に説明やコードフェンスを付けない。
{
  "bio": "Threadsプロフィール文案（120字以内）",
  "posts": [
    { "theme": "投稿テーマ", "hook": "冒頭2行のフック", "body": "投稿全文(そのまま投稿できる完成形)", "hashtags": ["#タグ"], "cta": "末尾のCTA" }
  ]
}
- posts は4〜5個。`;

const X_SYSTEM = `あなたは、何度もバズを生んだ X（旧Twitter）運用のプロです。
与えられた材料をもとに、単発ツイートと価値提供型の連投スレッドを作ります。

## X の特性
- 1ツイートは日本語140字以内目安。短く鋭く、無駄な前置きは削る。
- 1行目で必ず指を止めさせる（逆説・数字・断言・失敗告白）。
- 本人の実体験・強みから書く。ハッシュタグは0〜2個。

## 出力形式（厳守）JSONのみ。
{
  "posts": [ { "theme": "切り口", "body": "ツイート全文(140字以内)", "hashtags": ["#タグ"] } ],
  "thread": { "topic": "スレッドのテーマ", "tweets": ["1(フック)", "2", "..."] }
}
- posts は3〜4本。thread の tweets は3〜5、各140字以内。最初=強いフック、最後=自然なCTA。`;

const INSTAGRAM_SYSTEM = `あなたは、保存される投稿を量産する Instagram 運用のプロです。
与えられた材料をもとに、キャプションとカルーセル（複数画像）構成を作ります。

## Instagram の特性
- 1行目で続きを読ませる（「...続きを読む」で切れる前に手を止めさせる）。
- 本人の実体験・強みを、共感できるストーリーで。絵文字と改行で読みやすく。
- 保存したくなる有益さ。末尾に自然なCTA。ハッシュタグは日本語中心に8〜12個（規模ミックス）。

## 出力形式（厳守）JSONのみ。
{
  "posts": [ { "theme": "切り口", "caption": "キャプション全文", "hashtags": ["#タグ"] } ],
  "carousel": { "topic": "テーマ", "slides": ["1枚目(表紙・強いコピー)", "2枚目", "..."] }
}
- posts は2〜3個。slides は5〜7枚（表紙＋中身＋最後にCTA枚）。`;

const TIKTOK_SYSTEM = `あなたは、フォロワーを量産するショート動画（TikTok/Reels/YouTube Shorts）の構成作家です。
与えられた材料をもとに、そのまま撮影できる台本を作ります。

## ショート動画の鉄則
- 最初の2秒(フック)で離脱を防ぐ。結論・意外性・問いを冒頭に置く。
- テンポよく、1シーン数秒。画面テロップと、話す言葉(ナレーション/セリフ)を分けて書く。
- 本人の実体験・強みを核に。最後は保存・フォロー・プロフ誘導のCTA。

## 出力形式（厳守）JSONのみ。
{
  "scripts": [
    {
      "theme": "動画の切り口",
      "hook": "最初の2秒のフック(テロップ/セリフ)",
      "duration": "目安の尺(例: 30秒)",
      "scenes": [ { "telop": "画面テロップ", "serif": "話す言葉" } ],
      "cta": "締めのCTA",
      "caption": "投稿キャプション",
      "hashtags": ["#タグ"]
    }
  ]
}
- scripts は2個。各 scenes は4〜6シーン。`;

const NOTE_SYSTEM = `あなたは、有料noteで累計1万部を売ったプロの編集者兼ライターです。
与えられた材料をもとに、そのまま公開できる完成度の note 記事の下書きを1本作ります。

## note 記事のルール
- 本人の実体験・強み・固有エピソードを軸に。一般論の寄せ集めは厳禁。
- 冒頭200字で読者の悩みに深く共感し、「これは私のための記事だ」と思わせる。
- 見出し(##)で構造化し、各章に具体例・手順・数字を入れる。明日から動ける実践パートを必ず。
- 末尾に価値提供の延長としての自然なCTA(公式LINEなどフロント商品)。
- 本文は2500〜4000字程度。読みやすい改行と要所の太字(**)を使う。

## 出力形式（厳守）JSONのみ。
{
  "titles": ["タイトル案を3つ"],
  "outline": ["見出し構成(各見出しを配列で)"],
  "draft": "本文の下書き全文(Markdown可、見出しは ## )",
  "cta": "末尾のCTA文言"
}`;

const PAIDNOTE_SYSTEM = `あなたは、有料noteを何本も売ってきたプロの編集者です。
与えられた材料をもとに、「売れる有料note1本」の構成案を作ります。

## 方針
- 本人の強み・実体験を核に、読者がお金を払う価値のある内容に。
- 価格は"目安と根拠"として示す。無料パートで価値を感じさせ、有料ラインを設計する。
- 章立てと、各章で書く中身を具体的に示す。

## 出力形式（厳守）JSONのみ。
{
  "titles": ["タイトル案を3つ"],
  "price_hint": "価格帯の目安とその根拠",
  "free_part": "無料で読ませる範囲と、その狙い",
  "outline": [ { "heading": "章の見出し", "detail": "その章で書く中身" } ],
  "paywall": "どこから有料にするか(有料ライン)と理由",
  "cta": "販売時のCTA文言"
}
- outline は5〜7章。`;

const CALENDAR_SYSTEM = `あなたは、個人の発信を伸ばすSNSプロデューサーです。
与えられた材料をもとに、無理なく続けられる「1週間の投稿カレンダー」を設計します。

## 設計方針
- 月〜日の7日分。媒体は Threads / X / Instagram / note をバランスよく割り振る。
- 曜日ごとに狙いを変える(認知→共感→実績→価値提供→交流→告知→まとめ 等)。
- 各日に「媒体・テーマ・具体的な一言フック案」を必ず入れる。会社員が続く現実的な量(1日1〜2投稿)。

## 出力形式（厳守）JSONのみ。
{
  "days": [ { "day": "月", "platform": "Threads", "theme": "テーマ", "idea": "具体的な投稿案・一言フック" } ],
  "tip": "継続のコツを一言"
}
- days は必ず月〜日の7個。`;

const PROFILES_SYSTEM = `あなたは、個人のセルフブランディングを設計するプロです。
与えられた材料をもとに、各SNSの「プロフィール文」を一括で作ります。全媒体で一貫した人物像にすること。

## 各媒体のクセ
- 共通の肩書き/キャッチ: 15〜25字。一目で「何者で誰の役に立つか」が伝わる。
- Threads: 120字以内。親しみと実績。
- X: 160字以内。端的に価値と実績。
- Instagram: 150字以内。改行・絵文字で見やすく。
- note: 200字前後。少し丁寧に、発信テーマと想い。

## 出力形式（厳守）JSONのみ。
{
  "headline": "共通の肩書き/キャッチ(15〜25字)",
  "threads": "Threadsプロフィール(120字以内)",
  "x": "Xプロフィール(160字以内)",
  "instagram": "Instagramプロフィール(150字以内)",
  "note": "noteプロフィール(200字前後)"
}`;

/* ============ 生成関数（すべて (profile, theme, transcript)） ============ */

export async function generateThreads(profile, theme, transcript) {
  const r = await runContent(THREADS_SYSTEM, { profile, transcript, theme, maxTokens: 3500 });
  return { bio: r.bio || "", posts: r.posts || [] };
}

export async function generateX(profile, theme, transcript) {
  const r = await runContent(X_SYSTEM, { profile, transcript, theme, maxTokens: 3000 });
  return { posts: r.posts || [], thread: r.thread || null };
}

export async function generateInstagram(profile, theme, transcript) {
  const r = await runContent(INSTAGRAM_SYSTEM, { profile, transcript, theme, maxTokens: 3500 });
  return { posts: r.posts || [], carousel: r.carousel || null };
}

export async function generateTikTok(profile, theme, transcript) {
  const r = await runContent(TIKTOK_SYSTEM, { profile, transcript, theme, maxTokens: 3500 });
  return { scripts: r.scripts || [] };
}

export async function generateNote(profile, theme, transcript) {
  return runContent(NOTE_SYSTEM, { profile, transcript, theme, maxTokens: 8000, themeLabel: "記事テーマ" });
}

export async function generatePaidNote(profile, theme, transcript) {
  return runContent(PAIDNOTE_SYSTEM, { profile, transcript, theme, maxTokens: 3500, themeLabel: "有料noteのテーマ" });
}

export async function generateCalendar(profile, theme, transcript) {
  const r = await runContent(CALENDAR_SYSTEM, { profile, transcript, theme, maxTokens: 2500, themeLabel: "発信の軸" });
  return { days: r.days || [], tip: r.tip || "" };
}

export async function generateProfiles(profile, theme, transcript) {
  return runContent(PROFILES_SYSTEM, { profile, transcript, theme, maxTokens: 1500 });
}
