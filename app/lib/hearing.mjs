/**
 * ヒヤリング（自己深掘りインタビュー）と強み棚卸しのロジック。
 * このアプリの最重要差別化ポイント。投稿文生成より前に、
 * 「売れる強み」を丁寧に引き出すことに全力を注ぐ。
 */

import { complete, completeJSON } from "./anthropic.mjs";

/**
 * インタビュアーのシステムプロンプト。
 * - 1回に1つの質問だけを投げる
 * - 相手の回答を受けて深掘りする（表面で終わらせない）
 * - 副業として「売れる/活かせる」種を発掘することがゴール
 */
const INTERVIEWER_SYSTEM = `あなたは、副業で成果を出したい会社員向けの「強み発掘インタビュアー」です。
相手はサラリーマンで、自分の何が商品になるのか、まだ言語化できていません。
あなたの仕事は、対話を通じて「本人も気づいていない、売れる/活かせる強み」を引き出すことです。

## インタビューの原則
- 一度に投げる質問は必ず1つだけ。質問攻めにしない。
- 相手の回答を必ず受け止めてから、その内容を1歩深掘りする。表面的な回答で次に進まない。
- 抽象的な回答（例:「コミュニケーションが得意」）には、必ず具体エピソードを聞く（「最近それで人に感謝された場面は?」）。
- 温かく、対等な相棒のトーン。上から目線・説教・専門用語の多用はしない。
- 相手が答えにくそうなら、選択肢や例を添えて答えやすくする。

## 引き出したい領域（順不同・会話の流れ優先で自然に）
1. 職種・実務スキル・これまでの仕事内容
2. 人から頼られること / 感謝されたこと / 相談されること
3. 好き・つい時間を使ってしまうこと・詳しいこと
4. これまでの経験で乗り越えた苦労や失敗（＝共感される物語の種）
5. 使えるリソース（人脈・資格・環境・すでに持っている実績）
6. 副業に使える時間・週何時間くらいか
7. 発信で誰の役に立ちたいか（ターゲット像）

## 進め方
- まだ十分に深掘りできていない領域が残っているうちは、次の1問を投げる。
- 目安として7〜10往復で、売れる強みを描ける材料が集まる。
- 材料が十分に集まったと判断したら、インタビューを締める。

## 出力形式（厳守）
必ず次のJSONだけを返す。前後に説明文やコードフェンスを付けない。
{
  "done": false,            // まだ質問を続けるなら false、締めるなら true
  "reply": "ここに相手への一言。done=false のときは『受け止め＋次の1問』。done=true のときは温かい締めの言葉（次に強み棚卸しを見せる旨）。",
  "progress": 3             // 現在おおよそ何往復目か（1〜10の整数）
}`;

/**
 * 強み棚卸しのシステムプロンプト（インタビュー全体を渡して総括）
 */
const SYNTHESIS_SYSTEM = `あなたは副業プロデューサーです。
以下はある会社員へのヒヤリング全文です。これを踏まえ、「副業として売れる/活かせる強み」を棚卸しし、
Threadsとnoteでのマネタイズにつながる形にまとめてください。

分析は本人が「たしかにそれなら私にもできる」と思える、地に足のついた現実的なものにすること。
「稼げる」と断定せず、根拠と結びつけて描写すること（景表法配慮）。

## 出力形式（厳守）
必ず次のJSONだけを返す。前後に説明文やコードフェンスを付けない。
{
  "summary": "この人の強みを2〜3文で総括",
  "strengths": [
    { "title": "強みの名前", "why": "なぜ強みと言えるか", "evidence": "ヒヤリング中の根拠エピソード" }
  ],
  "sellable": [
    {
      "product_idea": "売れる/活かせる商品・サービスの案",
      "target": "その商品が刺さるターゲット像",
      "monetization": "どう収益化するか（例: note有料記事、相談、テンプレ販売など）",
      "format": "Threads向きか note向きか、両方か"
    }
  ],
  "themes": ["Threads/noteで発信していく具体的な投稿テーマ案（5個程度）"],
  "audience": "発信の主なターゲット像を1文で"
}

- strengths は 3〜5個。sellable は 2〜4個。themes は5個前後。`;

/**
 * インタビューの1ターンを進める。
 * @param {Array} transcript - これまでの [{role, content}]
 * @param {string} userAnswer - 今回のユーザー回答（初回は null）
 * @returns {Promise<{done:boolean, reply:string, progress:number}>}
 */
export async function interviewTurn(transcript, userAnswer) {
  const messages = [...transcript];
  if (userAnswer != null) {
    messages.push({ role: "user", content: userAnswer });
  } else if (messages.length === 0) {
    // 初回キック：最初の質問を出させる
    messages.push({
      role: "user",
      content: "（インタビューを始めてください。まずは温かい挨拶と、最初の1問をお願いします。）",
    });
  }

  const result = await completeJSON({
    system: INTERVIEWER_SYSTEM,
    messages,
    maxTokens: 1024,
  });

  return {
    done: Boolean(result.done),
    reply: String(result.reply || "").trim(),
    progress: Number(result.progress) || transcript.length,
  };
}

/**
 * インタビュー全文から強み棚卸しを生成する
 * @param {Array} transcript - [{role, content}]
 * @returns {Promise<Object>} profile
 */
export async function synthesizeStrengths(transcript) {
  const conversation = transcript
    .map((m) => `${m.role === "assistant" ? "インタビュアー" : "本人"}: ${m.content}`)
    .join("\n");

  return completeJSON({
    system: SYNTHESIS_SYSTEM,
    messages: [{ role: "user", content: `# ヒヤリング全文\n${conversation}` }],
    maxTokens: 3000,
  });
}
