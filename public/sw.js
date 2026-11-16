/* Service worker de Mundo Explorer: funciona sin conexión para lo ya visitado. */
const VERSION = "v1";
const STATIC_CACHE = `static-${VERSION}`;
const PAGES_CACHE = `pages-${VERSION}`;
const FLAGS_CACHE = `flags-${VERSION}`;
const PRECACHE = ["/offline.html", "/icons/icon-192.png", "/icons/icon-512.png", "/manifest.webmanifest"];
const MAX_PAGES = 40;
const MAX_FLAGS = 300;

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !k.endsWith(VERSION)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

async function networkFirst(request, cacheName, fallbackUrl) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok && response.type === "basic") {
      cache.put(request, response.clone());
      trim(cacheName, MAX_PAGES);
    }
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (fallbackUrl) return (await caches.match(fallbackUrl)) || Response.error();
    return Response.error();
  }
}

async function cacheFirst(request, cacheName, max) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok || response.type === "opaque") {
    cache.put(request, response.clone());
    if (max) trim(cacheName, max);
  }
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  // Banderas (CDN externo): primero caché
  if (url.hostname === "flagcdn.com") {
    event.respondWith(cacheFirst(request, FLAGS_CACHE, MAX_FLAGS));
    return;
  }
  if (url.origin !== self.location.origin) return;
  // Nunca cachear la cuenta ni rutas de redirección aleatoria
  if (url.pathname.startsWith("/cuenta") || url.pathname.startsWith("/aleatorio")) return;

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }
  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, PAGES_CACHE, "/offline.html"));
    return;
  }
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request, PAGES_CACHE));
  }
});
