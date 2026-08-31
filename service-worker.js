const VERSION = 'skystation-sports-v1.0.2';
const SHELL = new Set(['/', '/index.html', '/style.css', '/app.js', '/manifest.webmanifest', '/icons/icon.svg']);
self.addEventListener('install', event => event.waitUntil(caches.open(VERSION).then(cache => cache.addAll([...SHELL])).then(() => self.skipWaiting())));
self.addEventListener('activate', event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('skystation-sports-') && key !== VERSION).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== location.origin) return;
  const path = new URL(event.request.url).pathname;
  if (!SHELL.has(path)) return;
  event.respondWith(fetch(event.request).then(response => { const copy=response.clone(); caches.open(VERSION).then(cache => cache.put(event.request, copy)); return response; }).catch(() => caches.match(event.request)));
});
