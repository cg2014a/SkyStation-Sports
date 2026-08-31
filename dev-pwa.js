const localHost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
const reloadKey = 'sky-sw-reloaded-v1.0.5';
const startupScreen = document.querySelector('#startupScreen');
const startupStatus = document.querySelector('#startupStatus');

const setStartupStatus = text => { if (startupStatus) startupStatus.textContent = text; };
window.skyStartupComplete = () => startupScreen?.classList.add('is-ready');

const waitForInstallation = worker => new Promise(resolve => {
  const check = () => {
    if (worker.state === 'installed' || worker.state === 'activated') {
      worker.postMessage({ type: 'SKIP_WAITING' });
      worker.removeEventListener('statechange', check);
      resolve(true);
    } else if (worker.state === 'redundant') {
      worker.removeEventListener('statechange', check);
      resolve(false);
    }
  };
  worker.addEventListener('statechange', check);
  check();
});

window.skyStartupReady = (async () => {
  setStartupStatus('Loading...');
  if (localHost) {
    const registrations = await navigator.serviceWorker?.getRegistrations() || [];
    await Promise.all(registrations.map(registration => registration.unregister()));
    return;
  }
  if (!('serviceWorker' in navigator)) return;

  const initialController = navigator.serviceWorker.controller;
  let controlChanged = false;
  let resolveControlChange;
  const controlledByNewWorker = new Promise(resolve => { resolveControlChange = resolve; });
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (navigator.serviceWorker.controller === initialController) return;
    controlChanged = true;
    resolveControlChange();
  });

  const registration = await navigator.serviceWorker.register('./service-worker.js', { scope: './', updateViaCache: 'none' });
  let observedWorker;
  let installation;
  const observeInstallation = () => {
    const worker = registration.installing;
    if (!worker || worker === observedWorker) return;
    observedWorker = worker;
    installation = waitForInstallation(worker);
  };
  registration.addEventListener('updatefound', observeInstallation);
  observeInstallation();
  await registration.update();
  observeInstallation();

  let updateFound = Boolean(registration.waiting || registration.installing || installation);
  if (registration.waiting) registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  if (installation) updateFound = await installation || updateFound;
  updateFound ||= controlChanged;

  if (updateFound) {
    if (!controlChanged) await controlledByNewWorker;
    if (sessionStorage.getItem(reloadKey) !== '1') {
      sessionStorage.setItem(reloadKey, '1');
      location.reload();
      await new Promise(() => {});
    }
  }
  sessionStorage.removeItem(reloadKey);
})().catch(error => {
  console.warn('[SkyStation Sports] Service worker startup check failed', error);
  sessionStorage.removeItem(reloadKey);
});
