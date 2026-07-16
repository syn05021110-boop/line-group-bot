/**
 * Threads 自動投稿クライアント（公式 Threads API / 依存追加なし・fetch のみ）
 *
 * 投稿は2ステップ:
 *   1) メディアコンテナを作成（テキスト） → creation_id を得る
 *   2) そのコンテナを公開（publish）
 *
 * 参考: https://developers.facebook.com/docs/threads
 *
 * 環境変数:
 *   THREADS_ACCESS_TOKEN … 長期アクセストークン（60日有効・要更新）
 *   THREADS_USER_ID       … 自分のThreadsユーザーID（未設定なら "me" を使う）
 */

const GRAPH = "https://graph.threads.net/v1.0";

function token() {
  return process.env.THREADS_ACCESS_TOKEN || "";
}
function userId() {
  return process.env.THREADS_USER_ID || "me";
}

export function threadsConfigured() {
  return Boolean(token());
}

async function callThreads(path, params) {
  const url = `${GRAPH}/${path}`;
  const body = new URLSearchParams({ ...params, access_token: token() });
  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    const msg = data && data.error ? data.error.message : `HTTP ${r.status}`;
    throw new Error(`Threads API: ${msg}`);
  }
  return data;
}

/** テキスト投稿を1件公開する。成功で投稿IDを返す。 */
export async function publishThreadsPost(text) {
  if (!token()) throw new Error("THREADS_ACCESS_TOKEN が未設定です");
  const clean = String(text || "").trim();
  if (!clean) throw new Error("投稿テキストが空です");
  if (clean.length > 500) throw new Error("Threadsの上限500字を超えています");

  // 1) コンテナ作成
  const created = await callThreads(`${userId()}/threads`, {
    media_type: "TEXT",
    text: clean,
  });
  const creationId = created.id;
  if (!creationId) throw new Error("creation_id が取得できませんでした");

  // Threads推奨: 公開まで少し待つ（コンテナ処理待ち）
  await sleep(3000);

  // 2) 公開
  const published = await callThreads(`${userId()}/threads_publish`, {
    creation_id: creationId,
  });
  return published.id || creationId;
}

/**
 * 長期トークンを更新（60日 → さらに60日）。
 * 新トークンを返すだけ（保存は呼び出し側/環境変数の手動更新）。
 */
export async function refreshThreadsToken() {
  if (!token()) throw new Error("THREADS_ACCESS_TOKEN が未設定です");
  const url =
    `${GRAPH}/refresh_access_token?grant_type=th_refresh_token` +
    `&access_token=${encodeURIComponent(token())}`;
  const r = await fetch(url);
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    const msg = data && data.error ? data.error.message : `HTTP ${r.status}`;
    throw new Error(`トークン更新失敗: ${msg}`);
  }
  return data; // { access_token, token_type, expires_in }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
