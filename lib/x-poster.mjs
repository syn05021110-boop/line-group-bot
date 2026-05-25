/**
 * X (旧Twitter) API v2 への投稿ラッパー
 *
 * 必要な環境変数（X Developer Portal で Basic プラン以上を契約して取得）:
 *   X_API_KEY              Consumer Key (API Key)
 *   X_API_SECRET           Consumer Secret (API Key Secret)
 *   X_ACCESS_TOKEN         User Access Token
 *   X_ACCESS_TOKEN_SECRET  User Access Token Secret
 *
 * アダルトコンテンツを投稿する場合は X アカウント側で
 * 「メディアにセンシティブな内容を含む」設定を有効にしておくこと。
 */

import { TwitterApi } from "twitter-api-v2";

let _client;
function getClient() {
  if (_client) return _client;
  const { X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET } = process.env;
  if (!X_API_KEY || !X_API_SECRET || !X_ACCESS_TOKEN || !X_ACCESS_TOKEN_SECRET) {
    throw new Error("X_API_KEY / X_API_SECRET / X_ACCESS_TOKEN / X_ACCESS_TOKEN_SECRET が .env に設定されていません");
  }
  _client = new TwitterApi({
    appKey: X_API_KEY,
    appSecret: X_API_SECRET,
    accessToken: X_ACCESS_TOKEN,
    accessSecret: X_ACCESS_TOKEN_SECRET,
  });
  return _client;
}

/**
 * URL から画像を取得して X にアップロードし、media_id を返す
 */
async function uploadImage(imageUrl) {
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error(`画像取得失敗: HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get("content-type") || "image/jpeg";
  const mimeType = contentType.split(";")[0].trim();

  const client = getClient();
  return client.v1.uploadMedia(buf, { mimeType });
}

/**
 * テキスト + (任意で) 画像1枚を投稿する
 *
 * @param {object} opts
 * @param {string} opts.text       投稿本文
 * @param {string} [opts.imageUrl] 画像URL（添付したい場合）
 * @returns {Promise<{ id: string, url: string }>} 投稿ID + URL
 */
export async function postTweet({ text, imageUrl }) {
  const client = getClient();

  let mediaIds;
  if (imageUrl) {
    try {
      const mediaId = await uploadImage(imageUrl);
      mediaIds = [mediaId];
    } catch (err) {
      console.warn(`[x-poster] 画像アップロード失敗、テキストのみで投稿: ${err.message}`);
    }
  }

  const payload = {
    text,
    possibly_sensitive: true,
  };
  if (mediaIds) {
    payload.media = { media_ids: mediaIds };
  }

  const result = await client.v2.tweet(payload);
  const id = result.data.id;
  return { id, url: `https://x.com/i/web/status/${id}` };
}
