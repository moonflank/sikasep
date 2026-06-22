import { brandLogoPair, brandTitleMarkup } from '../modules/branding.js';

export function splashView() {
  return {
    html: `
      <main class="app-page">
        <section class="mobile-shell splash-shell">
          <div class="splash-content">
            <img class="splash-village" src="/images/baduy-village.png" alt="" aria-hidden="true" />
            <div class="brand-lockup brand-lockup--splash">
              ${brandLogoPair('splash')}
              <div>
                ${brandTitleMarkup('splash-title')}
              </div>
            </div>
          </div>
          <footer class="splash-footer">
            <div class="pattern-strip" aria-hidden="true"></div>
            <button class="btn btn-primary btn-lg w-100" type="button" data-nav="/login">
              MASUK
            </button>
          </footer>
        </section>
      </main>
    `,
  };
}
