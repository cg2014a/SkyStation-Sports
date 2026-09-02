const VERSION = 'skystation-sports-v1.0.24';
const ROOT = new URL('./', self.registration.scope).href;
const SHELL = [ROOT, './index.html', './style.css', './app.js', './dev-pwa.js', './manifest.webmanifest', './icons/icon.svg'].map(path => new URL(path, self.registration.scope).href);
const SHELL_URLS = new Set(SHELL);
self.addEventListener('install', event => event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('skystation-sports-') && key !== VERSION).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('message', event => { if (event.data?.type === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || !(event.request.mode === 'navigate' || SHELL_URLS.has(url.href))) return;
  event.respondWith((async () => {
    const cache = await caches.open(VERSION);
    try {
      const response = await fetch(event.request);
      if (response.ok) cache.put(event.request, response.clone());
      return response;
    } catch {
      return (await cache.match(event.request)) || (event.request.mode === 'navigate' ? await cache.match(ROOT) : null) || Response.error();
    }
  })());
});
