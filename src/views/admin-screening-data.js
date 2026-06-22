import { cadres, regions } from '../data/mock-data.js';
import { getScreeningRecords } from '../modules/storage.js';
import {
  escapeHtml,
  formatDate,
  resultBadge,
  resultLabel,
  setupModalButtons,
  syncBadge,
} from '../modules/screening.js';
import { adminLayout } from './admin-dashboard.js';

function filterRecords(records, filters) {
  return records.filter((record) => {
    const queryText = `${record.initials} ${record.patientName || ''} ${record.nik || ''} ${record.region} ${record.address || ''} ${record.cadre} ${record.date}`.toLowerCase();
    const result = record.result === 'followUp' ? 'follow-up' : record.result;
    const matchesQuery = queryText.includes(filters.query.toLowerCase());
    const matchesDate = !filters.date || record.date === filters.date;
    const matchesRegion = filters.region === 'all' || record.region === filters.region;
    const matchesCadre = filters.cadre === 'all' || record.cadre === filters.cadre;
    const matchesResult = filters.result === 'all' || result === filters.result;
    return matchesQuery && matchesDate && matchesRegion && matchesCadre && matchesResult;
  });
}

function tableMarkup(records) {
  if (!records.length) {
    return `
      <tr>
        <td colspan="7">
          <div class="empty-state">Tidak ada data sesuai filter.</div>
        </td>
      </tr>
    `;
  }

  return records
    .map(
      (record) => `
        <tr>
          <td>${formatDate(record.date)}</td>
          <td><strong>${escapeHtml(record.patientName || record.initials)}</strong></td>
          <td>${escapeHtml(record.address || record.region)}</td>
          <td>${escapeHtml(record.cadre)}</td>
          <td>${resultBadge(record.result)}</td>
          <td>${syncBadge(record.syncStatus)}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary" type="button" data-detail="${record.id}">
              Detail
            </button>
          </td>
        </tr>
      `,
    )
    .join('');
}

function yesNoLabel(value) {
  if (value === 'yes') return 'Ya';
  if (value === 'no') return 'Tidak';
  return '-';
}

