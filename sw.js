const CACHE_NAME = "athenaeum-app-v4";
const CORE_ASSETS = ["./", "./index.html", "./manifest.webmanifest"];

const cacheResponse = async (request, response) => {
  if (!response || !response.ok || response.type !== "basic") return;
  const cache = await caches.open(CACHE_NAME);
  await cache.put(request, response.clone());
};

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: "window", includeUncontrolled: true }))
      .then((clients) => Promise.all(
        clients
          .filter((client) => new URL(client.url).origin === self.location.origin)
          .map((client) => ("navigate" in client ? client.navigate(client.url) : undefined))
      ))
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isNavigation = request.mode === "navigate" || request.destination === "document";

  event.respondWith(
    fetch(request)
      .then((response) => {
        cacheResponse(request, response);
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (isNavigation) return caches.match("./index.html");
        return Response.error();
      })
  );
});
