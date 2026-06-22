import { connectionBadgeMarkup, connectionModeText } from '../modules/offline.js';
import { getCurrentUser, getScreeningRecords, setCurrentUser } from '../modules/storage.js';
import {
  appHeader,
  escapeHtml,
  formatDate,
  mobileShell,
  resultBadge,
  setupModalButtons,
  syncBadge,
} from '../modules/screening.js';

function activityStats(records, cadreName) {
  const ownRecords = records.filter((record) => record.cadre === cadreName);
  const pending = ownRecords.filter((record) => record.syncStatus !== 'synced').length;
  const followUp = ownRecords.filter((record) => record.result === 'follow-up' || record.result === 'positive').length;
  const monitor = ownRecords.filter((record) => record.result === 'monitor').length;

  return {
    total: ownRecords.length,
    pending,
    followUp,
    monitor,
    recent: ownRecords.slice(0, 3),
  };
}

export function cadreProfileView() {
  const user = getCurrentUser() || { id: 'kader01', name: 'Kader Asep', role: 'kader' };
  const records = getScreeningRecords();
  const stats = activityStats(records, user.name);
  const region = 'Kp. Kaduketug';

  const content = `
    ${appHeader('Profil Kader', 'Akun dan aktivitas prototype', {
      back: '/kader',
      action: connectionBadgeMarkup(),
    })}
    <div class="mobile-content">
      <section class="profile-hero">
        <img class="profile-avatar" src="/images/avatar-kader-placeholder.svg" alt="Avatar ${escapeHtml(user.name)}" />
        <div class="min-w-0">
          <span class="badge text-bg-primary mb-2">Kader Kesehatan</span>
          <h2>${escapeHtml(user.name)}</h2>
          <p>ID Kader: ${escapeHtml(user.id || 'kader01')}</p>
        </div>
      </section>

      <section class="profile-status soft-card">
        <div>
          <span class="muted fw-bold">Wilayah Tugas</span>
          <strong>${region}</strong>
        </div>
        <div>
          <span class="muted fw-bold">Status Akun</span>
          <strong>Demo Aktif</strong>
        </div>
      </section>

      <div class="alert alert-light border mt-3 mb-3" data-connection-message>
        ${connectionModeText()}
      </div>

      <section class="profile-stat-grid mb-3" aria-label="Ringkasan aktivitas kader">
        <article class="profile-stat">
          <span>Total Skrining</span>
          <strong>${stats.total}</strong>
        </article>
        <article class="profile-stat">
          <span>Perlu Pemantauan</span>
          <strong>${stats.monitor}</strong>
        </article>
        <article class="profile-stat">
          <span>Perlu Pemeriksaan</span>
          <strong>${stats.followUp}</strong>
        </article>
        <article class="profile-stat">
          <span>Tersimpan Lokal</span>
          <strong>${stats.pending}</strong>
        </article>
      </section>

      <section class="soft-card mb-3">
        <div class="d-flex align-items-center justify-content-between gap-3 mb-2">
          <h2 class="section-title mb-0">Aktivitas Kader</h2>
          <button class="btn btn-sm btn-outline-primary" type="button" data-nav="/riwayat">Lihat Riwayat</button>
        </div>
        ${
          stats.recent.length
            ? stats.recent
                .map(
                  (record) => `
                    <div class="activity-item">
                      <div class="d-flex align-items-center gap-2 min-w-0">
                        <span class="initials">${record.initials}</span>
                        <div class="min-w-0">
                          <strong>${escapeHtml(record.region)}</strong>
                          <div class="small muted">${formatDate(record.date)}</div>
                          <div class="mt-1">${syncBadge(record.syncStatus)}</div>
                        </div>
                      </div>
                      ${resultBadge(record.result)}
                    </div>
                  `,
                )
                .join('')
            : '<div class="empty-state">Belum ada aktivitas untuk kader ini.</div>'
        }
      </section>

      <section class="soft-card mb-3">
        <h2 class="section-title">Pengaturan Prototype</h2>
        <div class="profile-action-list">
          <button type="button" data-toast="Edit profil belum tersedia pada prototype.">
            <i class="bi bi-pencil-square" aria-hidden="true"></i>
            <span>Edit Profil Kader</span>
            <i class="bi bi-chevron-right" aria-hidden="true"></i>
          </button>
          <button type="button" data-open-modal="#profileSecurityModal">
            <i class="bi bi-shield-lock" aria-hidden="true"></i>
            <span>Keamanan dan Etika Data</span>
            <i class="bi bi-chevron-right" aria-hidden="true"></i>
          </button>
          <button type="button" data-nav="/admin">
            <i class="bi bi-speedometer2" aria-hidden="true"></i>
            <span>Buka Mode Admin</span>
            <i class="bi bi-chevron-right" aria-hidden="true"></i>
          </button>
        </div>
      </section>

      <button class="btn btn-outline-danger w-100 mb-3" type="button" id="logoutDemo">
        <i class="bi bi-box-arrow-left" aria-hidden="true"></i>
        Keluar dari Akun Demo
      </button>

      <div class="pattern-strip" aria-hidden="true"></div>
    </div>

    <div class="modal fade" id="profileSecurityModal" tabindex="-1" aria-labelledby="profileSecurityTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title fs-5" id="profileSecurityTitle">Keamanan dan Etika Data</h2>
            <button class="btn-close btn-close-white" type="button" data-bs-dismiss="modal" aria-label="Tutup"></button>
          </div>
          <div class="modal-body">
            <ul>
              <li>Gunakan inisial pada daftar warga.</li>
              <li>Minta persetujuan warga sebelum mencatat data.</li>
              <li>Hindari membagikan informasi kesehatan melalui kanal tidak resmi.</li>
              <li>Data prototype hanya disimpan secara lokal di perangkat.</li>
              <li>Sinkronisasi server aman adalah pengembangan tahap berikutnya.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `;

  return {
    html: mobileShell(content, 'profil'),
    mount({ app, navigate, showToast }) {
      setupModalButtons(app);

      app.querySelectorAll('[data-toast]').forEach((button) => {
        button.addEventListener('click', () => showToast(button.dataset.toast, 'info'));
      });

      app.querySelector('#logoutDemo').addEventListener('click', () => {
        setCurrentUser(null);
        showToast('Akun demo keluar dari sesi lokal.', 'success');
        navigate('/login');
      });
    },
  };
}
