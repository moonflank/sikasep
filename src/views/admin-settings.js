import {
  physicalQuestions,
  symptomQuestions,
  treatmentCompletionQuestion,
  treatmentQuestions,
} from '../data/screening-rules.js';
import { setupModalButtons } from '../modules/screening.js';
import { adminLayout } from './admin-dashboard.js';

function ruleRows(questions, category) {
  return questions
    .map(
      (question) => `
        <tr>
          <td>${category}</td>
          <td>${question.factor}</td>
          <td>${question.childOnly ? 'Khusus anak' : 'Ya/Tidak'}</td>
        </tr>
      `,
    )
    .join('');
}

export function adminSettingsView() {
  const content = `
    <div class="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-4">
      <div class="admin-title">
        <h1>Pengaturan</h1>
        <p>Preferensi prototype, keamanan data, dan ringkasan aturan skrining.</p>
      </div>
      <button class="btn btn-primary" type="button" data-toast="Pengaturan tersimpan lokal sebagai simulasi prototype.">
        <i class="bi bi-save" aria-hidden="true"></i>
        Simpan Pengaturan
      </button>
    </div>

    <div class="row g-4 mb-4">
      <div class="col-xl-6">
        <section class="admin-card h-100">
          <h2 class="section-title">Akses dan Peran</h2>
          <div class="settings-list">
            <label>
              <span>
                <strong>Mode Admin</strong>
                <small>Dashboard monitoring Puskesmas.</small>
              </span>
              <input class="form-check-input" type="checkbox" checked disabled />
            </label>
            <label>
              <span>
                <strong>Mode Kader</strong>
                <small>Input skrining mobile-first.</small>
              </span>
              <input class="form-check-input" type="checkbox" checked disabled />
            </label>
            <label>
              <span>
                <strong>Mode Warga</strong>
                <small>Skrining mandiri, riwayat pribadi, dan minum obat.</small>
              </span>
              <input class="form-check-input" type="checkbox" checked disabled />
            </label>
            <label>
              <span>
                <strong>Persetujuan Warga Wajib</strong>
                <small>Tombol hasil aktif setelah persetujuan dicentang.</small>
              </span>
              <input class="form-check-input" type="checkbox" checked disabled />
            </label>
          </div>
        </section>
      </div>
      <div class="col-xl-6">
        <section class="admin-card h-100">
          <h2 class="section-title">Mode Offline</h2>
          <div class="settings-list">
            <label>
              <span>
                <strong>Simpan Draft Lokal</strong>
                <small>Data sementara tersimpan di perangkat.</small>
              </span>
              <input class="form-check-input" type="checkbox" checked disabled />
            </label>
            <label>
              <span>
                <strong>Sinkronisasi Server</strong>
                <small>Belum tersedia pada prototype.</small>
              </span>
              <input class="form-check-input" type="checkbox" disabled />
            </label>
            <label>
              <span>
                <strong>Enkripsi Server</strong>
                <small>Pengembangan tahap lanjutan.</small>
              </span>
              <input class="form-check-input" type="checkbox" disabled />
            </label>
          </div>
        </section>
      </div>
    </div>

    <section class="admin-card mb-4">
      <h2 class="section-title">Keamanan dan Etika Data</h2>
      <div class="admin-check-list">
        <div><i class="bi bi-shield-check"></i><span>Akses terbatas berdasarkan peran.</span></div>
        <div><i class="bi bi-shield-check"></i><span>Persetujuan warga sebelum pencatatan.</span></div>
        <div><i class="bi bi-shield-check"></i><span>Gunakan inisial pada tampilan daftar.</span></div>
        <div><i class="bi bi-shield-check"></i><span>Data prototype hanya tersimpan lokal.</span></div>
      </div>
    </section>

    <section class="table-card">
      <div class="p-3">
        <h2 class="section-title mb-1">Aturan Skrining Gejala TBC</h2>
        <p class="muted mb-0">Hasil otomatis mengikuti kategori Dewasa, Anak, dan ODHIV berdasarkan formulir skrining.</p>
      </div>
      <table class="table align-middle">
        <thead>
          <tr>
            <th>Kategori</th>
            <th>Faktor</th>
            <th>Format</th>
          </tr>
        </thead>
        <tbody>
          ${ruleRows(physicalQuestions, 'Kondisi Fisik')}
          ${ruleRows(symptomQuestions, 'Gejala Klinis')}
          ${ruleRows(treatmentQuestions, 'Riwayat Pengobatan')}
          <tr>
            <td>Riwayat Pengobatan</td>
            <td>${treatmentCompletionQuestion.label}</td>
            <td>Tuntas/Tidak tuntas</td>
          </tr>
        </tbody>
      </table>
    </section>
  `;

  return {
    html: adminLayout(content, 'settings'),
    mount({ app, showToast }) {
      setupModalButtons(app);
      app.querySelectorAll('[data-toast]').forEach((button) => {
        button.addEventListener('click', () => showToast(button.dataset.toast, 'success'));
      });
    },
  };
}
