import {
  environmentQuestions,
  riskFactorQuestions,
  visibleSymptomQuestions,
} from '../data/screening-rules.js';
import {
  addScreeningRecord,
  getDraft,
  makeLocalRecord,
  saveDraft,
  setLastResult,
} from '../modules/storage.js';
import { calculateRisk } from '../data/screening-rules.js';
import {
  analysisSpeechText,
  appHeader,
  escapeHtml,
  mobileShell,
  progressBar,
  speakerButton,
} from '../modules/screening.js';

function selectedFactors(questions, answers = {}) {
  return questions.filter((question) => answers[question.id] === 'yes').map((question) => question.factor);
}

function yesNoLabel(value) {
  if (value === 'yes') return 'Ya';
  if (value === 'no') return 'Tidak';
  return '-';
}

function treatmentCompletedLabel(value, hasTreatment) {
  if (!hasTreatment) return '-';
  if (value === 'yes') return 'Tuntas';
  if (value === 'no') return 'Tidak tuntas';
  return 'Belum diisi';
}

function factorList(title, items) {
  return `
    <div class="summary-card">
      <div class="d-flex justify-content-between align-items-center gap-2 mb-2">
        <h2 class="section-title mb-0">${title}</h2>
      </div>
      ${
        items.length
          ? `<ul class="mb-0">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
          : '<p class="muted mb-0">Tidak ada faktor yang ditandai Ya.</p>'
      }
    </div>
  `;
}

export function consentSummaryView() {
  const draft = getDraft();
  const citizen = draft.citizen || {};
  const physicalData = draft.physical || {};
  const riskFactors = selectedFactors(riskFactorQuestions, draft.physical);
  const symptoms = selectedFactors(visibleSymptomQuestions(draft), draft.symptoms);
  const environment = selectedFactors(environmentQuestions, draft.environment);
  const treatment = draft.treatment || {};
  const previousTbTreatment = treatment.previousTbTreatment || draft.symptoms?.previousTbTreatment || '';
  const hasTreatment = previousTbTreatment === 'yes';
  const risk = calculateRisk(draft);
  const riskSpeechText = analysisSpeechText(risk, 'Hasil skrining otomatis');

  const content = `
    ${appHeader('Ringkasan Skrining', 'Periksa sebelum disimpan', { back: '/skrining/riwayat-pengobatan' })}
    ${progressBar(100, 'Ringkasan')}
    <div class="mobile-content screening-content">
      <section class="summary-card">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h2 class="section-title mb-0">Data Warga</h2>
          <button class="btn btn-sm btn-outline-primary" type="button" data-nav="/skrining/data-warga">Edit</button>
        </div>
        <ul class="summary-list">
          <li><span>Nama</span><strong>${escapeHtml(citizen.name || '-')}</strong></li>
          <li><span>Umur</span><strong>${escapeHtml(citizen.age || '-')} tahun</strong></li>
          <li><span>Tanggal lahir</span><strong>${escapeHtml(citizen.birthDate || '-')}</strong></li>
          <li><span>NIK</span><strong>${escapeHtml(citizen.nik || '-')}</strong></li>
          <li><span>Jenis kelamin</span><strong>${escapeHtml(citizen.gender || '-')}</strong></li>
          <li><span>Alamat</span><strong>${escapeHtml(citizen.address || citizen.region || '-')}</strong></li>
          <li><span>Tanggal pemeriksaan</span><strong>${escapeHtml(citizen.screeningDate || '-')}</strong></li>
          <li><span>Petugas skrining</span><strong>${escapeHtml(citizen.cadreName || '-')}</strong></li>
        </ul>
      </section>

      <section class="summary-card ${risk.level === 'positive' ? 'result-danger' : 'result-success'}">
        <div class="section-heading-action">
          <h2 class="section-title mb-0">Hasil Skrining Otomatis</h2>
          ${speakerButton(riskSpeechText, { ariaLabel: 'Dengarkan hasil skrining otomatis' })}
        </div>
        <ul class="summary-list">
          <li><span>Kategori responden</span><strong>${escapeHtml(risk.respondentCategory)}</strong></li>
          <li><span>Status skrining</span><strong>${escapeHtml(risk.status)}</strong></li>
        </ul>
        <p class="fw-bold mt-3 mb-2">${escapeHtml(risk.reasonSummary)}</p>
        <p class="mb-0">${escapeHtml(risk.recommendation)}</p>
      </section>

      <section class="summary-card">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h2 class="section-title mb-0">Status Gizi</h2>
          <button class="btn btn-sm btn-outline-primary" type="button" data-nav="/skrining/kondisi-fisik">Edit</button>
        </div>
        <ul class="summary-list">
          <li><span>Berat badan</span><strong>${escapeHtml(physicalData.weight || '-')} kg</strong></li>
          <li><span>Tinggi badan</span><strong>${escapeHtml(physicalData.height || '-')} cm</strong></li>
          <li><span>IMT</span><strong>${escapeHtml(physicalData.bmi || '-')}</strong></li>
          <li><span>Status gizi</span><strong>${escapeHtml(physicalData.nutritionStatus || '-')}</strong></li>
        </ul>
      </section>

      ${factorList('Penyakit Lain / Faktor Risiko', riskFactors)}
      ${factorList('Gejala Klinis', symptoms)}
      <section class="summary-card">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h2 class="section-title mb-0">Riwayat Pengobatan</h2>
          <button class="btn btn-sm btn-outline-primary" type="button" data-nav="/skrining/riwayat-pengobatan">Edit</button>
        </div>
        <ul class="summary-list">
          <li>
            <span>Pernah pengobatan TBC</span>
            <strong>${yesNoLabel(previousTbTreatment)}</strong>
          </li>
          <li>
            <span>Status pengobatan sebelumnya</span>
            <strong>${treatmentCompletedLabel(treatment.treatmentCompleted, hasTreatment)}</strong>
          </li>
        </ul>
      </section>
      ${environment.length ? factorList('Lingkungan dan Kontak Tambahan', environment) : ''}

      <section class="summary-card">
        <h2 class="section-title">Persetujuan Warga</h2>
        <p class="muted">
          Data digunakan untuk membantu pencatatan kader dan tindak lanjut layanan kesehatan.
          Hindari membagikan informasi pribadi tanpa persetujuan warga.
        </p>
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id="consentCheck" ${draft.consent ? 'checked' : ''} />
          <label class="form-check-label fw-bold" for="consentCheck">
            Saya telah menjelaskan tujuan skrining dan memperoleh persetujuan warga untuk mencatat data.
          </label>
        </div>
      </section>

      <div class="form-actions">
        <button class="btn btn-outline-primary" type="button" data-nav="/skrining/riwayat-pengobatan">Kembali</button>
        <button class="btn btn-primary" type="button" id="saveResult" ${draft.consent ? '' : 'disabled'}>
          Simpan dan Lihat Rekomendasi
        </button>
      </div>
    </div>
  `;

  return {
    html: mobileShell(content, 'skrining'),
    mount({ app, navigate, showToast }) {
      const checkbox = app.querySelector('#consentCheck');
      const saveButton = app.querySelector('#saveResult');

      checkbox.addEventListener('change', () => {
        saveButton.disabled = !checkbox.checked;
        const latestDraft = getDraft();
        latestDraft.consent = checkbox.checked;
        saveDraft(latestDraft);
      });

      saveButton.addEventListener('click', () => {
        const latestDraft = { ...getDraft(), consent: true };
        const risk = calculateRisk(latestDraft);
        const record = makeLocalRecord(latestDraft, risk);
        addScreeningRecord(record);
        setLastResult({ risk, draft: latestDraft, record });
        saveDraft(latestDraft);
        showToast('Hasil skrining prototype tersimpan lokal.', 'success');
        navigate('/skrining/hasil');
      });
    },
  };
}
