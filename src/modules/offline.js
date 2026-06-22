export function isOnline() {
  return navigator.onLine;
}

export function connectionText() {
  return isOnline()
    ? 'Online'
    : 'Offline - data akan disimpan sementara di perangkat';
}

export function connectionModeText() {
  return isOnline()
    ? 'Koneksi tersedia. Data prototipe dapat ditandai sebagai tersinkron.'
    : 'Mode offline aktif. Data sementara disimpan pada perangkat.';
}

export function connectionBadgeMarkup() {
  const tone = isOnline() ? 'success' : 'warning';
  const icon = isOnline() ? 'bi-wifi' : 'bi-wifi-off';
  return `<span class="badge text-bg-${tone} connection-badge" data-connection-badge>
    <i class="bi ${icon}" aria-hidden="true"></i> ${connectionText()}
  </span>`;
}

function refreshConnectionBadges() {
  document.querySelectorAll('[data-connection-badge]').forEach((badge) => {
    badge.className = `badge text-bg-${isOnline() ? 'success' : 'warning'} connection-badge`;
    badge.innerHTML = `<i class="bi ${isOnline() ? 'bi-wifi' : 'bi-wifi-off'}" aria-hidden="true"></i> ${connectionText()}`;
  });

  document.querySelectorAll('[data-connection-message]').forEach((element) => {
    element.textContent = connectionModeText();
  });
}

export function setupOfflineStatus() {
  window.addEventListener('online', refreshConnectionBadges);
  window.addEventListener('offline', refreshConnectionBadges);
  refreshConnectionBadges();
}

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }
}
