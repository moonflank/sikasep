import { brandLogoPair, brandTitleMarkup } from '../modules/branding.js';
import { connectionBadgeMarkup, connectionModeText } from '../modules/offline.js';
import { getScreeningRecords } from '../modules/storage.js';
import { bottomNav, escapeHtml, formatDate, mobileShell, resultBadge } from '../modules/screening.js';

export function cadreDashboardView() {
  const records = getScreeningRecords().slice(0, 3);
  const content = `
    <div class="dashboard-hero">
      <img class="dashboard-village" src="/images/baduy-village.png" alt="" aria-hidden="true" />
      <div class="dashboard-brand">
        ${brandLogoPair('dashboard')}
        <div class="dashboard-brand-copy">
          ${brandTitleMarkup()}
        </div>
      </div>
      <p class="dashboard-greeting">Sampurasun, Kader Asep!</p>

      <div class="target-card">
        <div class="d-flex justify-content-between align-items-start gap-3">
          <div>
            <span class="muted fw-bold">Target Bulan Ini</span>
            <strong>12/50</strong>
            <div class="muted">Warga Diskrining</div>
          </div>
          ${connectionBadgeMarkup()}
        </div>
        <div class="progress mt-3" role="progressbar" aria-valuenow="24" aria-valuemin="0" aria-valuemax="100">
          <div class="progress-bar bg-success" style="width:24%"></div>
        </div>
        <p class="small muted mt-3 mb-0" data-connection-message>${connectionModeText()}</p>
      </div>
    </div>

    <div class="mobile-content">
      <section class="community-card" aria-label="Komunitas Baduy">
        <img src="/images/baduy-people.png" alt="" aria-hidden="true" />
        <div>
          <strong>Kader bersama warga</strong>
          <span>Pencatatan skrining berbasis komunitas.</span>
        </div>
      </section>

      <div class="tile-grid mb-3">
        <button class="tile tile-blue" type="button" data-nav="/skrining/data-warga">
          <i class="bi bi-person-plus-fill" aria-hidden="true"></i>
          <span>Skrining Warga Baru</span>
          <small>Mulai pencatatan</small>
        </button>
        <button class="tile tile-green" type="button" data-nav="/riwayat">
          <i class="bi bi-clipboard2-pulse-fill" aria-hidden="true"></i>
          <span>Riwayat Skrining</span>
          <small>Hasil positif/negatif</small>
        </button>
        <button class="tile tile-orange" type="button" data-nav="/edukasi">
          <i class="bi bi-play-circle-fill" aria-hidden="true"></i>
          <span>Edukasi Video</span>
          <small>Materi warga</small>
        </button>
        <button class="tile tile-blue" type="button" data-nav="/kader/minum-obat">
          <i class="bi bi-capsule-pill" aria-hidden="true"></i>
          <span>Monitoring Obat</span>
          <small>Status harian warga</small>
        </button>
        <button class="tile tile-outline" type="button" data-open-modal="#citizenDataModal">
          <i class="bi bi-people-fill" aria-hidden="true"></i>
          <span>Data Warga</span>
          <small>Daftar prototype</small>
        </button>
      </div>

      <section class="soft-card">
        <div class="d-flex align-items-center justify-content-between gap-3 mb-2">
          <h2 class="section-title mb-0">Riwayat Skrining Terbaru</h2>
          <button class="btn btn-sm btn-outline-primary" type="button" data-nav="/admin">
            Admin
          </button>
        </div>
        ${records
          .map(
            (record) => `
              <div class="activity-item">
                <div class="d-flex align-items-center gap-2 min-w-0">
                  <span class="initials">${record.initials}</span>
                  <div class="min-w-0">
                    <strong>${escapeHtml(record.patientName || record.region)}</strong>
                    <div class="small muted">${formatDate(record.date)} - ${escapeHtml(record.cadre)}</div>
                    <div class="small muted">${escapeHtml(record.address || record.region || '-')}</div>
                  </div>
                </div>
                ${resultBadge(record.result)}
              </div>
            `,
          )
          .join('')}
      </section>

    </div>

    <div class="modal fade" id="citizenDataModal" tabindex="-1" aria-labelledby="citizenDataTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title fs-5" id="citizenDataTitle">Data Warga Contoh</h2>
            <button class="btn-close btn-close-white" type="button" data-bs-dismiss="modal" aria-label="Tutup"></button>
          </div>
          <div class="modal-body">
            ${getScreeningRecords()
              .slice(0, 6)
              .map(
                (record) => `
                  <div class="activity-item">
                    <div class="d-flex align-items-center gap-2">
                      <span class="initials">${record.initials}</span>
                      <div>
                        <strong>${escapeHtml(record.patientName || record.region)}</strong>
                        <div class="small muted">${escapeHtml(record.gender)}, ${escapeHtml(record.age || '-')} tahun</div>
                        <div class="small muted">${escapeHtml(record.address || record.region || '-')}</div>
                      </div>
                    </div>
                    ${resultBadge(record.result)}
                  </div>
                `,
              )
              .join('')}
          </div>
        </div>
      </div>
    </div>
  `;

  return {
    html: `
      <main class="app-page">
        <section class="mobile-shell dashboard-shell">
          ${content}
          ${bottomNav('beranda')}
        </section>
      </main>
    `,
  };
}