function csvEscape(value = '') {
  const text = String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function exportCsv(records) {
  const headers = [
    'Tanggal Pemeriksaan',
    'Nama',
    'NIK',
    'Umur',
    'Jenis Kelamin',
    'Alamat',
    'Petugas',
    'Kategori Responden',
    'Hasil Skrining',
    'Alasan',
    'Tindak Lanjut',
    'Riwayat Pengobatan TBC',
    'Status Pengobatan',
    'Status Sinkronisasi',
  ];
  const rows = records.map((record) => [
    record.date,
    record.patientName || record.initials,
    record.nik || '-',
    record.age || '-',
    record.gender || '-',
    record.address || record.region,
    record.cadre,
    record.respondentCategory || '-',
    resultLabel(record.result),
    record.reasonSummary || '-',
    record.recommendation || '-',
    yesNoLabel(record.previousTbTreatment),
    record.treatmentStatusLabel || '-',
    record.syncStatus === 'synced' ? 'Tersinkron' : 'Tersimpan lokal',
  ]);
  const csv = [headers, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'sobat-baduy-data-skrining.csv';
  link.click();
  URL.revokeObjectURL(url);
}

export function adminScreeningDataView() {
  const records = getScreeningRecords();
  const content = `
    <div class="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-4">
      <div class="admin-title">
        <h1>Data Skrining</h1>
        <p>Pencarian, filter, detail, dan export prototype lokal.</p>
      </div>
      <button class="btn btn-outline-primary" type="button" data-nav="/admin">
        <i class="bi bi-arrow-left" aria-hidden="true"></i>
        Ringkasan
      </button>
    </div>

    <section class="admin-card mb-4">
      <div class="filter-grid">
        <input class="form-control" id="adminSearch" placeholder="Cari nama, NIK, alamat, petugas" aria-label="Cari data skrining" />
        <input class="form-control" id="adminDate" type="date" aria-label="Filter tanggal" />
        <select class="form-select" id="adminRegion" aria-label="Filter kampung">
          <option value="all">Semua Kampung</option>
          ${regions.map((region) => `<option>${region}</option>`).join('')}
        </select>
        <select class="form-select" id="adminCadre" aria-label="Filter kader">
          <option value="all">Semua Kader</option>
          ${cadres.map((cadre) => `<option>${cadre.name}</option>`).join('')}
        </select>
        <select class="form-select" id="adminResult" aria-label="Filter hasil skrining">
          <option value="all">Semua Hasil</option>
          <option value="positive">Positif</option>
          <option value="negative">Negatif</option>
          <option value="low">Risiko Rendah</option>
          <option value="monitor">Perlu Pemantauan</option>
          <option value="follow-up">Perlu Pemeriksaan</option>
        </select>
      </div>
      <div class="d-flex flex-wrap gap-2 mt-3">
        <button class="btn btn-primary" type="button" id="exportCsv">
          <i class="bi bi-filetype-csv" aria-hidden="true"></i>
          Export CSV
        </button>
        <button class="btn btn-outline-primary" type="button" data-toast="Export PDF masih placeholder pada prototype.">
          <i class="bi bi-filetype-pdf" aria-hidden="true"></i>
          Export PDF
        </button>
      </div>
    </section>

    <section class="table-card">
      <table class="table align-middle">
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Nama</th>
            <th>Alamat</th>
            <th>Petugas</th>
            <th>Hasil Skrining</th>
            <th>Status Sinkronisasi</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody id="adminTableBody">
          ${tableMarkup(records)}
        </tbody>
      </table>
    </section>

    <div class="modal fade" id="adminRecordModal" tabindex="-1" aria-labelledby="adminRecordTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title fs-5" id="adminRecordTitle">Detail Data Skrining</h2>
            <button class="btn-close btn-close-white" type="button" data-bs-dismiss="modal" aria-label="Tutup"></button>
          </div>
          <div class="modal-body" id="adminRecordBody"></div>
        </div>
      </div>
    </div>
  `;

  return {
    html: adminLayout(content, 'data'),
    mount({ app, showToast }) {
      setupModalButtons(app);
      let visibleRecords = records;
      const body = app.querySelector('#adminTableBody');
      const controls = {
        query: app.querySelector('#adminSearch'),
        date: app.querySelector('#adminDate'),
        region: app.querySelector('#adminRegion'),
        cadre: app.querySelector('#adminCadre'),
        result: app.querySelector('#adminResult'),
      };

      function currentFilters() {
        return {
          query: controls.query.value.trim(),
          date: controls.date.value,
          region: controls.region.value,
          cadre: controls.cadre.value,
          result: controls.result.value,
        };
      }

      function bindDetails() {
        body.querySelectorAll('[data-detail]').forEach((button) => {
          button.addEventListener('click', () => {
            const record = records.find((item) => item.id === button.dataset.detail);
            app.querySelector('#adminRecordBody').innerHTML = `
              <ul class="summary-list">
                <li><span>Tanggal</span><strong>${formatDate(record.date)}</strong></li>
                <li><span>Nama</span><strong>${escapeHtml(record.patientName || record.initials)}</strong></li>
                <li><span>NIK</span><strong>${escapeHtml(record.nik || '-')}</strong></li>
                <li><span>Umur</span><strong>${escapeHtml(record.age || '-')} tahun</strong></li>
                <li><span>Jenis kelamin</span><strong>${escapeHtml(record.gender || '-')}</strong></li>
                <li><span>Alamat</span><strong>${escapeHtml(record.address || record.region || '-')}</strong></li>
                <li><span>Petugas</span><strong>${escapeHtml(record.cadre)}</strong></li>
                <li><span>Kategori responden</span><strong>${escapeHtml(record.respondentCategory || '-')}</strong></li>
                <li><span>Hasil</span><strong>${resultLabel(record.result)}</strong></li>
                <li><span>Alasan</span><strong>${escapeHtml(record.reasonSummary || '-')}</strong></li>
                <li><span>Tindak lanjut</span><strong>${escapeHtml(record.recommendation || '-')}</strong></li>
                <li><span>Riwayat pengobatan TBC</span><strong>${yesNoLabel(record.previousTbTreatment)}</strong></li>
                <li><span>Status pengobatan</span><strong>${escapeHtml(record.treatmentStatusLabel || '-')}</strong></li>
                <li><span>Status</span><strong>${record.syncStatus === 'synced' ? 'Tersinkron' : 'Tersimpan lokal'}</strong></li>
              </ul>
              ${
                record.bmi || record.nutritionStatus
                  ? `
                    <h3 class="section-title mt-3">Status Gizi</h3>
                    <ul class="summary-list">
                      <li><span>Berat badan</span><strong>${escapeHtml(record.weight || '-')} kg</strong></li>
                      <li><span>Tinggi badan</span><strong>${escapeHtml(record.height || '-')} cm</strong></li>
                      <li><span>IMT</span><strong>${escapeHtml(record.bmi || '-')}</strong></li>
                      <li><span>Status gizi</span><strong>${escapeHtml(record.nutritionStatus || '-')}</strong></li>
                    </ul>
                  `
                  : ''
              }
              <h3 class="section-title mt-3">Faktor yang Dicatat</h3>
              <ul>${(record.factors || []).map((factor) => `<li>${escapeHtml(factor)}</li>`).join('')}</ul>
            `;
            window.bootstrap.Modal.getOrCreateInstance(app.querySelector('#adminRecordModal')).show();
          });
        });
      }

      function render() {
        visibleRecords = filterRecords(records, currentFilters());
        body.innerHTML = tableMarkup(visibleRecords);
        bindDetails();
      }

      Object.values(controls).forEach((control) => control.addEventListener('input', render));
      app.querySelector('#exportCsv').addEventListener('click', () => {
        exportCsv(visibleRecords);
        showToast('CSV prototype berhasil dibuat dari data fiktif lokal.', 'success');
      });
      app.querySelectorAll('[data-toast]').forEach((button) => {
        button.addEventListener('click', () => showToast(button.dataset.toast, 'info'));
      });

      bindDetails();
    },
  };
}
