import { connectionModeText } from '../modules/offline.js';
import { getScreeningRecords, markAllRecordsSynced } from '../modules/storage.js';
import {
  appHeader,
  escapeHtml,
  formatDate,
  mobileShell,
  resultBadge,
  resultLabel,
  syncBadge,
} from '../modules/screening.js';

function recordMatches(record, query, filter) {
  const text = `${record.initials} ${record.patientName || ''} ${record.nik || ''} ${record.region} ${record.address || ''} ${record.cadre} ${record.date}`.toLowerCase();
  const normalizedResult = record.result === 'followUp' ? 'follow-up' : record.result;
  return text.includes(query.toLowerCase()) && (filter === 'all' || normalizedResult === filter);
}

function yesNoLabel(value) {
  if (value === 'yes') return 'Ya';
  if (value === 'no') return 'Tidak';
  return '-';
}

function recordsMarkup(records) {
  if (!records.length) {
    return '<div class="empty-state">Tidak ada data sesuai filter.</div>';
  }

  return records
    .map(
      (record) => `
        <article class="activity-item">
          <div class="d-flex align-items-center gap-2 min-w-0">
            <span class="initials">${record.initials}</span>
            <div class="min-w-0">
              <strong>${escapeHtml(record.patientName || record.region)}</strong>
              <div class="small muted">${formatDate(record.date)} - ${escapeHtml(record.cadre)}</div>
              <div class="small muted">${escapeHtml(record.address || record.region || '-')}</div>
              <div class="mt-1">${syncBadge(record.syncStatus)}</div>
            </div>
          </div>
          <div class="text-end">
            ${resultBadge(record.result)}
            <button class="btn btn-sm btn-outline-primary d-block mt-2 ms-auto" type="button" data-detail="${record.id}">
              Detail
            </button>
          </div>
        </article>
      `,
    )
    .join('');
}

export function screeningHistoryView() {
  const records = getScreeningRecords();
  const content = `
    ${appHeader('Riwayat Skrining', 'Data tersimpan di perangkat', { back: '/kader' })}
    <div class="mobile-content">
      <div class="alert alert-light border" data-connection-message>${connectionModeText()}</div>

      <section class="soft-card mb-3">
        <label class="form-label" for="historySearch">Cari data</label>
        <input class="form-control mb-3" id="historySearch" placeholder="Cari nama, NIK, alamat, atau petugas" />
        <label class="form-label" for="historyFilter">Filter hasil</label>
        <select class="form-select" id="historyFilter">
          <option value="all">Semua</option>
          <option value="positive">Positif</option>
          <option value="negative">Negatif</option>
        </select>
      </section>

      <div class="d-grid mb-3">
        <button class="btn btn-primary" type="button" id="syncRecords">
          <i class="bi bi-arrow-repeat" aria-hidden="true"></i>
          Sinkronkan Data
        </button>
      </div>

      <section class="soft-card" id="historyList">
        ${recordsMarkup(records)}
      </section>
    </div>

    <div class="modal fade" id="historyDetailModal" tabindex="-1" aria-labelledby="historyDetailTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title fs-5" id="historyDetailTitle">Detail Skrining</h2>
            <button class="btn-close btn-close-white" type="button" data-bs-dismiss="modal" aria-label="Tutup"></button>
          </div>
          <div class="modal-body" id="historyDetailBody"></div>
        </div>
      </div>
    </div>
  `;

  return {
    html: mobileShell(content, 'riwayat'),
    mount({ app, showToast }) {
      let currentRecords = records;
      const list = app.querySelector('#historyList');
      const search = app.querySelector('#historySearch');
      const filter = app.querySelector('#historyFilter');

      function render() {
        const filtered = currentRecords.filter((record) =>
          recordMatches(record, search.value.trim(), filter.value),
        );
        list.innerHTML = recordsMarkup(filtered);
        bindDetails();
      }

      function bindDetails() {
        list.querySelectorAll('[data-detail]').forEach((button) => {
          button.addEventListener('click', () => {
            const record = currentRecords.find((item) => item.id === button.dataset.detail);
            const body = app.querySelector('#historyDetailBody');
            body.innerHTML = `
              <ul class="summary-list">
                <li><span>Nama</span><strong>${escapeHtml(record.patientName || record.initials)}</strong></li>
                <li><span>NIK</span><strong>${escapeHtml(record.nik || '-')}</strong></li>
                <li><span>Umur</span><strong>${escapeHtml(record.age || '-')} tahun</strong></li>
                <li><span>Jenis kelamin</span><strong>${escapeHtml(record.gender || '-')}</strong></li>
                <li><span>Tanggal</span><strong>${formatDate(record.date)}</strong></li>
                <li><span>Alamat</span><strong>${escapeHtml(record.address || record.region || '-')}</strong></li>
                <li><span>Petugas</span><strong>${escapeHtml(record.cadre)}</strong></li>
                <li><span>Kategori responden</span><strong>${escapeHtml(record.respondentCategory || '-')}</strong></li>
                <li><span>Hasil</span><strong>${resultLabel(record.result)}</strong></li>
                <li><span>Alasan</span><strong>${escapeHtml(record.reasonSummary || '-')}</strong></li>
                <li><span>Tindak lanjut</span><strong>${escapeHtml(record.recommendation || '-')}</strong></li>
                <li><span>Riwayat pengobatan TBC</span><strong>${yesNoLabel(record.previousTbTreatment)}</strong></li>
                <li><span>Status pengobatan</span><strong>${escapeHtml(record.treatmentStatusLabel || '-')}</strong></li>
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
              <h3 class="section-title mt-3">Faktor</h3>
              <ul>${(record.factors || []).map((factor) => `<li>${escapeHtml(factor)}</li>`).join('')}</ul>
            `;
            window.bootstrap.Modal.getOrCreateInstance(app.querySelector('#historyDetailModal')).show();
          });
        });
      }

      search.addEventListener('input', render);
      filter.addEventListener('change', render);
      app.querySelector('#syncRecords').addEventListener('click', () => {
        currentRecords = markAllRecordsSynced();
        render();
        showToast('Data prototipe berhasil ditandai sebagai tersinkron.', 'success');
      });
      bindDetails();
    },
  };
}
