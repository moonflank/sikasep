import { educationCards } from '../data/mock-data.js';
import { brandLogoPair, brandTitleMarkup } from '../modules/branding.js';
import { connectionBadgeMarkup, connectionModeText } from '../modules/offline.js';
import {
  getAccessibleScreeningRecords,
  clearDraft,
  getCurrentUser,
  getMedicationForUserDate,
  setCurrentUser,
  today,
} from '../modules/storage.js';
import {
  escapeHtml,
  formatDate,
  medicationStatusBadge,
  mobileShell,
  resultBadge,
} from '../modules/screening.js';

function latestRecordMarkup(record) {
  if (!record) {
    return `
      <div class="empty-state">
        Belum ada skrining tersimpan.
      </div>
    `;
  }

  return `
    <div class="activity-item">
      <div>
        <strong>${formatDate(record.date)}</strong>
        <div class="small muted">${escapeHtml(record.reasonSummary || '-')}</div>
      </div>
      ${resultBadge(record.result)}
    </div>
  `;
}

export function wargaDashboardView() {
  const user = getCurrentUser() || { id: 'warga01', name: 'Warga Contoh AR', role: 'warga' };
  const records = getAccessibleScreeningRecords(user);
  const latestRecord = records[0];
  const medicationToday = getMedicationForUserDate(user.id, today());
  const latestEducation = educationCards[0];

  const content = `
    <div class="dashboard-hero">
      <img class="dashboard-village" src="/images/baduy-village.png" alt="" aria-hidden="true" />
      <div class="dashboard-brand">
        ${brandLogoPair('dashboard')}
        <div class="dashboard-brand-copy">
          ${brandTitleMarkup()}
        </div>
      </div>
      <p class="dashboard-greeting">Sampurasun, ${escapeHtml(user.name)}!</p>

      <div class="target-card">
        <div class="d-flex justify-content-between align-items-start gap-3">
          <div>
            <span class="muted fw-bold">Status Hari Ini</span>
            <strong>${medicationToday ? 'Sudah Update' : 'Belum Update'}</strong>
            <div class="muted">${formatDate(today())}</div>
          </div>
          ${connectionBadgeMarkup()}
        </div>
        <p class="small muted mt-3 mb-0" data-connection-message>${connectionModeText()}</p>
      </div>
    </div>

    <div class="mobile-content">
      <section class="community-card" aria-label="Profil warga">
        <img src="/images/baduy-people.png" alt="" aria-hidden="true" />
        <div>
          <strong>${escapeHtml(user.name)}</strong>
          <span>${escapeHtml(user.address || user.region || '-')}</span>
        </div>
      </section>

      <div class="tile-grid mb-3">
        <button class="tile tile-blue" type="button" data-nav="/skrining/data-warga">
          <i class="bi bi-clipboard2-plus-fill" aria-hidden="true"></i>
          <span>Isi Skrining</span>
          <small>Skrining mandiri</small>
        </button>
        <button class="tile tile-green" type="button" data-nav="/warga/minum-obat">
          <i class="bi bi-capsule-pill" aria-hidden="true"></i>
          <span>Update Obat</span>
          <small>Status harian</small>
        </button>
      </div>

      <section class="soft-card mb-3">
        <h2 class="section-title">Status Skrining Terakhir</h2>
        ${latestRecordMarkup(latestRecord)}
      </section>

      <section class="soft-card mb-3">
        <div class="d-flex align-items-center justify-content-between gap-3">
          <div>
            <h2 class="section-title mb-1">Minum Obat Hari Ini</h2>
            <div class="small muted">${medicationToday?.jam_minum_obat ? `Jam ${escapeHtml(medicationToday.jam_minum_obat)}` : formatDate(today())}</div>
          </div>
          ${medicationStatusBadge(medicationToday?.status_minum_obat || 'belum-update')}
        </div>
        ${medicationToday?.catatan ? `<p class="muted mt-3 mb-0">${escapeHtml(medicationToday.catatan)}</p>` : ''}
      </section>

      <section class="soft-card">
        <div class="d-flex align-items-center justify-content-between gap-3 mb-2">
          <h2 class="section-title mb-0">Video Edukasi Terbaru</h2>
          <button class="btn btn-sm btn-outline-primary" type="button" data-nav="/warga/edukasi">Lihat</button>
        </div>
        <strong>${escapeHtml(latestEducation.title)}</strong>
        <p class="muted mb-0">${escapeHtml(latestEducation.summary)}</p>
      </section>

      <button class="btn btn-outline-danger w-100 mt-3" type="button" id="logoutWarga">
        <i class="bi bi-box-arrow-left" aria-hidden="true"></i>
        Keluar dari Akun Demo
      </button>
    </div>
  `;

  return {
    html: mobileShell(content, 'beranda', 'dashboard-shell', 'warga'),
    mount({ app, navigate, showToast }) {
      app.querySelector('#logoutWarga').addEventListener('click', () => {
        setCurrentUser(null);
        clearDraft();
        showToast('Akun warga keluar dari sesi lokal.', 'success');
        navigate('/login');
      });
    },
  };
}
