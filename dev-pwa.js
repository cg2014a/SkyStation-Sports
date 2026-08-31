// Localhost should always use the newest source files. Production PWA caching is untouched.
if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
  navigator.serviceWorker?.getRegistrations().then(registrations => Promise.all(registrations.map(registration => registration.unregister()))).then(() => console.info('[SkyStation Sports] Local development service worker disabled.')).catch(error => console.warn('[SkyStation Sports] Could not disable local service worker', error));
} else if ('serviceWorker' in navigator) {
  const reloadKey = 'sky-sw-reloaded-v1.0.2';
  sessionStorage.removeItem(reloadKey);
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (sessionStorage.getItem(reloadKey)) return;
    sessionStorage.setItem(reloadKey, '1');
    location.reload();
  });
  navigator.serviceWorker.register('./service-worker.js', { updateViaCache: 'none' }).then(registration => {
    registration.update();
    if (registration.waiting) registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      worker?.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) worker.postMessage({ type: 'SKIP_WAITING' });
      });
    });
  }).catch(error => console.warn('[SkyStation Sports] Service worker registration failed', error));
}
