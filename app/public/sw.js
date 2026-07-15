/* 副業ドラフト — Service Worker
 * 方針: アプリのファイル(HTML/CSS/JS/アイコン)は「ネット優先」で取得する。
 *   → 常に最新の見た目に更新される。オフライン時だけ保存済みを表示。
 * API(/api/*)や POST は常にネットワーク（キャッシュしない）。
 */

const CACHE = "fukugyo-draft-v11"; // 更新時はここの数字を上げる
const SHELL = [
  "/",
  "/index.html",
  "/styles.css",
  "/app.js",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // GET 以外・API・別オリジンはそのままネットワークへ（キャッシュ対象外）
  if (
    request.method !== "GET" ||
    url.pathname.startsWith("/api/") ||
    url.origin !== self.location.origin
  ) {
    return;
  }

  // ネット優先: 最新を取得しキャッシュを更新。失敗(オフライン)時のみキャッシュを返す。
  event.respondWith(
    fetch(request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy));
        return res;
      })
      .catch(() =>
        caches.match(request).then((cached) => cached || caches.match("/index.html"))
      )
  );
});
