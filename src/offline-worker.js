/* global SHELL, VERSION */
const scope = self.registration.scope;
const cachePrefix = `nur-shell:${scope}:`;
const cacheName = `${cachePrefix}${VERSION}`;
const shellUrls = new Set(SHELL.map((file) => new URL(file, scope).href));
const indexUrl = new URL("index.html", scope).href;
const homePath = new URL(scope).pathname;
const indexPath = new URL(indexUrl).pathname;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(cacheName)
      .then((cache) =>
        cache.addAll(
          [...shellUrls].map((url) => new Request(url, { cache: "reload" })),
        ),
      ),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) {
        if (key.startsWith(cachePrefix) && key !== cacheName)
          await caches.delete(key);
      }
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (
    request.mode === "navigate" &&
    (url.pathname === homePath || url.pathname === indexPath)
  ) {
    event.respondWith(
      (async () => {
        try {
          return await fetch(request);
        } catch {
          const response = await (await caches.open(cacheName)).match(indexUrl);
          return response ?? Response.error();
        }
      })(),
    );
  } else if (shellUrls.has(url.href)) {
    event.respondWith(
      (async () => {
        const response = await (
          await caches.open(cacheName)
        ).match(url.href, { ignoreVary: true });
        return response ?? fetch(request);
      })(),
    );
  }
});
