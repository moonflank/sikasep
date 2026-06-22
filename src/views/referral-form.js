import { getLastResult, getReferralRecords, addReferralRecord, today } from '../modules/storage.js';
import {
  appHeader,
  escapeHtml,
  formatDate,
  mobileShell,
  safeDisclaimer,
} from '../modules/screening.js';

export function referralFormView() {
  const last = getLastResult();
  const latestReferral = getReferralRecords()[0] || {};
  const record = last?.record || {
    initials: latestReferral.initials || 'WW',
    date: latestReferral.date || today(),
    cadre: latestReferral.cadre || 'Kader Asep',
    factors: last?.risk?.factors || [],
  };
  const factors = last?.risk?.factors?.length ? last.risk.factors : record.factors || [];

  const content = `
    ${appHeader('Rujukan Pemeriksaan Lanjutan', 'Koordinasi Puskesmas Cisimeut', { back: '/skrining/hasil' })}
    <div class="mobile-content">
      <form id="referralForm">
        <section class="soft-card mb-3">
          <h2 class="section-title">Ringkasan Rujukan</h2>
          <ul class="summary-list">
            <li><span>Inisial</span><strong>${escapeHtml(record.initials || 'WW')}</strong></li>
            <li><span>Tanggal</span><strong>${formatDate(record.date || today())}</strong></li>
            <li><span>Kader</span><strong>${escapeHtml(record.cadre || 'Kader Asep')}</strong></li>
            <li><span>Tujuan</span><strong>Puskesmas Cisimeut</strong></li>
          </ul>
        </section>

        <section class="soft-card mb-3">
          <h2 class="section-title">Faktor Utama</h2>
          ${
            factors.length
              ? `<ul class="mb-0">${factors.map((factor) => `<li>${escapeHtml(factor)}</li>`).join('')}</ul>`
              : '<p class="muted mb-0">Belum ada faktor dari hasil terakhir.</p>'
          }
        </section>

        <section class="soft-card mb-3">
          <label class="form-label" for="followUpStatus">Status tindak lanjut</label>
          <select class="form-select mb-3" id="followUpStatus" name="status">
            <option>Belum Dihubungi</option>
            <option>Sudah Dihubungi</option>
            <option>Dijadwalkan</option>
            <option>Sudah Datang</option>
          </select>

          <label class="form-label" for="notes">Catatan</label>
          <textarea class="form-control" id="notes" name="notes" rows="4" placeholder="Tambahkan catatan koordinasi bila diperlukan"></textarea>
        </section>

        ${safeDisclaimer()}

        <div class="d-grid gap-2 mt-3">
          <button class="btn btn-outline-primary" type="button" data-toast="Ringkasan cetak masih berupa placeholder prototype.">
            <i class="bi bi-printer" aria-hidden="true"></i>
            Print Summary
          </button>
          <button class="btn btn-outline-primary" type="button" data-toast="Fitur bagikan ringkasan belum mengirim data nyata.">
            <i class="bi bi-share" aria-hidden="true"></i>
            Share Summary
          </button>
          <button class="btn btn-primary" type="submit">Simpan Rujukan</button>
          <button class="btn btn-outline-secondary" type="button" data-nav="/kader">Kembali ke Beranda</button>
        </div>
      </form>
    </div>
  `;

  return {
    html: mobileShell(content, 'skrining'),
    mount({ app, navigate, showToast }) {
      app.querySelectorAll('[data-toast]').forEach((button) => {
        button.addEventListener('click', () => showToast(button.dataset.toast, 'info'));
      });

      app.querySelector('#referralForm').addEventListener('submit', (event) => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(event.currentTarget).entries());
        addReferralRecord({
          id: `RJ-${Date.now().toString().slice(-5)}`,
          initials: record.initials || 'WW',
          date: today(),
          cadre: record.cadre || 'Kader Asep',
          destination: 'Puskesmas Cisimeut',
          status: data.status,
          notes: data.notes,
        });
        showToast('Rujukan prototype tersimpan lokal.', 'success');
        navigate('/kader');
      });
    },
  };
}
