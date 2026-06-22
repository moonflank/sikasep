import { cadres, regions } from '../data/mock-data.js';
import { getReferralRecords, getScreeningRecords } from '../modules/storage.js';
import { setupModalButtons } from '../modules/screening.js';
import { adminLayout } from './admin-dashboard.js';

function countBy(records, key) {
  return records.reduce((acc, item) => {
    const value = item[key] || '-';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function csvEscape(value = '') {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function downloadSummaryCsv(records, referrals) {
  const rows = [
    ['Metrik', 'Nilai'],
    ['Total Skrining', records.length],
    ['Risiko Rendah', records.filter((record) => record.result === 'low').length],
    ['Perlu Pemantauan', records.filter((record) => record.result === 'monitor').length],
    ['Perlu Pemeriksaan / Positif', records.filter((record) => record.result === 'follow-up' || record.result === 'positive').length],
    ['Total Rujukan', referrals.length],
  ];
  const csv = rows.map((row) => row.map(csvEscape).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'sobat-baduy-ringkasan-laporan.csv';
  link.click();
  URL.revokeObjectURL(url);
}

export function adminReportsView() {
  const records = getScreeningRecords();
  const referrals = getReferralRecords();
  const byRegion = countBy(records, 'region');
  const byCadre = countBy(records, 'cadre');
  const followUp = records.filter((record) => record.result === 'follow-up' || record.result === 'positive');

  const content = `
    <div class="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-4">
      <div class="admin-title">
        <h1>Laporan</h1>
        <p>Ringkasan prototype untuk monitoring program dan export lokal sederhana.</p>
      </div>
      <div class="d-flex flex-wrap gap-2">
        <button class="btn btn-primary" type="button" id="downloadReportCsv">
          <i class="bi bi-filetype-csv" aria-hidden="true"></i>
          Export CSV
        </button>
        <button class="btn btn-outline-primary" type="button" data-toast="Export PDF membutuhkan generator laporan pada tahap berikutnya.">
          <i class="bi bi-filetype-pdf" aria-hidden="true"></i>
          Export PDF
        </button>
      </div>
    </div>

    <section class="admin-card mb-4">
      <h2 class="section-title">Pembuat Laporan Prototype</h2>
      <div class="filter-grid filter-grid-4">
        <select class="form-select" aria-label="Periode laporan">
          <option>Juni 2026</option>
          <option>Mei 2026</option>
          <option>Triwulan 2 2026</option>
        </select>
        <select class="form-select" aria-label="Wilayah laporan">
          <option>Semua Wilayah</option>
          ${regions.map((region) => `<option>${region}</option>`).join('')}
        </select>
        <select class="form-select" aria-label="Kader laporan">
          <option>Semua Kader</option>
          ${cadres.map((cadre) => `<option>${cadre.name}</option>`).join('')}
        </select>
        <button class="btn btn-outline-primary" type="button" data-toast="Filter laporan belum mengubah data karena masih prototype statis.">
          Terapkan Filter
        </button>
      </div>
    </section>

    <section class="stat-grid stat-grid-4 mb-4">
      <div class="stat-card"><span>Total Skrining</span><strong>${records.length}</strong></div>
      <div class="stat-card"><span>Perlu Pemeriksaan</span><strong>${followUp.length}</strong></div>
      <div class="stat-card"><span>Total Rujukan</span><strong>${referrals.length}</strong></div>
      <div class="stat-card"><span>Kader Aktif</span><strong>${cadres.length}</strong></div>
    </section>

    <div class="row g-4 mb-4">
      <div class="col-lg-6">
        <section class="admin-card h-100">
          <h2 class="section-title">Distribusi Wilayah</h2>
          <div class="admin-bar-list">
            ${Object.entries(byRegion)
              .map(
                ([region, total]) => `
                  <div>
                    <div class="d-flex justify-content-between small fw-bold mb-1">
                      <span>${region}</span>
                      <span>${total}</span>
                    </div>
                    <div class="progress"><div class="progress-bar" style="width:${(total / records.length) * 100}%"></div></div>
                  </div>
                `,
              )
              .join('')}
          </div>
        </section>
      </div>
      <div class="col-lg-6">
        <section class="admin-card h-100">
          <h2 class="section-title">Aktivitas Kader</h2>
          <div class="admin-bar-list">
            ${Object.entries(byCadre)
              .map(
                ([cadre, total]) => `
                  <div>
                    <div class="d-flex justify-content-between small fw-bold mb-1">
                      <span>${cadre}</span>
                      <span>${total}</span>
                    </div>
                    <div class="progress"><div class="progress-bar bg-success" style="width:${(total / records.length) * 100}%"></div></div>
                  </div>
                `,
              )
              .join('')}
          </div>
        </section>
      </div>
    </div>

    <section class="admin-card">
      <h2 class="section-title">Narasi Ringkasan</h2>
      <p>
        Pada data prototype ini terdapat ${records.length} catatan skrining fiktif.
        Kategori yang memerlukan pemeriksaan lanjutan berjumlah ${followUp.length} catatan dan perlu
        dikonfirmasi oleh petugas kesehatan melalui alur rujukan yang sesuai.
      </p>
      <div class="admin-check-list">
        <div><i class="bi bi-check-circle-fill"></i><span>Angka bersumber dari data fiktif prototype.</span></div>
        <div><i class="bi bi-check-circle-fill"></i><span>Hasil skrining tidak digunakan sebagai diagnosis medis.</span></div>
        <div><i class="bi bi-check-circle-fill"></i><span>Laporan final perlu disetujui Puskesmas sebelum digunakan.</span></div>
      </div>
    </section>
  `;

  return {
    html: adminLayout(content, 'reports'),
    mount({ app, showToast }) {
      setupModalButtons(app);
      app.querySelector('#downloadReportCsv').addEventListener('click', () => {
        downloadSummaryCsv(records, referrals);
        showToast('CSV ringkasan laporan prototype dibuat.', 'success');
      });
      app.querySelectorAll('[data-toast]').forEach((button) => {
        button.addEventListener('click', () => showToast(button.dataset.toast, 'info'));
      });
    },
  };
}
