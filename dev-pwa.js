// Localhost should always use the newest source files. Production PWA caching is untouched.
if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
  navigator.serviceWorker?.getRegistrations().then(registrations => Promise.all(registrations.map(registration => registration.unregister()))).then(() => console.info('[SkyStation Sports] Local development service worker disabled.')).catch(error => console.warn('[SkyStation Sports] Could not disable local service worker', error));
} else if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js', { updateViaCache: 'none' }).then(registration => registration.update()).catch(error => console.warn('[SkyStation Sports] Service worker registration failed', error));
}
