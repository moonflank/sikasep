import {
  daysAgo,
  getCurrentUser,
  getMedicationForUserDate,
  getMedicationHistoryForUser,
  isLateMedication,
  today,
  upsertMedicationRecord,
} from '../modules/storage.js';
import {
  appHeader,
  escapeHtml,
  formatDate,
  medicationStatusBadge,
  mobileShell,
} from '../modules/screening.js';

function lateBadgeMarkup(record) {
  return isLateMedication(record) ? '<span class="badge text-bg-warning mt-1">Update Terlambat</span>' : '';
}

function historyMarkup(userId) {
  const history = getMedicationHistoryForUser(userId);

  if (!history.length) {
    return '<div class="empty-state">Belum ada riwayat minum obat.</div>';
  }

  return history
    .slice(0, 8)
    .map(
      (record) => `
        <div class="activity-item">
          <div class="min-w-0">
            <strong>${formatDate(record.tanggal)}</strong>
            <div class="small muted">${record.jam_minum_obat ? `Jam ${escapeHtml(record.jam_minum_obat)}` : 'Jam belum diisi'}</div>
            ${record.catatan ? `<div class="small muted">${escapeHtml(record.catatan)}</div>` : ''}
            ${lateBadgeMarkup(record)}
          </div>
          ${medicationStatusBadge(record.status_minum_obat)}
        </div>
      `,
    )
    .join('');
}

function statusSummaryMarkup(record, selectedDate = today()) {
  return `
    <div class="d-flex align-items-center justify-content-between gap-3">
      <div>
        <h2 class="section-title mb-1">${selectedDate === today() ? 'Status Hari Ini' : 'Laporan Tanggal Dipilih'}</h2>
        <div class="small muted">${formatDate(selectedDate)}</div>
        ${lateBadgeMarkup(record)}
      </div>
      ${medicationStatusBadge(record?.status_minum_obat || 'belum-update')}
    </div>
    ${
      record
        ? `<p class="muted mt-3 mb-0">${record.jam_minum_obat ? `Jam ${escapeHtml(record.jam_minum_obat)}. ` : ''}${escapeHtml(record.catatan || 'Data tanggal ini sudah tersimpan dan dapat diperbarui.')}</p>`
        : '<p class="muted mt-3 mb-0">Pilih status minum obat hari ini lalu simpan.</p>'
    }
  `;
}

export function wargaMedicationView() {
  const user = getCurrentUser() || { id: 'warga01', name: 'Warga Contoh AR', role: 'warga' };
  const currentDate = today();
  const minDate = daysAgo(7);
  const currentRecord = getMedicationForUserDate(user.id, currentDate);

  const content = `
    ${appHeader('Minum Obat', 'Update status harian', { back: '/warga' })}
    <div class="mobile-content">
      <section class="soft-card mb-3" id="medicationSummary">
        ${statusSummaryMarkup(currentRecord)}
      </section>

      <form id="medicationForm" class="soft-card needs-validation mb-3" novalidate>
        <div class="mb-3">
          <label class="form-label" for="tanggal">Tanggal <span class="required">*</span></label>
          <input class="form-control" id="tanggal" name="tanggal" type="date" value="${currentDate}" min="${minDate}" max="${currentDate}" required />
          <div class="form-text">Jika lupa update, pilih tanggal yang terlewat. Maksimal 7 hari ke belakang.</div>
          <div class="invalid-feedback">Tanggal wajib diisi.</div>
        </div>

        <div class="mb-3">
          <label class="form-label" for="status_minum_obat">Status <span class="required">*</span></label>
          <select class="form-select" id="status_minum_obat" name="status_minum_obat" required>
            <option value="">Pilih status</option>
            <option value="sudah" ${currentRecord?.status_minum_obat === 'sudah' ? 'selected' : ''}>Sudah Minum Obat</option>
            <option value="belum" ${currentRecord?.status_minum_obat === 'belum' ? 'selected' : ''}>Belum Minum Obat</option>
          </select>
          <div class="invalid-feedback">Status minum obat wajib dipilih.</div>
        </div>

        <div class="mb-3">
          <label class="form-label" for="jam_minum_obat">Jam minum obat</label>
          <input class="form-control" id="jam_minum_obat" name="jam_minum_obat" type="time" value="${escapeHtml(currentRecord?.jam_minum_obat || '')}" />
        </div>

        <div class="mb-3">
          <label class="form-label" for="catatan">Catatan singkat</label>
          <textarea class="form-control" id="catatan" name="catatan" rows="3" placeholder="Opsional">${escapeHtml(currentRecord?.catatan || '')}</textarea>
        </div>

        <button class="btn btn-primary w-100" type="submit">
          <i class="bi bi-save" aria-hidden="true"></i>
          Simpan / Update
        </button>
      </form>

      <section class="soft-card">
        <h2 class="section-title">Riwayat Minum Obat</h2>
        <div id="medicationHistory">${historyMarkup(user.id)}</div>
      </section>
    </div>
  `;

  return {
    html: mobileShell(content, 'obat', '', 'warga'),
    mount({ app, showToast }) {
      const form = app.querySelector('#medicationForm');
      const summary = app.querySelector('#medicationSummary');
      const history = app.querySelector('#medicationHistory');
      const dateInput = app.querySelector('#tanggal');
      const statusInput = app.querySelector('#status_minum_obat');
      const timeInput = app.querySelector('#jam_minum_obat');
      const noteInput = app.querySelector('#catatan');

      function loadSelectedDate() {
        const selectedDate = dateInput.value || currentDate;
        const selectedRecord = getMedicationForUserDate(user.id, selectedDate);
        statusInput.value = selectedRecord?.status_minum_obat || '';
        timeInput.value = selectedRecord?.jam_minum_obat || '';
        noteInput.value = selectedRecord?.catatan || '';
        summary.innerHTML = statusSummaryMarkup(selectedRecord, selectedDate);
      }

      dateInput.addEventListener('change', loadSelectedDate);

      form.addEventListener('submit', (event) => {
        event.preventDefault();
        form.classList.add('was-validated');
        if (!form.checkValidity()) return;

        const data = Object.fromEntries(new FormData(form).entries());
        try {
          const saved = upsertMedicationRecord({
            userId: user.id,
            tanggal: data.tanggal,
            status_minum_obat: data.status_minum_obat,
            jam_minum_obat: data.jam_minum_obat,
            catatan: data.catatan,
            inputBy: user.id,
          });
          summary.innerHTML = statusSummaryMarkup(saved, data.tanggal);
          history.innerHTML = historyMarkup(user.id);
          showToast(saved.reported_late ? 'Laporan terlambat tersimpan.' : 'Status minum obat tersimpan.', 'success');
        } catch (error) {
          showToast(error.message || 'Status minum obat belum dapat disimpan.', 'danger');
        }
      });
    },
  };
}
