import { calculateRisk, visibleSymptomQuestions } from '../data/screening-rules.js';
import { getDraft, updateDraftSection } from '../modules/storage.js';
import {
  appHeader,
  bindYesNoGroups,
  escapeHtml,
  mobileShell,
  progressBar,
  yesNoGroup,
} from '../modules/screening.js';

function screeningPreviewMarkup(result) {
  const isPositive = result.level === 'positive';
  return `
    <section class="screening-preview screening-preview--${isPositive ? 'positive' : 'negative'}" id="screeningPreview" aria-live="polite">
      <span>Hasil skrining otomatis</span>
      <div class="summary-list">
        <div><span>Kategori responden</span><strong>${escapeHtml(result.respondentCategory)}</strong></div>
        <div><span>Status skrining</span><strong>${escapeHtml(result.status)}</strong></div>
      </div>
      <p class="fw-bold mb-1">${escapeHtml(result.reasonSummary)}</p>
      <p class="mb-0">${escapeHtml(result.recommendation)}</p>
    </section>
  `;
}

export function symptomsFormView() {
  const draft = getDraft();
  const symptoms = draft.symptoms || {};
  const questions = visibleSymptomQuestions(draft);
  const initialResult = calculateRisk(draft);

  const content = `
    ${appHeader('Langkah 3: Gejala dan Tanda TBC', 'Checklist Ya/Tidak', { back: '/skrining/kondisi-fisik' })}
    ${progressBar(60, 'Gejala TBC')}
    <div class="mobile-content screening-content">
      <form id="symptomsForm" novalidate>
        <section class="paper-section" data-field-group>
          <h2 class="paper-section-title">Gejala dan Tanda TBC</h2>
          <p class="paper-section-description">Pilih Ya atau Tidak sesuai kondisi responden.</p>
          ${questions
            .map((question, index) =>
              yesNoGroup({ ...question, label: `${index + 1}. ${question.label}` }, symptoms[question.id]),
            )
            .join('')}
        </section>
        ${screeningPreviewMarkup(initialResult)}
        <div id="symptomError" class="alert alert-danger d-none" role="alert">
          Mohon pilih Ya atau Tidak untuk setiap pertanyaan gejala.
        </div>
        <div class="form-actions">
          <button class="btn btn-outline-primary" type="button" data-nav="/skrining/kondisi-fisik">Kembali</button>
          <button class="btn btn-primary" type="submit">Lanjut Riwayat</button>
        </div>
      </form>
    </div>
  `;

  return {
    html: mobileShell(content, 'skrining'),
    mount({ app, navigate }) {
      const form = app.querySelector('#symptomsForm');
      const answers = { ...symptoms };
      const renderPreview = () => {
        const latestDraft = { ...getDraft(), symptoms: answers };
        app.querySelector('#screeningPreview').outerHTML = screeningPreviewMarkup(calculateRisk(latestDraft));
      };

      bindYesNoGroups(app, (field, value) => {
        answers[field] = value;
        updateDraftSection('symptoms', { [field]: value });
        renderPreview();
      });

      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const missing = questions.some((question) => !answers[question.id]);
        app.querySelector('#symptomError').classList.toggle('d-none', !missing);
        if (missing) return;
        updateDraftSection('symptoms', answers);
        navigate('/skrining/riwayat-pengobatan');
      });
    },
  };
}
