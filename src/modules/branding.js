export const APP_TITLE = 'SI-KASEP';
export const APP_SUBTITLE = 'Sistem Informasi - Kenali, Amati, Skrining, Edukasi, Pengobatan';
export const APP_FULL_TITLE = `${APP_TITLE} (${APP_SUBTITLE})`;

export function brandTitleMarkup(className = '') {
  const classAttribute = className ? ` class="${className}"` : '';

  return `
    <h1${classAttribute}>
      <span class="brand-title-main">${APP_TITLE}</span>
      <span class="brand-title-detail">(${APP_SUBTITLE})</span>
    </h1>
  `;
}

export function brandLogoPair(variant = 'default') {
  return `
    <div class="brand-logo-pair brand-logo-pair--${variant}" aria-label="Logo Universitas Trisakti dan SI-KASEP">
      <span class="brand-logo-frame brand-logo-frame--trisakti">
        <img src="/images/logo-trisakti.png" alt="Logo Universitas Trisakti" />
      </span>
      <span class="brand-logo-frame brand-logo-frame--sikasep">
        <img src="/images/logo-si-kasep.png" alt="Logo SI-KASEP" />
      </span>
    </div>
  `;
}
