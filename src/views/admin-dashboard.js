import { cadres } from '../data/mock-data.js';
import { APP_TITLE } from '../modules/branding.js';
import { getReferralRecords, getScreeningRecords } from '../modules/storage.js';
import {
  escapeHtml,
  formatDate,
  resultBadge,
  setupModalButtons,
  syncBadge,
} from '../modules/screening.js';
import { renderAdminCharts } from '../modules/charts.js';
import { renderRiskMap } from '../modules/map.js';

function adminNav(active = 'summary') {
  const items = [
    { id: 'summary', label: 'Ringkasan', icon: 'bi-grid-1x2-fill', route: '/admin' },
    { id: 'data', label: 'Data Skrining', icon: 'bi-table', route: '/admin/data-skrining' },
    { id: 'referrals', label: 'Rujukan', icon: 'bi-hospital', route: '/admin/rujukan' },
    { id: 'cadres', label: 'Kader', icon: 'bi-people-fill', route: '/admin/kader' },
    { id: 'education', label: 'Edukasi', icon: 'bi-play-circle-fill', route: '/admin/edukasi' },
    { id: 'reports', label: 'Laporan', icon: 'bi-file-earmark-text', route: '/admin/laporan' },
    { id: 'settings', label: 'Pengaturan', icon: 'bi-gear-fill', route: '/admin/pengaturan' },
    { id: 'kader', label: 'Kembali ke Mode Kader', icon: 'bi-phone', route: '/kader' },
  ];

  return `
    <nav class="admin-nav" aria-label="Navigasi admin">
      ${items
        .map((item) =>
          `
            <button class="${active === item.id ? 'active' : ''}" type="button" data-nav="${item.route}">
              <i class="bi ${item.icon}" aria-hidden="true"></i>
              ${item.label}
            </button>
          `,
        )
        .join('')}
    </nav>
  `;
}

export function adminLayout(content, active = 'summary') {
  return `
    <main class="admin-page">
      <div class="admin-topbar">
        <button class="icon-button" type="button" data-bs-toggle="offcanvas" data-bs-target="#adminMenu" aria-label="Buka navigasi admin">
          <i class="bi bi-list"></i>
        </button>
        <strong>${APP_TITLE} Admin</strong>
        <button class="icon-button" type="button" data-open-modal="#securityModal" aria-label="Keamanan dan etika">
          <i class="bi bi-shield-lock"></i>
        </button>
      </div>
      <div class="admin-layout">
        <aside class="admin-sidebar">
          <div class="admin-brand">
            <img src="/favicon.svg" alt="" aria-hidden="true" />
            <div>
              <strong>${APP_TITLE}</strong>
              <span>Puskesmas Cisimeut</span>
            </div>
          </div>
          ${adminNav(active)}
        </aside>
        <section class="admin-main">
          ${content}
        </section>
      </div>

      <div class="offcanvas offcanvas-start" tabindex="-1" id="adminMenu" aria-labelledby="adminMenuTitle">
        <div class="offcanvas-header">
          <h2 class="offcanvas-title fs-5" id="adminMenuTitle">Navigasi Admin</h2>
          <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Tutup"></button>
        </div>
        <div class="offcanvas-body bg-dark">
          ${adminNav(active)}
        </div>
      </div>

      <div class="modal fade" id="securityModal" tabindex="-1" aria-labelledby="securityModalTitle" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h2 class="modal-title fs-5" id="securityModalTitle">Keamanan dan Etika Data</h2>
              <button class="btn-close btn-close-white" type="button" data-bs-dismiss="modal" aria-label="Tutup"></button>
            </div>
            <div class="modal-body">
              <ul>
                <li>Akses terbatas berdasarkan peran.</li>
                <li>Persetujuan warga sebelum pencatatan.</li>
                <li>Gunakan inisial pada tampilan daftar.</li>
                <li>Hindari membagikan data kesehatan melalui kanal tidak resmi.</li>
                <li>Data prototipe hanya disimpan secara lokal.</li>
                <li>Enkripsi dan autentikasi server merupakan pengembangan tahap lanjutan.</li>
                <li>Pengembangan sistem perlu memperhatikan etika kesehatan dan adat setempat.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  `;
}

