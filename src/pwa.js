import { registerSW } from 'virtual:pwa-register';

/* Service worker: caches the app so it opens with no connection.
   When a new version is deployed, it downloads in the background and we offer a reload
   (never forced, so a live set isn't interrupted). */
const updateSW = registerSW({
  onNeedRefresh() {
    if (document.querySelector('.pwa-bar')) return;
    const bar = document.createElement('div');
    bar.className = 'pwa-bar';
    bar.setAttribute('role', 'status');
    bar.innerHTML = '<span>New version available</span><button class="btn" data-pwa="later">Later</button><button class="btn primary" data-pwa="reload">Reload</button>';
    bar.addEventListener('click', e => {
      const a = e.target.closest('[data-pwa]');
      if (!a) return;
      if (a.dataset.pwa === 'reload') updateSW(true);
      bar.remove();
    });
    document.body.appendChild(bar);
  },
});
