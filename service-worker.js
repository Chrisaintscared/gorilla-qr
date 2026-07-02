// This service worker makes the photo page work offline reliably,
// instead of depending on the browser's own best-effort cache.
//
// How it works:
// 1. On first visit (needs internet), the browser downloads this
//    file and runs it in the background.
// 2. "install" step: it fetches and stores a copy of index.html
//    (and this script itself) in a dedicated cache.
// 3. From then on, "fetch" step: any request for this page is
//    answered straight from that cache first. If there's no
//    internet at all, the cached copy is served instead of failing.
// 4. Because the photo is already embedded as Base64 inside
//    index.html, caching the HTML file is enough — there's no
//    separate image file to worry about caching.

const CACHE_NAME = "gorilla-photo-cache-v1";
const FILES_TO_CACHE = [
  "./",
  "./index.html"
];

// Store the page in the cache as soon as the service worker installs.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting(); // activate this version immediately
});

// Clean up old cache versions if this file is ever updated later.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Serve from cache first; fall back to the network if not cached yet.
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});
