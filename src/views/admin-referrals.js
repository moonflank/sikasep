import { cadres } from '../data/mock-data.js';
import { getReferralRecords } from '../modules/storage.js';
import { escapeHtml, formatDate, setupModalButtons } from '../modules/screening.js';
import { adminLayout } from './admin-dashboard.js';

const statusClasses = {
  'Belum Dihubungi': 'text-bg-secondary',
  'Sudah Dihubungi': 'text-bg-primary',
  Dijadwalkan: 'text-bg-warning',
  'Sudah Datang': 'text-bg-success',
};

function statusBadge(status) {
  return `<span class="badge ${statusClasses[status] || 'text-bg-secondary'}">${escapeHtml(status)}</span>`;
}

function referralRows(records) {
  if (!records.length) {
    return `
      <tr>
        <td colspan="7"><div class="empty-state">Tidak ada rujukan sesuai filter.</div></td>
      </tr>
    `;
  }

  return records
    .map(
      (record) => `
        <tr>
          <td>${formatDate(record.date)}</td>
          <td><strong>${record.initials}</strong></td>
          <td>${escapeHtml(record.cadre)}</td>
          <td>${escapeHtml(record.destination || 'Puskesmas Cisimeut')}</td>
          <td>${statusBadge(record.status)}</td>
          <td class="text-nowrap">${record.notes ? escapeHtml(record.notes) : '<span class="muted">Belum ada</span>'}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary" type="button" data-referral="${record.id}">
              Detail
            </button>
          </td>
        </tr>
      `,
    )
    .join('');
}

function filterReferrals(records, filters) {
  return records.filter((record) => {
    const text = `${record.initials} ${record.cadre} ${record.status} ${record.destination}`.toLowerCase();
    const matchesQuery = text.includes(filters.query.toLowerCase());
    const matchesStatus = filters.status === 'all' || record.status === filters.status;
    const matchesCadre = filters.cadre === 'all' || record.cadre === filters.cadre;
    return matchesQuery && matchesStatus && matchesCadre;
  });
}

