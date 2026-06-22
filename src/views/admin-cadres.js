import { cadres, regions } from '../data/mock-data.js';
import { getScreeningRecords } from '../modules/storage.js';
import { escapeHtml, formatDate, resultBadge, setupModalButtons } from '../modules/screening.js';
import { adminLayout } from './admin-dashboard.js';

function statsForCadre(records, cadreName) {
  const own = records.filter((record) => record.cadre === cadreName);
  return {
    total: own.length,
    followUp: own.filter((record) => record.result === 'follow-up' || record.result === 'positive').length,
    monitor: own.filter((record) => record.result === 'monitor').length,
    pending: own.filter((record) => record.syncStatus !== 'synced').length,
    latest: own[0],
  };
}

export function adminCadresView() {
  const records = getScreeningRecords();
  const enriched = cadres.map((cadre) => ({ ...cadre, stats: statsForCadre(records, cadre.name) }));
  const maxTotal = Math.max(...enriched.map((cadre) => cadre.stats.total), 1);

  const content = `
    <div class="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-4">
      <div class="admin-title">
        <h1>Manajemen Kader</h1>
        <p>Direktori kader, cakupan wilayah, dan ringkasan beban skrining.</p>
      </div>
      <button class="btn btn-primary" type="button" data-toast="Tambah kader membutuhkan backend dan autentikasi peran pada tahap berikutnya.">
        <i class="bi bi-person-plus" aria-hidden="true"></i>
        Tambah Kader
      </button>
    </div>

    <section class="stat-grid stat-grid-4 mb-4">
      <div class="stat-card"><span>Kader Aktif</span><strong>${cadres.length}</strong></div>
      <div class="stat-card"><span>Wilayah</span><strong>${regions.length}</strong></div>
      <div class="stat-card"><span>Total Catatan</span><strong>${records.length}</strong></div>
      <div class="stat-card"><span>Tersimpan Lokal</span><strong>${records.filter((record) => record.syncStatus !== 'synced').length}</strong></div>
    </section>

    <div class="cadre-grid mb-4">
      ${enriched
        .map(
          (cadre) => `
            <article class="admin-card cadre-card">
              <div class="d-flex align-items-center gap-3">
                <img class="cadre-avatar" src="/images/avatar-kader-placeholder.svg" alt="" aria-hidden="true" />
                <div class="min-w-0">
                  <h2>${escapeHtml(cadre.name)}</h2>
                  <p>${escapeHtml(cadre.region)}</p>
                </div>
              </div>
              <div class="cadre-meter mt-3">
                <div class="d-flex justify-content-between small fw-bold mb-1">
                  <span>Skrining</span>
                  <span>${cadre.stats.total}</span>
                </div>
                <div class="progress">
                  <div class="progress-bar" style="width:${(cadre.stats.total / maxTotal) * 100}%"></div>
                </div>
              </div>
              <div class="cadre-card-stats">
                <span>${cadre.stats.monitor} pantau</span>
                <span>${cadre.stats.followUp} periksa</span>
                <span>${cadre.stats.pending} lokal</span>
              </div>
              <button class="btn btn-outline-primary w-100 mt-3" type="button" data-cadre="${cadre.id}">
                Detail Kader
              </button>
            </article>
          `,
        )
        .join('')}
    </div>

    <section class="table-card">
      <table class="table align-middle">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama</th>
            <th>Wilayah</th>
            <th>Skrining</th>
            <th>Perlu Pemantauan</th>
            <th>Perlu Pemeriksaan</th>
            <th>Aktivitas Terakhir</th>
          </tr>
        </thead>
        <tbody>
          ${enriched
            .map(
              (cadre) => `
                <tr>
                  <td>${escapeHtml(cadre.id)}</td>
                  <td><strong>${escapeHtml(cadre.name)}</strong></td>
                  <td>${escapeHtml(cadre.region)}</td>
                  <td>${cadre.stats.total}</td>
                  <td>${cadre.stats.monitor}</td>
                  <td>${cadre.stats.followUp}</td>
                  <td>${cadre.stats.latest ? `${formatDate(cadre.stats.latest.date)} ${resultBadge(cadre.stats.latest.result)}` : '-'}</td>
                </tr>
              `,
            )
            .join('')}
        </tbody>
      </table>
    </section>

    <div class="modal fade" id="cadreDetailModal" tabindex="-1" aria-labelledby="cadreDetailTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title fs-5" id="cadreDetailTitle">Detail Kader</h2>
            <button class="btn-close btn-close-white" type="button" data-bs-dismiss="modal" aria-label="Tutup"></button>
          </div>
          <div class="modal-body" id="cadreDetailBody"></div>
        </div>
      </div>
    </div>
  `;

  return {
    html: adminLayout(content, 'cadres'),
    mount({ app, showToast }) {
      setupModalButtons(app);
      app.querySelectorAll('[data-toast]').forEach((button) => {
        button.addEventListener('click', () => showToast(button.dataset.toast, 'info'));
      });
      app.querySelectorAll('[data-cadre]').forEach((button) => {
        button.addEventListener('click', () => {
          const cadre = enriched.find((item) => item.id === button.dataset.cadre);
          app.querySelector('#cadreDetailBody').innerHTML = `
            <div class="d-flex align-items-center gap-3 mb-3">
              <img class="cadre-avatar" src="/images/avatar-kader-placeholder.svg" alt="" aria-hidden="true" />
              <div>
                <strong>${escapeHtml(cadre.name)}</strong>
                <div class="muted">${escapeHtml(cadre.region)}</div>
              </div>
            </div>
            <ul class="summary-list">
              <li><span>ID Kader</span><strong>${escapeHtml(cadre.id)}</strong></li>
              <li><span>Status</span><strong>Aktif</strong></li>
              <li><span>Total Skrining</span><strong>${cadre.stats.total}</strong></li>
              <li><span>Tersimpan Lokal</span><strong>${cadre.stats.pending}</strong></li>
            </ul>
          `;
          window.bootstrap.Modal.getOrCreateInstance(app.querySelector('#cadreDetailModal')).show();
        });
      });
    },
  };
}
