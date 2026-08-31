const localHost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
const reloadKey = 'sky-sw-reloaded-v1.0.3';
window.skyStartupReady = (async () => {
  if (localHost) {
    const registrations = await navigator.serviceWorker?.getRegistrations() || [];
    await Promise.all(registrations.map(registration => registration.unregister()));
    return;
  }
  if (!('serviceWorker' in navigator)) return;
  if (sessionStorage.getItem(reloadKey)) sessionStorage.removeItem(reloadKey);
  let reloading = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloading) return;
    reloading = true;
    sessionStorage.setItem(reloadKey, '1');
    location.reload();
  });
  const registration = await navigator.serviceWorker.register('./service-worker.js', { scope:'./', updateViaCache:'none' });
  await registration.update();
  const activate = worker => worker?.postMessage({ type:'SKIP_WAITING' });
  if (registration.waiting) activate(registration.waiting);
  else if (registration.installing) await new Promise(resolve => registration.installing.addEventListener('statechange', () => {
    if (registration.installing?.state === 'installed') activate(registration.installing);
    if (registration.installing?.state === 'installed' || registration.installing?.state === 'redundant') resolve();
  }));
})().catch(error => console.warn('[SkyStation Sports] Service worker startup check failed', error));
