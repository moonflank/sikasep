import { educationCards } from '../data/mock-data.js';
import { escapeHtml, setupModalButtons } from '../modules/screening.js';
import { adminLayout } from './admin-dashboard.js';

const reviewStates = ['Perlu Review', 'Draft', 'Siap Publikasi', 'Perlu Revisi'];

function educationStatus(index) {
  return reviewStates[index % reviewStates.length];
}

function statusClass(status) {
  return {
    'Perlu Review': 'text-bg-warning',
    Draft: 'text-bg-secondary',
    'Siap Publikasi': 'text-bg-success',
    'Perlu Revisi': 'text-bg-danger',
  }[status];
}

export function adminEducationView() {
  const ready = educationCards.filter((_, index) => educationStatus(index) === 'Siap Publikasi').length;
  const review = educationCards.filter((_, index) => educationStatus(index) === 'Perlu Review').length;

  const content = `
    <div class="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-4">
      <div class="admin-title">
        <h1>Kelola Edukasi</h1>
        <p>Inventaris materi TBC, status review, dan placeholder publikasi materi warga.</p>
      </div>
      <button class="btn btn-primary" type="button" data-toast="Upload materi membutuhkan penyimpanan server pada tahap berikutnya.">
        <i class="bi bi-cloud-arrow-up" aria-hidden="true"></i>
        Upload Materi
      </button>
    </div>

    <section class="stat-grid stat-grid-4 mb-4">
      <div class="stat-card"><span>Total Materi</span><strong>${educationCards.length}</strong></div>
      <div class="stat-card"><span>Siap Publikasi</span><strong>${ready}</strong></div>
      <div class="stat-card"><span>Perlu Review</span><strong>${review}</strong></div>
      <div class="stat-card"><span>Video Placeholder</span><strong>6</strong></div>
    </section>

    <div class="row g-4 mb-4">
      <div class="col-lg-8">
        <section class="admin-card">
          <h2 class="section-title">Alur Review Materi</h2>
          <div class="review-flow">
            <div><i class="bi bi-pencil-square"></i><strong>Draft</strong><span>Materi disiapkan admin.</span></div>
            <div><i class="bi bi-clipboard-check"></i><strong>Review</strong><span>Diperiksa tim kesehatan.</span></div>
            <div><i class="bi bi-check-circle"></i><strong>Publikasi</strong><span>Tersedia di halaman edukasi warga.</span></div>
          </div>
        </section>
      </div>
      <div class="col-lg-4">
        <section class="admin-card h-100">
          <h2 class="section-title">Catatan Validasi</h2>
          <p class="muted mb-0">
            Materi edukasi perlu disetujui tim kesehatan sebelum digunakan dalam layanan masyarakat.
          </p>
        </section>
      </div>
    </div>

    <section class="education-admin-grid">
      ${educationCards
        .map((card, index) => {
          const status = educationStatus(index);
          return `
            <article class="admin-card education-admin-card">
              <img src="/images/education-placeholder.svg" alt="" aria-hidden="true" />
              <div class="pt-3">
                <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                  <span class="badge text-bg-primary">${escapeHtml(card.category)}</span>
                  <span class="badge ${statusClass(status)}">${status}</span>
                </div>
                <h2>${escapeHtml(card.title)}</h2>
                <p>${escapeHtml(card.summary)}</p>
                <div class="d-flex flex-wrap gap-2">
                  <button class="btn btn-sm btn-outline-primary" type="button" data-education="${card.id}">
                    Pratinjau
                  </button>
                  <button class="btn btn-sm btn-outline-secondary" type="button" data-toast="Perubahan status materi hanya simulasi prototype.">
                    Ubah Status
                  </button>
                </div>
              </div>
            </article>
          `;
        })
        .join('')}
    </section>

    <div class="modal fade" id="educationPreviewModal" tabindex="-1" aria-labelledby="educationPreviewTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title fs-5" id="educationPreviewTitle">Pratinjau Materi</h2>
            <button class="btn-close btn-close-white" type="button" data-bs-dismiss="modal" aria-label="Tutup"></button>
          </div>
          <div class="modal-body" id="educationPreviewBody"></div>
        </div>
      </div>
    </div>
  `;

  return {
    html: adminLayout(content, 'education'),
    mount({ app, showToast }) {
      setupModalButtons(app);
      app.querySelectorAll('[data-toast]').forEach((button) => {
        button.addEventListener('click', () => showToast(button.dataset.toast, 'info'));
      });
      app.querySelectorAll('[data-education]').forEach((button) => {
        button.addEventListener('click', () => {
          const card = educationCards.find((item) => item.id === button.dataset.education);
          app.querySelector('#educationPreviewBody').innerHTML = `
            <img class="w-100 rounded mb-3" src="/images/education-placeholder.svg" alt="" aria-hidden="true" />
            <span class="badge text-bg-primary mb-2">${escapeHtml(card.category)}</span>
            <h3 class="section-title">${escapeHtml(card.title)}</h3>
            <p>${escapeHtml(card.summary)}</p>
            <div class="alert alert-light border mb-0">
              Video, audio, dan konten final masih perlu validasi tim kesehatan.
            </div>
          `;
          window.bootstrap.Modal.getOrCreateInstance(app.querySelector('#educationPreviewModal')).show();
        });
      });
    },
  };
}
