/**
 * ヒヤリング（自己深掘りインタビュー）と強み棚卸しのロジック。
 * このアプリの最重要差別化ポイント。投稿文生成より前に、
 * 「売れる強み」を丁寧に引き出すことに全力を注ぐ。
 */

import { complete, completeJSON } from "./anthropic.mjs";

const DONE_MARK = /\[\[\s*DONE\s*\]\]/i;

/**
 * モデルが稀に漏らす「会話区切り記号」や役割ラベルを、表示前に除去する。
 * 文字列に依存せず、大文字＋アンダースコアのトークンや役割ラベル行を落とす。
 */
function cleanReply(text) {
  return String(text || "")
    // HUMAN_CONVERSATION_END / ASSISTANT_TURN_END など 大文字_大文字 のトークンを除去
    .replace(/\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b/g, "")
    // 行頭の役割ラベル（Human: / Assistant: / User: / System:）を除去
    .replace(/^[ \t]*(?:Human|Assistant|User|System)[ \t]*[:：]?[ \t]*/gim, "")
    // 余分な空行を詰める
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

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

## 締め方
- まだ深掘りできていない領域が残っているうちは、ふつうに次の1問を返す。
- 目安として7〜10往復で、売れる強みを描ける材料が集まる。
- 十分に材料が集まったと判断したら、感謝と「次に強み棚卸しを見せる」旨の温かい一言で締める。
- 締めるときだけ、メッセージの一番最後に半角で [[DONE]] とだけ書き足す（画面には出さない内部マーカー）。まだ続けるときは [[DONE]] を絶対に書かない。

## 出力（厳守）
- 返答は自然な日本語の文章だけにする。JSON・コード・箇条書きの多用はしない。
- 1メッセージにつき質問は1つまで。`;

/**
 * 強み棚卸しのシステムプロンプト（インタビュー全体を渡して総括）
 */
const SYNTHESIS_SYSTEM = `あなたは、単価30万円で個人の副業プロデュースを請け負うトップコンサルタントです。
以下はクライアント（会社員）へのヒヤリング全文です。これを踏まえ、有料級の「強み棚卸し・診断書」を作ります。

## 品質基準（重要）
- 本人が「そこまで見抜いてくれたのか」と唸る、鋭くて具体的な分析にする。当たり障りのない一般論は厳禁。
- ヒヤリングの固有名詞・エピソード・数字を必ず引用し、その人だけの内容にする。
- 「売れる」根拠を、需要（誰がお金を払うか）と供給（本人だからできる理由）の両面で描く。
- 「稼げる」と断定しない。根拠と結びつけて現実的に描写する（景表法配慮）。

## 出力形式（厳守）
必ず次のJSONだけを返す。前後に説明文やコードフェンスを付けない。
{
  "catchcopy": "その人を一言で言い表す、SNSプロフィールの見出しにそのまま使えるキャッチコピー（15〜28字、具体的で刺さる表現）",
  "summary": "この人の強みと、なぜ副業で戦えるのかを2〜3文で総括",
  "strengths": [
    { "title": "強みの名前", "why": "なぜ市場価値のある強みと言えるか", "evidence": "ヒヤリング中の根拠エピソード（固有名詞・数字入り）" }
  ],
  "sellable": [
    {
      "product_idea": "売れる/活かせる具体的な商品・サービス案",
      "target": "その商品にお金を払う具体的なターゲット像",
      "monetization": "どう収益化するか（例: note有料記事、個別相談、テンプレ販売、月額サロン等）",
      "format": "Threads向きか note向きか、両方か"
    }
  ],
  "themes": ["Threads/noteで発信していく、具体的でクリックしたくなる投稿テーマ案（5個程度）"],
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
  const history = [...transcript];
  if (userAnswer != null) {
    history.push({ role: "user", content: userAnswer });
  }

  // APIに渡す配列は必ず「ユーザー発話始まり」で整える。
  // 先頭がAIの挨拶(assistant)のままだとモデルが会話の区切りを誤解し、
  // 区切り記号(例: HUMAN_CONVERSATION_END)を出力してしまうことがあるため。
  const KICKOFF = "（インタビューを始めてください。まずは温かい挨拶と、最初の1問をお願いします。）";
  let messages;
  if (history.length === 0) {
    messages = [{ role: "user", content: KICKOFF }];
  } else if (history[0].role === "assistant") {
    messages = [{ role: "user", content: KICKOFF }, ...history];
  } else {
    messages = history;
  }

  // 会話は自然な文章で受け取り、締めサインだけを内部マーカーで判定（壊れにくい）
  // モデルが英語の役割ラベルや区切り記号を書き始めたら、そこで生成を止める
  const text = await complete({
    system: INTERVIEWER_SYSTEM,
    messages,
    maxTokens: 900,
    stopSequences: [
      "\nHuman:",
      "\nAssistant:",
      "\nUser:",
      "\nSystem:",
      "\n\nHuman",
      "\n\nUser",
      "\n\nAssistant",
      "Human:",
      "Assistant:",
      "User:",
      "HUMAN_CONVERSATION_END",
    ],
  });

  const done = DONE_MARK.test(text);
  const reply = cleanReply(text.replace(DONE_MARK, ""));
  const progress = history.filter((m) => m.role === "assistant").length + 1;

  return { done, reply, progress };
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
