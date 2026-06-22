import {
  calculateRisk,
  treatmentCompletionQuestion,
  treatmentQuestions,
} from '../data/screening-rules.js';
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
    <section class="screening-preview screening-preview--${isPositive ? 'positive' : 'negative'}" id="treatmentPreview" aria-live="polite">
      <span>Hasil skrining sementara</span>
      <div class="summary-list">
        <div><span>Kategori responden</span><strong>${escapeHtml(result.respondentCategory)}</strong></div>
        <div><span>Status skrining</span><strong>${escapeHtml(result.status)}</strong></div>
      </div>
      <p class="fw-bold mb-1">${escapeHtml(result.reasonSummary)}</p>
      <p class="mb-0">${escapeHtml(result.recommendation)}</p>
    </section>
  `;
}

function treatmentCompletionGroup(value = '', hidden = true) {
  return `
    <fieldset class="question-card ${hidden ? 'd-none' : ''}" id="treatmentCompletionWrap">
      <legend>
        <span>2. ${treatmentCompletionQuestion.label}</span>
      </legend>
      <div class="yes-no-group" data-field="${treatmentCompletionQuestion.id}">
        <button class="choice-btn ${value === 'yes' ? 'active-yes' : ''}" type="button" data-value="yes">
          Tuntas
        </button>
        <button class="choice-btn ${value === 'no' ? 'active-no' : ''}" type="button" data-value="no">
          Tidak tuntas
        </button>
      </div>
    </fieldset>
  `;
}

export function environmentFormView() {
  const draft = getDraft();
  const treatment = draft.treatment || {};
  const initialResult = calculateRisk(draft);
  const showCompletion = treatment.previousTbTreatment === 'yes';

  const content = `
    ${appHeader('Langkah 4: Riwayat Pengobatan', 'Pengobatan TBC sebelumnya', { back: '/skrining/gejala' })}
    ${progressBar(80, 'Riwayat pengobatan')}
    <div class="mobile-content screening-content">
      <form id="treatmentForm" novalidate>
        <section class="paper-section" data-field-group>
          <h2 class="paper-section-title">Riwayat Pengobatan TBC</h2>
          <p class="paper-section-description">
            Jika responden pernah minum obat TBC, pilih apakah pengobatan sebelumnya tuntas atau tidak tuntas.
          </p>
          ${yesNoGroup({ ...treatmentQuestions[0], label: `1. ${treatmentQuestions[0].label}` }, treatment.previousTbTreatment)}
          ${treatmentCompletionGroup(treatment.treatmentCompleted, !showCompletion)}
        </section>

        ${screeningPreviewMarkup(initialResult)}

        <div id="treatmentError" class="alert alert-danger d-none" role="alert">
          Mohon isi riwayat pengobatan. Jika menjawab Ya, pilih Tuntas atau Tidak tuntas.
        </div>
        <div class="form-actions">
          <button class="btn btn-outline-primary" type="button" data-nav="/skrining/gejala">Kembali</button>
          <button class="btn btn-primary" type="submit">Periksa Ringkasan</button>
        </div>
      </form>
    </div>
  `;

  return {
    html: mobileShell(content, 'skrining'),
    mount({ app, navigate }) {
      const form = app.querySelector('#treatmentForm');
      const answers = { ...treatment };

      const renderPreview = () => {
        const latestDraft = { ...getDraft(), treatment: answers };
        app.querySelector('#treatmentPreview').outerHTML = screeningPreviewMarkup(calculateRisk(latestDraft));
      };

      const syncCompletionVisibility = () => {
        const completion = app.querySelector('#treatmentCompletionWrap');
        const shouldShow = answers.previousTbTreatment === 'yes';
        completion.classList.toggle('d-none', !shouldShow);
        if (!shouldShow) {
          answers.treatmentCompleted = '';
          completion.querySelectorAll('.choice-btn').forEach((button) => {
            button.classList.remove('active-yes', 'active-no');
          });
        }
      };

      bindYesNoGroups(app, (field, value) => {
        answers[field] = value;
        if (field === 'previousTbTreatment') syncCompletionVisibility();
        updateDraftSection('treatment', {
          previousTbTreatment: answers.previousTbTreatment || '',
          treatmentCompleted: answers.treatmentCompleted || '',
        });
        renderPreview();
      });

      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const missing =
          !answers.previousTbTreatment ||
          (answers.previousTbTreatment === 'yes' && !answers.treatmentCompleted);
        app.querySelector('#treatmentError').classList.toggle('d-none', !missing);
        if (missing) return;
        updateDraftSection('treatment', {
          previousTbTreatment: answers.previousTbTreatment,
          treatmentCompleted: answers.previousTbTreatment === 'yes' ? answers.treatmentCompleted : '',
        });
        navigate('/skrining/ringkasan');
      });
    },
  };
}
