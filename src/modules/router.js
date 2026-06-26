import { adminDashboardView } from '../views/admin-dashboard.js';
import { adminCadresView } from '../views/admin-cadres.js';
import { adminEducationView } from '../views/admin-education.js';
import { adminReferralsView } from '../views/admin-referrals.js';
import { adminReportsView } from '../views/admin-reports.js';
import { adminScreeningDataView } from '../views/admin-screening-data.js';
import { adminSettingsView } from '../views/admin-settings.js';
import { cadreMedicationMonitorView } from '../views/cadre-medication-monitor.js';
import { cadreDashboardView } from '../views/cadre-dashboard.js';
import { citizenFormView } from '../views/citizen-form.js';
import { consentSummaryView } from '../views/consent-summary.js';
import { educationView } from '../views/education.js';
import { environmentFormView } from '../views/environment-form.js';
import { loginView } from '../views/login.js';
import { physicalFormView } from '../views/physical-form.js';
import { cadreProfileView } from '../views/cadre-profile.js';
import { referralFormView } from '../views/referral-form.js';
import { screeningHistoryView } from '../views/screening-history.js';
import { screeningResultView } from '../views/screening-result.js';
import { splashView } from '../views/splash.js';
import { symptomsFormView } from '../views/symptoms-form.js';
import { wargaDashboardView } from '../views/warga-dashboard.js';
import { wargaMedicationView } from '../views/warga-medication.js';
import { wargaProfileView } from '../views/warga-profile.js';
import { wargaScreeningHistoryView } from '../views/warga-screening-history.js';
import { getCurrentUser, getHomeRoute } from './storage.js';
import {
  bindNavigation,
  setupBootstrapTooltips,
  setupModalButtons,
  setupSpeakerButtons,
} from './screening.js';

const routes = {
  '/splash': { view: splashView, public: true },
  '/login': { view: loginView, public: true },
  '/kader': { view: cadreDashboardView, roles: ['kader', 'admin'] },
  '/kader/minum-obat': { view: cadreMedicationMonitorView, roles: ['kader', 'admin'] },
  '/warga': { view: wargaDashboardView, roles: ['warga'] },
  '/warga/riwayat': { view: wargaScreeningHistoryView, roles: ['warga'] },
  '/warga/minum-obat': { view: wargaMedicationView, roles: ['warga'] },
  '/warga/edukasi': { view: educationView, roles: ['warga'] },
  '/warga/profil': { view: wargaProfileView, roles: ['warga'] },
  '/skrining/data-warga': { view: citizenFormView, roles: ['kader', 'admin', 'warga'] },
  '/skrining/kondisi-fisik': { view: physicalFormView, roles: ['kader', 'admin', 'warga'] },
  '/skrining/gejala': { view: symptomsFormView, roles: ['kader', 'admin', 'warga'] },
  '/skrining/riwayat-pengobatan': { view: environmentFormView, roles: ['kader', 'admin', 'warga'] },
  '/skrining/lingkungan': { view: environmentFormView, roles: ['kader', 'admin', 'warga'] },
  '/skrining/ringkasan': { view: consentSummaryView, roles: ['kader', 'admin', 'warga'] },
  '/skrining/hasil': { view: screeningResultView, roles: ['kader', 'admin', 'warga'] },
  '/rujukan': { view: referralFormView, roles: ['kader', 'admin'] },
  '/riwayat': { view: screeningHistoryView, roles: ['kader', 'admin'] },
  '/edukasi': { view: educationView, roles: ['kader', 'admin'] },
  '/profil': { view: cadreProfileView, roles: ['kader', 'admin'] },
  '/admin': { view: adminDashboardView, roles: ['kader', 'admin'] },
  '/admin/data-skrining': { view: adminScreeningDataView, roles: ['kader', 'admin'] },
  '/admin/rujukan': { view: adminReferralsView, roles: ['kader', 'admin'] },
  '/admin/kader': { view: adminCadresView, roles: ['kader', 'admin'] },
  '/admin/edukasi': { view: adminEducationView, roles: ['kader', 'admin'] },
  '/admin/laporan': { view: adminReportsView, roles: ['kader', 'admin'] },
  '/admin/pengaturan': { view: adminSettingsView, roles: ['kader', 'admin'] },
};

function getPath() {
  const hash = window.location.hash.replace('#', '');
  return hash || '/splash';
}

export function navigate(path) {
  if (!path.startsWith('/')) return;
  window.location.hash = path;
}

export function createRouter(app, helpers) {
  function render() {
    const path = getPath();
    const route = routes[path] || routes['/splash'];
    const user = getCurrentUser();

    if (!route.public && !user) {
      helpers?.showToast?.('Silakan login terlebih dahulu.', 'warning');
      navigate('/login');
      return;
    }

    if (route.roles && !route.roles.includes(user?.role)) {
      helpers?.showToast?.('Akses halaman dibatasi sesuai peran akun.', 'warning');
      navigate(getHomeRoute(user));
      return;
    }

    if (path === '/login' && user) {
      navigate(getHomeRoute(user));
      return;
    }

    const viewFactory = route.view;
    const view = viewFactory();
    app.innerHTML = view.html;

    if (window.Alpine) {
      window.Alpine.initTree(app);
    }

    bindNavigation(app, navigate);
    setupModalButtons(app);
    setupBootstrapTooltips(app);
    setupSpeakerButtons(app, helpers?.showToast);
    view.mount?.({ app, navigate, ...helpers });

    requestAnimationFrame(() => {
      const focusTarget = app.querySelector('main, [tabindex="-1"], h1');
      focusTarget?.focus?.({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: 'auto' });
    });
  }

  window.addEventListener('hashchange', render);
  render();

  return {
    render,
    navigate,
  };
}
