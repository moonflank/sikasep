import { educationCards } from '../data/mock-data.js';
import { getCurrentUser } from '../modules/storage.js';
import { appHeader, escapeHtml, mobileShell } from '../modules/screening.js';

export function educationView() {
  const role = getCurrentUser()?.role === 'warga' ? 'warga' : 'kader';
  const backRoute = role === 'warga' ? '/warga' : '/kader';
  const content = `
    ${appHeader('Edukasi TBC', 'Materi singkat untuk warga', { back: backRoute })}
    <div class="mobile-content">
      <div class="alert alert-light border">
        Materi edukasi perlu diperiksa dan disetujui oleh tim kesehatan sebelum dipublikasikan.
      </div>

      <div class="d-grid gap-3">
        ${educationCards
          .map(
            (card) => `
              <article class="soft-card education-card">
                <img src="/images/education-placeholder.svg" alt="" aria-hidden="true" />
                <div class="pt-3">
                  <span class="badge text-bg-warning mb-2">${escapeHtml(card.category)}</span>
                  <h2 class="section-title">${escapeHtml(card.title)}</h2>
                  <p class="muted">${escapeHtml(card.summary)}</p>
                  <div class="d-grid gap-2">
                    <button class="btn btn-primary" type="button" data-toast="Video edukasi masih berupa placeholder prototype.">
                      <i class="bi bi-play-circle" aria-hidden="true"></i>
                      Tonton Video
                    </button>
                    <button class="btn btn-outline-primary" type="button" data-toast="Audio materi belum tersedia pada prototype.">
                      <i class="bi bi-volume-up" aria-hidden="true"></i>
                      Dengarkan Materi
                    </button>
                    <button class="btn btn-outline-secondary" type="button" data-toast="Fitur bagikan belum mengirim data nyata.">
                      <i class="bi bi-share" aria-hidden="true"></i>
                      Bagikan
                    </button>
                  </div>
                </div>
              </article>
            `,
          )
          .join('')}
      </div>
    </div>
  `;

  return {
    html: mobileShell(content, 'edukasi', '', role),
    mount({ app, showToast }) {
      app.querySelectorAll('[data-toast]').forEach((button) => {
        button.addEventListener('click', () => showToast(button.dataset.toast, 'info'));
      });
    },
  };
}
