// Localhost should always use the newest source files. Production PWA caching is untouched.
if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
  navigator.serviceWorker?.getRegistrations().then(registrations => Promise.all(registrations.map(registration => registration.unregister()))).then(() => console.info('[SkyStation Sports] Local development service worker disabled.')).catch(error => console.warn('[SkyStation Sports] Could not disable local service worker', error));
}
