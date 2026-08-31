const VERSION = 'skystation-sports-v1.0.2';
const BASE = new URL('./', self.location).pathname;
const SHELL = new Set([BASE, `${BASE}index.html`, `${BASE}style.css`, `${BASE}app.js`, `${BASE}manifest.webmanifest`, `${BASE}icons/icon.svg`]);
self.addEventListener('install', event => event.waitUntil(caches.open(VERSION).then(cache => cache.addAll([...SHELL])).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('skystation-sports-') && key !== VERSION).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('message', event => { if (event.data?.type === 'SKIP_WAITING') self.skipWaiting(); });
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== location.origin) return;
  const path = new URL(event.request.url).pathname;
  if (!SHELL.has(path)) return;
  event.respondWith(fetch(event.request).then(response => { const copy=response.clone(); caches.open(VERSION).then(cache => cache.put(event.request, copy)); return response; }).catch(() => caches.match(event.request)));
});
