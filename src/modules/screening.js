import { APP_TITLE } from './branding.js';
import { medicalDisclaimer } from '../data/screening-rules.js';
import { getCurrentUser } from './storage.js';

export function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function formatDate(dateString) {
  if (!dateString) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${dateString}T00:00:00`));
}

export function routeTitle(path) {
  const titles = {
    '/kader': 'Beranda',
    '/kader/minum-obat': 'Monitoring Obat',
    '/warga': 'Beranda Warga',
    '/warga/riwayat': 'Riwayat Skrining',
    '/warga/minum-obat': 'Minum Obat',
    '/warga/edukasi': 'Video Edukasi',
    '/warga/profil': 'Profil Warga',
    '/riwayat': 'Riwayat',
    '/edukasi': 'Edukasi',
    '/profil': 'Profil',
    '/admin': 'Admin',
    '/admin/data-skrining': 'Data Skrining',
    '/admin/rujukan': 'Rujukan',
    '/admin/kader': 'Kader',
    '/admin/edukasi': 'Edukasi Admin',
    '/admin/laporan': 'Laporan',
    '/admin/pengaturan': 'Pengaturan',
  };
  return titles[path] || APP_TITLE;
}

export function progressBar(percent, label) {
  return `
    <div class="screening-progress" aria-label="Progres skrining ${percent}%">
      <div class="d-flex align-items-center justify-content-between mb-2">
        <span>${label}</span>
        <strong>${percent}%</strong>
      </div>
      <div class="progress" role="progressbar" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100">
        <div class="progress-bar" style="width:${percent}%"></div>
      </div>
    </div>
  `;
}

export function appHeader(title, subtitle = '', options = {}) {
  const back = options.back
    ? `<button class="icon-button" type="button" data-nav="${options.back}" aria-label="Kembali">
        <i class="bi bi-arrow-left"></i>
      </button>`
    : '';
  const action = options.action || '';
  return `
    <header class="mobile-header">
      <div class="d-flex align-items-center gap-3">
        ${back}
        <div class="min-w-0">
          <h1>${title}</h1>
          ${subtitle ? `<p>${subtitle}</p>` : ''}
        </div>
      </div>
      ${action}
    </header>
  `;
}

export function bottomNav(active = 'beranda', role = getCurrentUser()?.role || 'kader') {
  const items =
    role === 'warga'
      ? [
          { id: 'beranda', label: 'Beranda', icon: 'bi-house-fill', route: '/warga' },
          { id: 'skrining', label: 'Skrining', icon: 'bi-clipboard2-plus-fill', route: '/skrining/data-warga' },
          { id: 'riwayat', label: 'Riwayat', icon: 'bi-clipboard2-pulse-fill', route: '/warga/riwayat' },
          { id: 'obat', label: 'Obat', icon: 'bi-capsule-pill', route: '/warga/minum-obat' },
          { id: 'edukasi', label: 'Edukasi', icon: 'bi-play-circle-fill', route: '/warga/edukasi' },
          { id: 'profil', label: 'Profil', icon: 'bi-person-circle', route: '/warga/profil' },
        ]
      : [
          { id: 'beranda', label: 'Beranda', icon: 'bi-house-fill', route: '/kader' },
          { id: 'skrining', label: 'Skrining', icon: 'bi-person-plus-fill', route: '/skrining/data-warga' },
          { id: 'riwayat', label: 'Riwayat', icon: 'bi-clipboard2-pulse-fill', route: '/riwayat' },
          { id: 'obat', label: 'Obat', icon: 'bi-capsule-pill', route: '/kader/minum-obat' },
          { id: 'edukasi', label: 'Edukasi', icon: 'bi-play-circle-fill', route: '/edukasi' },
          { id: 'profil', label: 'Profil', icon: 'bi-person-circle', route: '/profil' },
        ];

  return `
    <nav class="bottom-nav" style="--nav-count:${items.length}" aria-label="Navigasi ${role === 'warga' ? 'warga' : 'kader'}">
      ${items
        .map(
          (item) => `
            <button class="${active === item.id ? 'active' : ''}" type="button" data-nav="${item.route}">
              <i class="bi ${item.icon}" aria-hidden="true"></i>
              <span>${item.label}</span>
            </button>
          `,
        )
        .join('')}
    </nav>
  `;
}

export function mobileShell(content, activeNav = 'beranda', shellClass = '', role = getCurrentUser()?.role || 'kader') {
  return `
    <main class="app-page">
      <section class="mobile-shell ${shellClass}">
        ${content}
        ${bottomNav(activeNav, role)}
      </section>
    </main>
  `;
}

export function safeDisclaimer() {
  return `
    <div class="alert alert-medical" role="note">
      <i class="bi bi-shield-check" aria-hidden="true"></i>
      <span>${medicalDisclaimer}</span>
    </div>
  `;
}

export function yesNoGroup(question, value = '') {
  return `
    <fieldset class="question-card">
      <legend>
        <span>${question.label}</span>
        ${
          question.help
            ? `<button class="help-dot" type="button" data-bs-toggle="tooltip" data-bs-title="${escapeHtml(question.help)}" aria-label="Bantuan">
                <i class="bi bi-question-circle"></i>
              </button>`
            : ''
        }
      </legend>
      <div class="yes-no-group" data-field="${question.id}">
        <button class="choice-btn ${value === 'yes' ? 'active-yes' : ''}" type="button" data-value="yes">
          Ya
        </button>
        <button class="choice-btn ${value === 'no' ? 'active-no' : ''}" type="button" data-value="no">
          Tidak
        </button>
      </div>
    </fieldset>
  `;
}

export function yesNoTable(questions = [], answers = {}, options = {}) {
  const title = options.title || '';
  const description = options.description || '';

  return `
    <section class="paper-section">
      ${title ? `<h2 class="paper-section-title">${title}</h2>` : ''}
      ${description ? `<p class="paper-section-description">${description}</p>` : ''}
      <div class="paper-table-wrap">
        <table class="paper-check-table">
          <thead>
            <tr>
              <th scope="col">No</th>
              <th scope="col">${options.itemHeader || 'Pertanyaan'}</th>
              <th scope="col">Ya</th>
              <th scope="col">Tidak</th>
            </tr>
          </thead>
          <tbody>
            ${questions
              .map(
                (question, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${question.label}</td>
                    <td>
                      <div class="yes-no-group paper-choice" data-field="${question.id}">
                        <button class="choice-btn ${answers[question.id] === 'yes' ? 'active-yes' : ''}" type="button" data-value="yes" aria-label="${question.label} Ya">
                          Ya
                        </button>
                      </div>
                    </td>
                    <td>
                      <div class="yes-no-group paper-choice" data-field="${question.id}">
                        <button class="choice-btn ${answers[question.id] === 'no' ? 'active-no' : ''}" type="button" data-value="no" aria-label="${question.label} Tidak">
                          Tidak
                        </button>
                      </div>
                    </td>
                  </tr>
                `,
              )
              .join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

export function bindYesNoGroups(root, onChange) {
  root.querySelectorAll('.yes-no-group .choice-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const group = button.closest('.yes-no-group');
      const field = group.dataset.field;
      const rootScope = button.closest('[data-field-group]') || button.closest('form') || root;
      const value = button.dataset.value;

      rootScope.querySelectorAll(`.yes-no-group[data-field="${field}"] .choice-btn`).forEach((item) => {
        item.classList.remove('active-yes', 'active-no');
      });
      button.classList.add(value === 'yes' ? 'active-yes' : 'active-no');
      onChange(field, value);
    });
  });
}

export function formDataObject(form) {
  return Object.fromEntries(new FormData(form).entries());
}

export function resultLabel(result) {
  const normalized = result === 'followUp' ? 'follow-up' : result;
  const labels = {
    negative: 'Negatif',
    positive: 'Positif',
    low: 'Negatif',
    monitor: 'Positif',
    'follow-up': 'Positif',
  };
  return labels[normalized] || 'Belum Dinilai';
}

export function resultBadge(result) {
  const normalized = result === 'followUp' ? 'follow-up' : result;
  const classes = {
    negative: 'text-bg-success',
    positive: 'text-bg-danger',
    low: 'text-bg-success',
    monitor: 'text-bg-danger',
    'follow-up': 'text-bg-danger',
  };
  return `<span class="badge ${classes[normalized] || 'text-bg-secondary'}">${resultLabel(normalized)}</span>`;
}

export function medicationStatusLabel(status) {
  const labels = {
    sudah: 'Sudah Minum Obat',
    belum: 'Belum Minum Obat',
    'belum-update': 'Belum Update',
  };
  return labels[status] || labels['belum-update'];
}

export function medicationStatusBadge(status) {
  const classes = {
    sudah: 'text-bg-success',
    belum: 'text-bg-danger',
    'belum-update': 'text-bg-secondary',
  };
  const normalized = status || 'belum-update';
  return `<span class="badge ${classes[normalized] || classes['belum-update']}">${medicationStatusLabel(normalized)}</span>`;
}

export function syncBadge(status) {
  if (status === 'synced') {
    return '<span class="badge text-bg-success">Tersinkron</span>';
  }
  return '<span class="badge text-bg-warning">Tersimpan lokal</span>';
}

export function bindNavigation(root, navigate) {
  root.querySelectorAll('[data-nav]').forEach((button) => {
    button.addEventListener('click', () => navigate(button.dataset.nav));
  });
}

export function setupBootstrapTooltips(root) {
  if (!window.bootstrap) return;
  root.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((element) => {
    window.bootstrap.Tooltip.getOrCreateInstance(element);
  });
}

export function setupModalButtons(root) {
  if (!window.bootstrap) return;
  root.querySelectorAll('[data-open-modal]').forEach((button) => {
    button.addEventListener('click', () => {
      const modal = document.querySelector(button.dataset.openModal);
      if (modal) window.bootstrap.Modal.getOrCreateInstance(modal).show();
    });
  });
}
