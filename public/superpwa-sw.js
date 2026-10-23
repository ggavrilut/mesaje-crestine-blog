// The app's service worker (docs/specs/pwa.md), at the URL of the WordPress app's (SuperPWA),
// so it replaces that one on installed devices. On activation it deletes every cache that is
// not its own, SuperPWA's included. Pages: network first, the last 40 kept for offline;
// hashed build files: cache first; everything else, and other sites: not touched.
// Change VERSION whenever this file's behaviour changes: the old caches are then dropped.
const VERSION = 'mc-1';
const PAGES = `${VERSION}-pages`;
const ASSETS = `${VERSION}-assets`;
const OFFLINE = '/offline/';
const MAX_PAGES = 40;
const MAX_ASSETS = 150;

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(PAGES).then((cache) => cache.add(OFFLINE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== PAGES && key !== ASSETS).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') event.respondWith(page(request));
  else if (url.pathname.startsWith('/_astro/')) event.respondWith(asset(request));
});

async function page(request) {
  const cache = await caches.open(PAGES);
  try {
    const response = await fetch(request);
    // A redirected response cannot answer a navigation later; error pages are not worth keeping.
    if (response.ok && !response.redirected) {
      await cache.put(request, response.clone());
      await trim(cache, MAX_PAGES, OFFLINE);
    }
    return response;
  } catch {
    return (await cache.match(request, { ignoreSearch: true })) ?? (await cache.match(OFFLINE)) ?? Response.error();
  }
}

async function asset(request) {
  const cache = await caches.open(ASSETS);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    await cache.put(request, response.clone());
    await trim(cache, MAX_ASSETS);
  }
  return response;
}

/** Drops the oldest entries beyond `max`, never `keep`. */
async function trim(cache, max, keep) {
  const keys = (await cache.keys()).filter((key) => new URL(key.url).pathname !== keep);
  await Promise.all(keys.slice(0, Math.max(0, keys.length - max)).map((key) => cache.delete(key)));
}