export function adminDashboardView() {
  const records = getScreeningRecords();
  const referralRecords = getReferralRecords();
  const recent = records.slice(0, 6);
  const followUpCount = records.filter((record) => record.result === 'follow-up' || record.result === 'positive').length;
  const monitorCount = records.filter((record) => record.result === 'monitor').length;

  const content = `
    <div class="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-4">
      <div class="admin-title">
        <h1>Dashboard Monitoring ${APP_TITLE}</h1>
        <p>Puskesmas Cisimeut - Prototipe Monitoring Skrining</p>
      </div>
      <button class="btn btn-outline-primary" type="button" data-open-modal="#securityModal">
        <i class="bi bi-shield-lock" aria-hidden="true"></i>
        Keamanan Data
      </button>
    </div>

    <section class="stat-grid mb-4">
      <div class="stat-card"><span>Total Skrining</span><strong>48</strong></div>
      <div class="stat-card"><span>Skrining Bulan Ini</span><strong>12</strong></div>
      <div class="stat-card"><span>Perlu Pemantauan</span><strong>7</strong></div>
      <div class="stat-card"><span>Perlu Pemeriksaan</span><strong>4</strong></div>
      <div class="stat-card"><span>Kader Aktif</span><strong>${cadres.length}</strong></div>
    </section>

    <div class="row g-4 mb-4">
      <div class="col-lg-8">
        <section class="chart-card">
          <h2 class="section-title">Aktivitas Skrining Bulanan</h2>
          <div class="chart-box">
            <canvas id="monthlyChart" aria-label="Grafik aktivitas skrining bulanan"></canvas>
          </div>
        </section>
      </div>
      <div class="col-lg-4">
        <section class="chart-card">
          <h2 class="section-title">Kategori Hasil Skrining</h2>
          <div class="chart-box">
            <canvas id="categoryChart" aria-label="Grafik kategori hasil skrining"></canvas>
          </div>
        </section>
      </div>
    </div>

    <div class="row g-4 mb-4">
      <div class="col-xl-7">
        <section class="admin-card">
          <div class="d-flex align-items-start justify-content-between gap-3 mb-3">
            <div>
              <h2 class="section-title mb-1">Peta Ilustratif Distribusi Risiko</h2>
              <p class="muted mb-0">Lokasi pada prototipe hanya berupa ilustrasi wilayah dan bukan lokasi rumah warga.</p>
            </div>
          </div>
          <div id="riskMap" role="img" aria-label="Peta ilustratif distribusi risiko"></div>
        </section>
      </div>
      <div class="col-xl-5">
        <section class="admin-card h-100">
          <h2 class="section-title">Rujukan Terbaru</h2>
          ${referralRecords
            .map(
              (item) => `
                <div class="activity-item">
                  <div>
                    <strong>${item.initials}</strong>
                    <div class="small muted">${formatDate(item.date)} - ${escapeHtml(item.cadre)}</div>
                  </div>
                  <span class="badge text-bg-primary">${escapeHtml(item.status)}</span>
                </div>
              `,
            )
            .join('')}
        </section>
      </div>
    </div>

    <section class="table-card">
      <div class="p-3 d-flex justify-content-between align-items-center gap-3">
        <div>
          <h2 class="section-title mb-1">Skrining Terbaru</h2>
          <p class="muted mb-0">${monitorCount} perlu pemantauan, ${followUpCount} perlu pemeriksaan.</p>
        </div>
        <button class="btn btn-outline-primary" type="button" data-nav="/admin/data-skrining">Lihat Data</button>
      </div>
      <table class="table align-middle">
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Inisial</th>
            <th>Kampung</th>
            <th>Kader</th>
            <th>Hasil</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${recent
            .map(
              (record) => `
                <tr>
                  <td>${formatDate(record.date)}</td>
                  <td><strong>${record.initials}</strong></td>
                  <td>${escapeHtml(record.region)}</td>
                  <td>${escapeHtml(record.cadre)}</td>
                  <td>${resultBadge(record.result)}</td>
                  <td>${syncBadge(record.syncStatus)}</td>
                </tr>
              `,
            )
            .join('')}
        </tbody>
      </table>
    </section>
  `;

  return {
    html: adminLayout(content, 'summary'),
    mount({ app }) {
      setupModalButtons(app);
      renderAdminCharts();
      renderRiskMap();
    },
  };
}
