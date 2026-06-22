import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'leaflet/dist/leaflet.css';
import './styles/app.css';
import './styles/mobile.css';
import './styles/admin.css';

import * as bootstrap from 'bootstrap';
import Alpine from 'alpinejs';
import { APP_TITLE } from './modules/branding.js';
import { createRouter } from './modules/router.js';
import { registerServiceWorker, setupOfflineStatus } from './modules/offline.js';

window.bootstrap = bootstrap;
window.Alpine = Alpine;
Alpine.start();

function showToast(message, tone = 'primary') {
  const root = document.getElementById('toast-root');
  const toast = document.createElement('div');
  const headerClass = {
    success: 'text-bg-success',
    danger: 'text-bg-danger',
    warning: 'text-bg-warning',
    info: 'text-bg-primary',
    primary: 'text-bg-primary',
  }[tone];

  toast.className = 'toast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.innerHTML = `
    <div class="toast-header ${headerClass} text-white">
      <strong class="me-auto">${APP_TITLE}</strong>
      <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Tutup"></button>
    </div>
    <div class="toast-body">${message}</div>
  `;
  root.appendChild(toast);

  const instance = bootstrap.Toast.getOrCreateInstance(toast, { delay: 3200 });
  toast.addEventListener('hidden.bs.toast', () => toast.remove());
  instance.show();
}

const app = document.getElementById('app');
createRouter(app, { showToast });
setupOfflineStatus();

if (import.meta.env.PROD) {
  registerServiceWorker();
} else if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
  });

  if ('caches' in window) {
    caches.keys().then((keys) => {
      keys
        .filter((key) => key.startsWith('sobat-baduy'))
        .forEach((key) => caches.delete(key));
    });
  }
}
