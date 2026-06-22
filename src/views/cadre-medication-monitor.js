import {
  getMedicationHistoryForUser,
  getMedicationOverview,
  isLateMedication,
  today,
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

function itemMatches(item, query, status) {
  const profile = item.profile;
  const text = `${profile.name || ''} ${profile.nik || ''} ${profile.address || ''} ${profile.region || ''}`.toLowerCase();
  const matchesQuery = text.includes(query.toLowerCase());
  const matchesStatus = status === 'all' || item.statusKey === status;
  return matchesQuery && matchesStatus;
}

function listMarkup(items) {
  if (!items.length) {
    return '<div class="empty-state">Tidak ada warga sesuai filter.</div>';
  }

  return items
    .map(
      (item) => `
        <article class="activity-item">
          <div class="d-flex align-items-center gap-2 min-w-0">
            <span class="initials">${escapeHtml((item.profile.name || 'WW').slice(0, 2).toUpperCase())}</span>
            <div class="min-w-0">
              <strong>${escapeHtml(item.profile.name || '-')}</strong>
              <div class="small muted">NIK ${escapeHtml(item.profile.nik || '-')}</div>
              <div class="small muted">${escapeHtml(item.profile.address || item.profile.region || '-')}</div>
              ${lateBadgeMarkup(item.medication)}
            </div>
          </div>
          <div class="text-end">
            ${medicationStatusBadge(item.statusKey)}
            <button class="btn btn-sm btn-outline-primary d-block mt-2 ms-auto" type="button" data-history="${escapeHtml(item.profile.id)}">
              Riwayat
            </button>
          </div>
        </article>
      `,
    )
    .join('');
}

function historyMarkup(userId) {
  const history = getMedicationHistoryForUser(userId);
  if (!history.length) return '<div class="empty-state">Belum ada riwayat minum obat.</div>';

  return history
    .map(
      (record) => `
        <div class="activity-item">
          <div>
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

export function cadreMedicationMonitorView() {
  const overview = getMedicationOverview(today());
  const counts = {
    sudah: overview.filter((item) => item.statusKey === 'sudah').length,
    belum: overview.filter((item) => item.statusKey === 'belum').length,
    belumUpdate: overview.filter((item) => item.statusKey === 'belum-update').length,
  };

  const content = `
    ${appHeader('Monitoring Minum Obat', 'Status warga hari ini', { back: '/kader' })}
    <div class="mobile-content">
      <section class="profile-stat-grid mb-3" aria-label="Ringkasan minum obat">
        <article class="profile-stat">
          <span>Sudah Minum Obat</span>
          <strong>${counts.sudah}</strong>
        </article>
        <article class="profile-stat">
          <span>Belum Minum Obat</span>
          <strong>${counts.belum}</strong>
        </article>
        <article class="profile-stat">
          <span>Belum Update</span>
          <strong>${counts.belumUpdate}</strong>
        </article>
        <article class="profile-stat">
          <span>Total Warga</span>
          <strong>${overview.length}</strong>
        </article>
      </section>

      <section class="soft-card mb-3">
        <label class="form-label" for="medicationSearch">Cari warga</label>
        <input class="form-control mb-3" id="medicationSearch" placeholder="Cari nama, NIK, atau alamat" />

        <label class="form-label" for="medicationFilter">Filter status</label>
        <select class="form-select" id="medicationFilter">
          <option value="all">Semua</option>
          <option value="sudah">Sudah Minum Obat</option>
          <option value="belum">Belum Minum Obat</option>
          <option value="belum-update">Belum Update</option>
        </select>
      </section>

      <section class="soft-card" id="medicationMonitorList">
        ${listMarkup(overview)}
      </section>
    </div>

    <div class="modal fade" id="medicationHistoryModal" tabindex="-1" aria-labelledby="medicationHistoryTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title fs-5" id="medicationHistoryTitle">Riwayat Minum Obat</h2>
            <button class="btn-close btn-close-white" type="button" data-bs-dismiss="modal" aria-label="Tutup"></button>
          </div>
          <div class="modal-body" id="medicationHistoryBody"></div>
        </div>
      </div>
    </div>
  `;

  return {
    html: mobileShell(content, 'obat'),
    mount({ app }) {
      const search = app.querySelector('#medicationSearch');
      const filter = app.querySelector('#medicationFilter');
      const list = app.querySelector('#medicationMonitorList');

      function bindHistory() {
        list.querySelectorAll('[data-history]').forEach((button) => {
          button.addEventListener('click', () => {
            const item = overview.find((entry) => entry.profile.id === button.dataset.history);
            if (!item) return;
            app.querySelector('#medicationHistoryTitle').textContent = `Riwayat ${item.profile.name || 'Warga'}`;
            app.querySelector('#medicationHistoryBody').innerHTML = historyMarkup(item.profile.id);
            window.bootstrap.Modal.getOrCreateInstance(app.querySelector('#medicationHistoryModal')).show();
          });
        });
      }

      function render() {
        const filtered = overview.filter((item) =>
          itemMatches(item, search.value.trim(), filter.value),
        );
        list.innerHTML = listMarkup(filtered);
        bindHistory();
      }

      search.addEventListener('input', render);
      filter.addEventListener('change', render);
      bindHistory();
    },
  };
}
