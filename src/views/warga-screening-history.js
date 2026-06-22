import { getAccessibleScreeningRecords, getCurrentUser } from '../modules/storage.js';
import {
  appHeader,
  escapeHtml,
  formatDate,
  mobileShell,
  resultBadge,
  resultLabel,
  syncBadge,
} from '../modules/screening.js';

function yesNoLabel(value) {
  if (value === 'yes') return 'Ya';
  if (value === 'no') return 'Tidak';
  return '-';
}

function recordsMarkup(records) {
  if (!records.length) {
    return '<div class="empty-state">Belum ada riwayat skrining untuk akun ini.</div>';
  }

  return records
    .map(
      (record) => `
        <article class="activity-item">
          <div class="d-flex align-items-center gap-2 min-w-0">
            <span class="initials">${record.initials}</span>
            <div class="min-w-0">
              <strong>${formatDate(record.date)}</strong>
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

export function wargaScreeningHistoryView() {
  const user = getCurrentUser() || { id: 'warga01', role: 'warga' };
  const records = getAccessibleScreeningRecords(user);

  const content = `
    ${appHeader('Riwayat Skrining', 'Data milik akun warga', { back: '/warga' })}
    <div class="mobile-content">
      <section class="soft-card" id="wargaHistoryList">
        ${recordsMarkup(records)}
      </section>
    </div>

    <div class="modal fade" id="wargaHistoryDetailModal" tabindex="-1" aria-labelledby="wargaHistoryDetailTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title fs-5" id="wargaHistoryDetailTitle">Detail Skrining</h2>
            <button class="btn-close btn-close-white" type="button" data-bs-dismiss="modal" aria-label="Tutup"></button>
          </div>
          <div class="modal-body" id="wargaHistoryDetailBody"></div>
        </div>
      </div>
    </div>
  `;

  return {
    html: mobileShell(content, 'riwayat', '', 'warga'),
    mount({ app }) {
      const list = app.querySelector('#wargaHistoryList');
      list.querySelectorAll('[data-detail]').forEach((button) => {
        button.addEventListener('click', () => {
          const record = records.find((item) => item.id === button.dataset.detail);
          if (!record) return;

          app.querySelector('#wargaHistoryDetailBody').innerHTML = `
            <ul class="summary-list">
              <li><span>Nama</span><strong>${escapeHtml(record.patientName || record.initials)}</strong></li>
              <li><span>NIK</span><strong>${escapeHtml(record.nik || '-')}</strong></li>
              <li><span>Tanggal</span><strong>${formatDate(record.date)}</strong></li>
              <li><span>Alamat</span><strong>${escapeHtml(record.address || record.region || '-')}</strong></li>
              <li><span>Kategori responden</span><strong>${escapeHtml(record.respondentCategory || '-')}</strong></li>
              <li><span>Hasil</span><strong>${resultLabel(record.result)}</strong></li>
              <li><span>Alasan</span><strong>${escapeHtml(record.reasonSummary || '-')}</strong></li>
              <li><span>Tindak lanjut</span><strong>${escapeHtml(record.recommendation || '-')}</strong></li>
              <li><span>Riwayat pengobatan TBC</span><strong>${yesNoLabel(record.previousTbTreatment)}</strong></li>
              <li><span>Status pengobatan</span><strong>${escapeHtml(record.treatmentStatusLabel || '-')}</strong></li>
            </ul>
            <h3 class="section-title mt-3">Faktor</h3>
            <ul>${(record.factors || []).map((factor) => `<li>${escapeHtml(factor)}</li>`).join('')}</ul>
          `;
          window.bootstrap.Modal.getOrCreateInstance(app.querySelector('#wargaHistoryDetailModal')).show();
        });
      });
    },
  };
}
