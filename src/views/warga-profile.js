import { connectionBadgeMarkup, connectionModeText } from '../modules/offline.js';
import {
  clearDraft,
  getAccessibleScreeningRecords,
  getCurrentUser,
  getMedicationHistoryForUser,
  setCurrentUser,
} from '../modules/storage.js';
import {
  appHeader,
  escapeHtml,
  formatDate,
  medicationStatusBadge,
  mobileShell,
  resultBadge,
} from '../modules/screening.js';

export function wargaProfileView() {
  const user = getCurrentUser() || { id: 'warga01', name: 'Warga Contoh AR', role: 'warga' };
  const records = getAccessibleScreeningRecords(user);
  const medicationHistory = getMedicationHistoryForUser(user.id);
  const latestScreening = records[0];
  const latestMedication = medicationHistory[0];

  const content = `
    ${appHeader('Profil Warga', 'Akun dan ringkasan data', {
      back: '/warga',
      action: connectionBadgeMarkup(),
    })}
    <div class="mobile-content">
      <section class="profile-hero">
        <img class="profile-avatar" src="/images/avatar-kader-placeholder.svg" alt="Avatar ${escapeHtml(user.name)}" />
        <div class="min-w-0">
          <span class="badge text-bg-success mb-2">Warga</span>
          <h2>${escapeHtml(user.name || '-')}</h2>
          <p>ID Warga: ${escapeHtml(user.id || '-')}</p>
        </div>
      </section>

      <section class="profile-status soft-card">
        <div>
          <span class="muted fw-bold">NIK</span>
          <strong>${escapeHtml(user.nik || '-')}</strong>
        </div>
        <div>
          <span class="muted fw-bold">Kader Pendamping</span>
          <strong>${escapeHtml(user.cadreName || 'Kader Asep')}</strong>
        </div>
      </section>

      <div class="alert alert-light border mt-3 mb-3" data-connection-message>
        ${connectionModeText()}
      </div>

      <section class="soft-card mb-3">
        <h2 class="section-title">Data Diri</h2>
        <ul class="summary-list">
          <li><span>Nama</span><strong>${escapeHtml(user.name || '-')}</strong></li>
          <li><span>Umur</span><strong>${escapeHtml(user.age || '-')} tahun</strong></li>
          <li><span>Jenis kelamin</span><strong>${escapeHtml(user.gender || '-')}</strong></li>
          <li><span>Alamat</span><strong>${escapeHtml(user.address || user.region || '-')}</strong></li>
          <li><span>No. HP</span><strong>${escapeHtml(user.phone || '-')}</strong></li>
        </ul>
      </section>

      <section class="profile-stat-grid mb-3" aria-label="Ringkasan aktivitas warga">
        <article class="profile-stat">
          <span>Riwayat Skrining</span>
          <strong>${records.length}</strong>
        </article>
        <article class="profile-stat">
          <span>Riwayat Obat</span>
          <strong>${medicationHistory.length}</strong>
        </article>
      </section>

      <section class="soft-card mb-3">
        <h2 class="section-title">Ringkasan Terakhir</h2>
        <div class="activity-item">
          <div>
            <strong>Skrining</strong>
            <div class="small muted">${latestScreening ? formatDate(latestScreening.date) : 'Belum ada data'}</div>
          </div>
          ${latestScreening ? resultBadge(latestScreening.result) : '<span class="badge text-bg-secondary">Belum Ada</span>'}
        </div>
        <div class="activity-item">
          <div>
            <strong>Minum Obat</strong>
            <div class="small muted">${latestMedication ? formatDate(latestMedication.tanggal) : 'Belum ada data'}</div>
          </div>
          ${medicationStatusBadge(latestMedication?.status_minum_obat || 'belum-update')}
        </div>
      </section>

      <section class="soft-card mb-3">
        <h2 class="section-title">Menu Cepat</h2>
        <div class="profile-action-list">
          <button type="button" data-nav="/skrining/data-warga">
            <i class="bi bi-clipboard2-plus-fill" aria-hidden="true"></i>
            <span>Isi Skrining Mandiri</span>
            <i class="bi bi-chevron-right" aria-hidden="true"></i>
          </button>
          <button type="button" data-nav="/warga/minum-obat">
            <i class="bi bi-capsule-pill" aria-hidden="true"></i>
            <span>Update Minum Obat</span>
            <i class="bi bi-chevron-right" aria-hidden="true"></i>
          </button>
        </div>
      </section>

      <button class="btn btn-outline-danger w-100 mb-3" type="button" id="logoutWargaProfile">
        <i class="bi bi-box-arrow-left" aria-hidden="true"></i>
        Keluar dari Akun Demo
      </button>
    </div>
  `;

  return {
    html: mobileShell(content, 'profil', '', 'warga'),
    mount({ app, navigate, showToast }) {
      app.querySelector('#logoutWargaProfile').addEventListener('click', () => {
        setCurrentUser(null);
        clearDraft();
        showToast('Akun warga keluar dari sesi lokal.', 'success');
        navigate('/login');
      });
    },
  };
}
