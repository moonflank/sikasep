import { resultCopy } from '../data/screening-rules.js';
import { clearDraft, getCurrentUser, getLastResult } from '../modules/storage.js';
import {
  analysisSpeechText,
  appHeader,
  escapeHtml,
  mobileShell,
  resultBadge,
  safeDisclaimer,
  speakerButton,
} from '../modules/screening.js';

function normalizeLevel(level = 'low') {
  return level === 'follow-up' ? 'followUp' : level;
}

function yesNoLabel(value) {
  if (value === 'yes') return 'Ya';
  if (value === 'no') return 'Tidak';
  return '-';
}

function treatmentStatusLabel(draft = {}) {
  const treatment = draft.treatment || {};
  const previousTbTreatment = treatment.previousTbTreatment || draft.symptoms?.previousTbTreatment || '';
  if (previousTbTreatment !== 'yes') return 'Tidak ada riwayat';
  if (treatment.treatmentCompleted === 'yes') return 'Tuntas';
  if (treatment.treatmentCompleted === 'no') return 'Tidak tuntas';
  return 'Belum diisi';
}

export function screeningResultView() {
  const currentUser = getCurrentUser();
  const isWarga = currentUser?.role === 'warga';
  const last = getLastResult();
  const risk = last?.risk || {
    level: 'low',
    score: 0,
    factors: [],
  };
  const level = normalizeLevel(risk.level);
  const draft = last?.draft || {};
  const previousTbTreatment = draft.treatment?.previousTbTreatment || draft.symptoms?.previousTbTreatment || '';
  const copy = resultCopy[level] || resultCopy.low;
  const toneClass = {
    negative: 'result-success',
    positive: 'result-danger',
    low: 'result-success',
    monitor: 'result-warning',
    followUp: 'result-danger',
  }[level];
  const resultSpeechText = analysisSpeechText(
    {
      respondentCategory: risk.respondentCategory,
      status: risk.status || copy.label,
      reasonSummary: risk.reasonSummary || copy.text,
      recommendation: risk.recommendation || copy.recommendation,
    },
    `Hasil skrining ${copy.label}`,
  );

  const actionButtons =
    level === 'negative' || level === 'low'
      ? `
        <button class="btn btn-primary w-100" type="button" data-nav="${isWarga ? '/warga/edukasi' : '/edukasi'}">
          <i class="bi bi-book" aria-hidden="true"></i>
          Buka Materi Edukasi
        </button>
        <button class="btn btn-outline-primary w-100" type="button" id="finishHome">
          Simpan dan Kembali ke Beranda
        </button>
      `
      : level === 'monitor'
        ? `
          <button class="btn btn-primary w-100" type="button" id="finishHome">Simpan Hasil</button>
          <button class="btn btn-outline-primary w-100" type="button" data-toast="Jadwal pemantauan prototype berhasil dicatat di perangkat.">
            Jadwalkan Pemantauan
          </button>
          <button class="btn btn-outline-primary w-100" type="button" data-nav="${isWarga ? '/warga/edukasi' : '/edukasi'}">
            Buka Materi Edukasi
          </button>
        `
        : isWarga
          ? `
          <button class="btn btn-primary w-100" type="button" id="finishHome">
            Simpan dan Kembali ke Beranda
          </button>
          <button class="btn btn-outline-primary w-100" type="button" data-toast="Silakan hubungi kader atau Puskesmas untuk pemeriksaan lanjutan.">
            Hubungi Kader/Puskesmas
          </button>
        `
        : `
          <button class="btn btn-primary w-100" type="button" id="createReferral">
            <i class="bi bi-hospital" aria-hidden="true"></i>
            Buat Rujukan Puskesmas
          </button>
          <button class="btn btn-outline-primary w-100" type="button" id="finishHome">
            Simpan dan Kembali ke Beranda
          </button>
        `;

  const content = `
    ${appHeader('Hasil Skrining', 'Rekomendasi tindak lanjut', { back: '/skrining/ringkasan' })}
    <div class="mobile-content">
      <section class="result-panel ${toneClass}">
        <div class="d-flex align-items-start gap-3">
          <span class="result-icon">
            <i class="bi ${copy.icon}" aria-hidden="true"></i>
          </span>
          <div class="min-w-0 flex-grow-1">
            <div class="mb-2">${resultBadge(level === 'followUp' ? 'follow-up' : level)}</div>
            <div class="result-title-row">
              <h2 class="h4 fw-bold mb-0">${copy.label}</h2>
              ${speakerButton(resultSpeechText, { ariaLabel: 'Dengarkan hasil skrining' })}
            </div>
            ${
              risk.respondentCategory || risk.status
                ? `
                  <ul class="summary-list mb-3">
                    <li><span>Kategori responden</span><strong>${escapeHtml(risk.respondentCategory || '-')}</strong></li>
                    <li><span>Status skrining</span><strong>${escapeHtml(risk.status || copy.label)}</strong></li>
                  </ul>
                `
                : ''
            }
            <p class="mb-2">${copy.text}</p>
            <p class="mb-2 fw-bold">${escapeHtml(risk.reasonSummary || copy.text)}</p>
            <p class="mb-0 fw-bold">${escapeHtml(risk.recommendation || copy.recommendation)}</p>
          </div>
        </div>
      </section>

      ${
        level === 'followUp' || level === 'positive'
          ? `
            <section class="soft-card mt-3">
              <h3 class="section-title">Faktor yang Perlu Diperhatikan</h3>
              ${
                risk.factors?.length
                  ? `<ul class="mb-0">${risk.factors.map((factor) => `<li>${escapeHtml(factor)}</li>`).join('')}</ul>`
                  : '<p class="muted mb-0">Belum ada faktor spesifik pada data terakhir.</p>'
              }
            </section>
          `
          : ''
      }

      <section class="soft-card mt-3">
        <h3 class="section-title">Riwayat Pengobatan</h3>
        <ul class="summary-list">
          <li><span>Pernah pengobatan TBC</span><strong>${yesNoLabel(previousTbTreatment)}</strong></li>
          <li><span>Status pengobatan sebelumnya</span><strong>${escapeHtml(treatmentStatusLabel(draft))}</strong></li>
        </ul>
      </section>

      <div class="mt-3">${safeDisclaimer()}</div>

      <div class="d-grid gap-2 mt-3">
        ${actionButtons}
      </div>
    </div>
  `;

  return {
    html: mobileShell(content, 'skrining'),
    mount({ app, navigate, showToast }) {
      app.querySelectorAll('[data-toast]').forEach((button) => {
        button.addEventListener('click', () => showToast(button.dataset.toast, 'success'));
      });

      const finish = app.querySelector('#finishHome');
      if (finish) {
        finish.addEventListener('click', () => {
          clearDraft();
          navigate(isWarga ? '/warga' : '/kader');
        });
      }

      const referralButton = app.querySelector('#createReferral');
      if (referralButton) {
        referralButton.addEventListener('click', () => {
          navigate('/rujukan');
        });
      }
    },
  };
}
