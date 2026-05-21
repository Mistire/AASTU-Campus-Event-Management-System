// ── CEMS Service Worker v2 ──────────────────────────────────────────────────
// Strategy:
//  • Static/_next assets  → Cache-First  (instant, background revalidate)
//  • Navigation pages     → Network-First (fresh content, falls back to cache)
//  • API calls            → Network-only  (never cache)
//  • Offline fallback     → /offline.html
// ────────────────────────────────────────────────────────────────────────────

const SW_VERSION   = "cems-v2";
const STATIC_CACHE = `${SW_VERSION}-static`;
const PAGE_CACHE   = `${SW_VERSION}-pages`;
const IMG_CACHE    = `${SW_VERSION}-images`;
const OFFLINE_URL  = "/offline.html";

// Assets pre-cached on install
const PRECACHE_URLS = [
  "/",
  "/offline.html",
  "/icon-192.png",
  "/icon-512.png",
  "/discovery",
  "/login",
];

// ── Install ──────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  console.log(`[SW ${SW_VERSION}] Installing`);
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn("[SW] Pre-cache partial failure (non-fatal):", err);
      });
    })
  );
  self.skipWaiting();
});

// ── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  console.log(`[SW ${SW_VERSION}] Activating – cleaning old caches`);
  const keepCaches = new Set([STATIC_CACHE, PAGE_CACHE, IMG_CACHE]);
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((n) => !keepCaches.has(n))
          .map((n) => {
            console.log("[SW] Deleting old cache:", n);
            return caches.delete(n);
          })
      )
    )
  );
  self.clients.claim();
});

// ── Helpers ───────────────────────────────────────────────────────────────────
function isNavigationRequest(req) {
  return req.mode === "navigate";
}

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/_next/image") ||
    /\.(js|css|woff2?|ttf|otf|eot)$/.test(url.pathname)
  );
}

function isImageAsset(url) {
  return /\.(png|jpg|jpeg|gif|svg|ico|webp|avif)$/.test(url.pathname);
}

function isApiCall(url) {
  return (
    url.pathname.startsWith("/api/") ||
    url.pathname.includes("_next/webpack-hmr") ||
    url.pathname.includes(".hot-update.")
  );
}

function isCrossOrigin(url) {
  return url.origin !== self.location.origin;
}

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Never intercept non-http, cross-origin, or API requests
  if (!url.protocol.startsWith("http")) return;
  if (isCrossOrigin(url)) return;
  if (isApiCall(url)) return;

  // ── Static assets: Cache-First ──
  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          // Background revalidate
          fetch(request)
            .then((res) => {
              if (res.ok) {
                caches.open(STATIC_CACHE).then((c) => c.put(request, res));
              }
            })
            .catch(() => {});
          return cached;
        }
        return fetch(request).then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(STATIC_CACHE).then((c) => c.put(request, clone));
          }
          return res;
        });
      })
    );
    return;
  }

  // ── Images: Cache-First with long TTL ──
  if (isImageAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(IMG_CACHE).then((c) => c.put(request, clone));
          }
          return res;
        }).catch(() =>
          new Response("", { status: 503, statusText: "Offline" })
        );
      })
    );
    return;
  }

  // ── Navigation: Network-First, fallback to cache, then /offline.html ──
  if (isNavigationRequest(request)) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(PAGE_CACHE).then((c) => c.put(request, clone));
          }
          return res;
        })
        .catch(() =>
          caches.match(request).then((cached) => {
            if (cached) return cached;
            return caches.match(OFFLINE_URL);
          })
        )
    );
    return;
  }

  // ── Everything else: Network-First ──
  event.respondWith(
    fetch(request).catch(() =>
      caches.match(request).then(
        (cached) =>
          cached ||
          new Response("Offline", { status: 503, statusText: "Offline" })
      )
    )
  );
});

// ── Push Notifications (future-ready) ────────────────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || "CEMS", {
      body: data.body || "",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: data.tag || "cems-notification",
      data: { url: data.url || "/" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        const existing = clientList.find((c) => c.url === targetUrl && "focus" in c);
        if (existing) return existing.focus();
        return clients.openWindow(targetUrl);
      })
  );
});
