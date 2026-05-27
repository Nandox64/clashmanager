const SW_VERSION = 5;
const CACHE = "clashmanager-v" + SW_VERSION;

function isHtmlNav(req) {
  const accept = req.headers.get("Accept") || "";
  return accept.includes("text/html");
}

function hasHash(url) {
  return /[a-f0-9]{8,}\.(js|css)$/.test(url.pathname);
}

function isStaticAsset(url) {
  return /\.(js|css|png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|eot)$/.test(url.pathname);
}

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin GET requests
  if (url.origin !== self.location.origin || request.method !== "GET") return;

  // Never cache the service worker itself — let the browser fetch the latest version
  if (url.pathname === "/sw.js") return;

  // API requests: pasan directamente al servidor (ya tienen cache via Firestore)
  if (url.pathname.startsWith("/api/")) return;

  // HTML navigation: network first, sin cache (RSC streaming no es cacheable)
  if (isHtmlNav(request)) {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(request).then((cached) => cached || new Response("Offline", { status: 503 }))
      )
    );
    return;
  }

  // Assets with hash (immutable): cache first
  if (hasHash(url)) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then((cache) => cache.put(request, clone));
        return res;
      }))
    );
    return;
  }

  // Other static assets (images, fonts): cache first
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((res) => {
        const clone = res.clone();
        caches.open(CACHE).then((cache) => cache.put(request, clone));
        return res;
      }))
    );
    return;
  }

  // Everything else (e.g., Next.js data endpoints, _next/data): network first
  event.respondWith(
    fetch(request).catch(() =>
      caches.match(request).then((cached) => cached || new Response(null, { status: 504 }))
    )
  );
});
