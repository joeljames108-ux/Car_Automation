// ====================================================================
// SERVICE WORKER — Static Asset Caching for Faster Reloads
// ====================================================================
// Caches:
// - Google Fonts (CSS + woff2 files)
// - GLB/GLTF 3D model files
// - Image textures and environment maps
// - JavaScript/CSS bundles (stale-while-revalidate)
// - Offline fallback page
// ====================================================================

const CACHE_NAME = "apex-engineer-v1";
const FONT_CACHE = "apex-fonts-v1";
const MODEL_CACHE = "apex-models-v1";
const IMAGE_CACHE = "apex-images-v1";

// Assets to pre-cache on install
const PRECACHE_URLS = [
  "/",
  "/index.html",
];

// Install: pre-cache critical assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME && key !== FONT_CACHE && key !== MODEL_CACHE && key !== IMAGE_CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: route to appropriate cache strategy
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip chrome-extension and non-http
  if (!url.protocol.startsWith("http")) return;

  // Font files → Cache-first (fonts rarely change)
  if (
    url.hostname === "fonts.googleapis.com" ||
    url.hostname === "fonts.gstatic.com" ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".woff")
  ) {
    event.respondWith(cacheFirst(request, FONT_CACHE));
    return;
  }

  // GLB/GLTF models → Cache-first (large, immutable)
  if (
    url.pathname.endsWith(".glb") ||
    url.pathname.endsWith(".gltf") ||
    url.pathname.endsWith(".fbx")
  ) {
    event.respondWith(cacheFirst(request, MODEL_CACHE));
    return;
  }

  // Images/textures → Cache-first
  if (
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".jpeg") ||
    url.pathname.endsWith(".webp") ||
    url.pathname.endsWith(".hdr") ||
    url.pathname.endsWith(".exr")
  ) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }

  // JS/CSS bundles → Stale-while-revalidate (serve cached, update in background)
  if (
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.includes("/assets/")
  ) {
    event.respondWith(staleWhileRevalidate(request, CACHE_NAME));
    return;
  }

  // HTML pages → Network-first (always get latest)
  if (request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(networkFirst(request, CACHE_NAME));
    return;
  }

  // Everything else → Network-first
  event.respondWith(networkFirst(request, CACHE_NAME));
});

// --- CACHE STRATEGIES ---

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response("Offline", { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cached = await caches.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      const cache = caches.open(cacheName);
      cache.then((c) => c.put(request, response.clone()));
    }
    return response;
  }).catch(() => cached);

  return cached || fetchPromise;
}
