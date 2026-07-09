/* 副業ドラフト — Service Worker
 * アプリシェル(HTML/CSS/JS/アイコン)をキャッシュしてオフライン起動＆高速化。
 * API(/api/*)や POST は常にネットワーク（キャッシュしない）。
 */

const CACHE = "fukugyo-draft-v1";
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
  if (request.method !== "GET" || url.pathname.startsWith("/api/") || url.origin !== self.location.origin) {
    return;
  }

  // ナビゲーション（ページ遷移）はネット優先→失敗時キャッシュ（オフライン起動用）
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/index.html").then((r) => r || caches.match("/")))
    );
    return;
  }

  // 静的アセットはキャッシュ優先→無ければネット取得してキャッシュ
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
          return res;
        })
    )
  );
});
