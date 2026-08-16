/* PLAYED — service worker: cache-first so the whole experience,
   including Three.js and the case database, works fully offline. */

const VERSION = "played-v6";
const CORE = [
  ".",
  "index.html",
  "css/style.css?v=2026.2",
  "js/icons.js?v=2026.1",
  "js/i18n.js?v=2026.1",
  "js/main.js?v=2026.1",
  "js/game.js?v=2026.1",
  "js/network.js?v=2026.1",
  "js/real-cases.js?v=2026.1",
  "js/three-scenes.js?v=2026.1",
  "js/vendor/three.min.js",
  "manifest.webmanifest",
  "icon.svg",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then((hit) => {
      if (hit) return hit;
      return fetch(e.request).then((res) => {
        // opportunistically cache same-origin assets and Google Fonts
        const url = new URL(e.request.url);
        const cacheable = url.origin === location.origin
          || url.hostname === "fonts.googleapis.com"
          || url.hostname === "fonts.gstatic.com";
        if (cacheable && res.ok) {
          const clone = res.clone();
          caches.open(VERSION).then((c) => c.put(e.request, clone));
        }
        return res;
      }).catch(() => caches.match("index.html"));
    })
  );
});