export function adminReferralsView() {
  const records = getReferralRecords();
  const waiting = records.filter((record) => record.status === 'Belum Dihubungi').length;
  const scheduled = records.filter((record) => record.status === 'Dijadwalkan').length;
  const arrived = records.filter((record) => record.status === 'Sudah Datang').length;

  const content = `
    <div class="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-4">
      <div class="admin-title">
        <h1>Monitoring Rujukan</h1>
        <p>Kelola tindak lanjut pemeriksaan lanjutan ke Puskesmas Cisimeut.</p>
      </div>
      <button class="btn btn-primary" type="button" data-toast="Pembuatan rujukan baru dilakukan dari alur skrining kader pada prototype.">
        <i class="bi bi-plus-circle" aria-hidden="true"></i>
        Rujukan Baru
      </button>
    </div>

    <section class="stat-grid stat-grid-4 mb-4">
      <div class="stat-card"><span>Total Rujukan</span><strong>${records.length}</strong></div>
      <div class="stat-card"><span>Belum Dihubungi</span><strong>${waiting}</strong></div>
      <div class="stat-card"><span>Dijadwalkan</span><strong>${scheduled}</strong></div>
      <div class="stat-card"><span>Sudah Datang</span><strong>${arrived}</strong></div>
    </section>

    <div class="row g-4 mb-4">
      <div class="col-xl-8">
        <section class="admin-card">
          <h2 class="section-title">Antrian Tindak Lanjut</h2>
          <div class="referral-board">
            ${['Belum Dihubungi', 'Sudah Dihubungi', 'Dijadwalkan', 'Sudah Datang']
              .map(
                (status) => `
                  <article class="referral-column">
                    <div class="d-flex justify-content-between align-items-center gap-2 mb-2">
                      <strong>${status}</strong>
                      ${statusBadge(status)}
                    </div>
                    ${records
                      .filter((record) => record.status === status)
                      .map(
                        (record) => `
                          <button class="referral-mini-card" type="button" data-referral="${record.id}">
                            <span>${record.initials}</span>
                            <small>${formatDate(record.date)} - ${escapeHtml(record.cadre)}</small>
                          </button>
                        `,
                      )
                      .join('') || '<p class="muted mb-0 small">Tidak ada data.</p>'}
                  </article>
                `,
              )
              .join('')}
          </div>
        </section>
      </div>
      <div class="col-xl-4">
        <section class="admin-card h-100">
          <h2 class="section-title">Catatan Operasional</h2>
          <div class="admin-check-list">
            <div><i class="bi bi-check-circle-fill"></i><span>Hubungi warga melalui kader pendamping.</span></div>
            <div><i class="bi bi-check-circle-fill"></i><span>Catat jadwal pemeriksaan tanpa membagikan data sensitif.</span></div>
            <div><i class="bi bi-check-circle-fill"></i><span>Konfirmasi tindak lanjut hanya dengan petugas berwenang.</span></div>
          </div>
        </section>
      </div>
    </div>

    <section class="admin-card mb-4">
      <div class="filter-grid filter-grid-3">
        <input class="form-control" id="referralSearch" placeholder="Cari inisial, kader, atau status" aria-label="Cari rujukan" />
        <select class="form-select" id="referralStatus" aria-label="Filter status rujukan">
          <option value="all">Semua Status</option>
          <option>Belum Dihubungi</option>
          <option>Sudah Dihubungi</option>
          <option>Dijadwalkan</option>
          <option>Sudah Datang</option>
        </select>
        <select class="form-select" id="referralCadre" aria-label="Filter kader">
          <option value="all">Semua Kader</option>
          ${cadres.map((cadre) => `<option>${cadre.name}</option>`).join('')}
        </select>
      </div>
    </section>

    <section class="table-card">
      <table class="table align-middle">
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Inisial</th>
            <th>Kader</th>
            <th>Tujuan</th>
            <th>Status</th>
            <th>Catatan</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody id="referralTableBody">
          ${referralRows(records)}
        </tbody>
      </table>
    </section>

    <div class="modal fade" id="referralDetailModal" tabindex="-1" aria-labelledby="referralDetailTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title fs-5" id="referralDetailTitle">Detail Rujukan</h2>
            <button class="btn-close btn-close-white" type="button" data-bs-dismiss="modal" aria-label="Tutup"></button>
          </div>
          <div class="modal-body" id="referralDetailBody"></div>
        </div>
      </div>
    </div>
  `;

  return {
    html: adminLayout(content, 'referrals'),
    mount({ app, showToast }) {
      setupModalButtons(app);
      let visible = records;
      const tableBody = app.querySelector('#referralTableBody');
      const search = app.querySelector('#referralSearch');
      const status = app.querySelector('#referralStatus');
      const cadre = app.querySelector('#referralCadre');

      function bindDetails() {
        app.querySelectorAll('[data-referral]').forEach((button) => {
          button.addEventListener('click', () => {
            const record = records.find((item) => item.id === button.dataset.referral);
            app.querySelector('#referralDetailBody').innerHTML = `
              <ul class="summary-list">
                <li><span>ID</span><strong>${escapeHtml(record.id)}</strong></li>
                <li><span>Inisial</span><strong>${escapeHtml(record.initials)}</strong></li>
                <li><span>Tanggal</span><strong>${formatDate(record.date)}</strong></li>
                <li><span>Kader</span><strong>${escapeHtml(record.cadre)}</strong></li>
                <li><span>Tujuan</span><strong>${escapeHtml(record.destination || 'Puskesmas Cisimeut')}</strong></li>
                <li><span>Status</span><strong>${escapeHtml(record.status)}</strong></li>
              </ul>
              <label class="form-label mt-3" for="detailReferralStatus">Ubah status prototype</label>
              <select class="form-select" id="detailReferralStatus">
                ${['Belum Dihubungi', 'Sudah Dihubungi', 'Dijadwalkan', 'Sudah Datang']
                  .map((item) => `<option ${item === record.status ? 'selected' : ''}>${item}</option>`)
                  .join('')}
              </select>
              <button class="btn btn-primary w-100 mt-3" type="button" data-toast="Perubahan status hanya simulasi tampilan prototype.">
                Simpan Status
              </button>
            `;
            app.querySelector('#referralDetailBody [data-toast]').addEventListener('click', () => {
              showToast('Perubahan status hanya simulasi tampilan prototype.', 'info');
            });
            window.bootstrap.Modal.getOrCreateInstance(app.querySelector('#referralDetailModal')).show();
          });
        });
      }

      function render() {
        visible = filterReferrals(records, {
          query: search.value.trim(),
          status: status.value,
          cadre: cadre.value,
        });
        tableBody.innerHTML = referralRows(visible);
        bindDetails();
      }

      [search, status, cadre].forEach((control) => control.addEventListener('input', render));
      app.querySelectorAll('[data-toast]').forEach((button) => {
        button.addEventListener('click', () => showToast(button.dataset.toast, 'info'));
      });
      bindDetails();
    },
  };
}
