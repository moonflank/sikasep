import { brandLogoPair, brandTitleMarkup } from '../modules/branding.js';
import { connectionBadgeMarkup } from '../modules/offline.js';
import { wargaUsers } from '../data/mock-data.js';
import { clearDraft, getHomeRoute, setCurrentUser } from '../modules/storage.js';

export function loginView() {
  return {
    html: `
      <main class="app-page">
        <section class="mobile-shell login-shell" x-data="{ showPassword: false }">
          <div class="login-hero brand-lockup brand-lockup--login">
            <img class="login-people" src="/images/baduy-people.png" alt="" aria-hidden="true" />
            ${brandLogoPair('login')}
            <div>
              ${brandTitleMarkup()}
              <span class="login-context">Masuk menggunakan akun kader, warga, atau admin demo.</span>
            </div>
          </div>

          <div class="login-card soft-card">
            <div class="d-flex justify-content-between align-items-center gap-2 mb-3">
              <span class="fw-bold text-primary">Status Koneksi</span>
              ${connectionBadgeMarkup()}
            </div>

            <form id="loginForm" novalidate>
              <div class="mb-3">
                <label class="form-label" for="userId">ID Pengguna</label>
                <input class="form-control" id="userId" name="userId" autocomplete="username" placeholder="Contoh: kader01 atau warga01" required />
              </div>

              <div class="mb-2">
                <label class="form-label" for="password">PIN atau Password</label>
                <div class="input-group">
                  <input
                    class="form-control"
                    id="password"
                    name="password"
                    autocomplete="current-password"
                    placeholder="Masukkan password"
                    :type="showPassword ? 'text' : 'password'"
                    required
                  />
                  <button
                    class="btn btn-outline-primary"
                    type="button"
                    @click="showPassword = !showPassword"
                    aria-label="Tampilkan atau sembunyikan password"
                  >
                    <i class="bi" :class="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                  </button>
                </div>
              </div>

              <div id="loginMessage" class="invalid-feedback d-block mb-2" role="alert"></div>

              <button class="btn btn-primary btn-lg w-100 mt-2" type="submit">
                <i class="bi bi-box-arrow-in-right" aria-hidden="true"></i>
                Masuk
              </button>

              <button class="btn btn-link w-100 mt-2" type="button" data-toast="Fitur pemulihan kata sandi belum tersedia pada prototype.">
                Lupa Kata Sandi
              </button>
            </form>

            <div class="alert alert-light border mt-3 mb-0 small">
              <i class="bi bi-shield-lock" aria-hidden="true"></i>
              Demo: kader01, warga01, atau admin01 dengan password demo123.
            </div>
          </div>
        </section>
      </main>
    `,
    mount({ app, navigate, showToast }) {
      const form = app.querySelector('#loginForm');
      const message = app.querySelector('#loginMessage');

      app.querySelectorAll('[data-toast]').forEach((button) => {
        button.addEventListener('click', () => showToast(button.dataset.toast, 'info'));
      });

      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(form).entries());
        const userId = String(data.userId || '').trim().toLowerCase();
        const password = String(data.password || '');

        if (userId === 'kader01' && password === 'demo123') {
          setCurrentUser({ id: 'kader01', name: 'Kader Asep', role: 'kader' });
          showToast('Login demo berhasil.', 'success');
          clearDraft();
          navigate('/kader');
          return;
        }

        if (userId === 'admin01' && password === 'demo123') {
          setCurrentUser({ id: 'admin01', name: 'Admin Puskesmas', role: 'admin' });
          showToast('Login admin demo berhasil.', 'success');
          clearDraft();
          navigate('/admin');
          return;
        }

        const warga = wargaUsers.find((item) => item.id === userId);
        if (warga && password === 'demo123') {
          setCurrentUser({ ...warga, role: 'warga' });
          showToast('Login warga demo berhasil.', 'success');
          clearDraft();
          navigate(getHomeRoute({ ...warga, role: 'warga' }));
          return;
        }

        message.textContent = 'ID pengguna atau password belum sesuai dengan kredensial demo.';
      });
    },
  };
}
