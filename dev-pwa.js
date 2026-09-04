const localHost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
const reloadKey = 'sky-sw-reload-in-progress';
const startupScreen = document.querySelector('#startupScreen');
const startupStatus = document.querySelector('#startupStatus');
const setStartupStatus = text => { if (startupStatus) startupStatus.textContent = text; };
let progress = 0;
const progressTimer = setInterval(() => {
  progress = Math.min(100, progress + 2);
  setStartupStatus(`Loading ${progress}%`);
  if (progress >= 100) clearInterval(progressTimer);
}, 80);
window.skyStartupComplete = () => {
  clearInterval(progressTimer);
  setStartupStatus('Loading 100%');
  startupScreen?.classList.add('is-ready');
};

window.skyStartupReady = (async () => {
  setStartupStatus('Loading 0%');
  if (localHost) {
    const registrations = await navigator.serviceWorker?.getRegistrations() || [];
    await Promise.all(registrations.map(registration => registration.unregister()));
    return;
  }
  if (!('serviceWorker' in navigator)) return;

  const alreadyReloaded = sessionStorage.getItem(reloadKey) === '1';
  if (alreadyReloaded) sessionStorage.removeItem(reloadKey);
  let reloading = false;
  const onControllerChange = () => {
    if (reloading || alreadyReloaded) return;
    reloading = true;
    sessionStorage.setItem(reloadKey, '1');
    location.reload();
  };
  navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
  const registration = await navigator.serviceWorker.register('./service-worker.js', { scope: './', updateViaCache: 'none' });
  await Promise.race([registration.update(), new Promise(resolve => setTimeout(resolve, 5000))]);
  if (registration.waiting) registration.waiting.postMessage({ type: 'SKIP_WAITING' });
})().catch(error => {
  console.warn('[SkyStation Sports] Service worker startup check failed', error);
});
