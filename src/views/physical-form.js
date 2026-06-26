import { riskFactorQuestions } from '../data/screening-rules.js';
import { getDraft, updateDraftSection } from '../modules/storage.js';
import {
  appHeader,
  bindYesNoGroups,
  escapeHtml,
  formDataObject,
  mobileShell,
  progressBar,
  speakerButton,
  yesNoGroup,
} from '../modules/screening.js';

const NUTRITION_CATEGORIES = [
  { max: 16.9, label: 'Kurus (Berat)', tone: 'danger' },
  { max: 18.4, label: 'Kurus (Ringan)', tone: 'warning' },
  { max: 25, label: 'Normal', tone: 'success' },
  { max: 27, label: 'Overweight (Kelebihan Berat Badan Ringan)', tone: 'warning' },
  { max: Infinity, label: 'Obesitas (Kelebihan Berat Badan Berat)', tone: 'danger' },
];

function numberValue(value) {
  const normalized = String(value || '').replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function calculateNutritionStatus({ age, weight, height }) {
  const ageNumber = numberValue(age);
  const weightNumber = numberValue(weight);
  const heightNumber = numberValue(height);

  if (ageNumber <= 0 || weightNumber <= 0 || heightNumber <= 0) return null;

  const heightMeters = heightNumber / 100;
  const bmi = weightNumber / heightMeters ** 2;
  const roundedBmi = Math.round(bmi * 10) / 10;
  const category = NUTRITION_CATEGORIES.find((item) => roundedBmi <= item.max);

  return {
    age: ageNumber,
    bmi: roundedBmi.toFixed(1),
    status: category.label,
    tone: category.tone,
  };
}

function fieldLabel(fieldId, label, required = false) {
  return `
    <div class="form-label-row">
      <label class="form-label" for="${fieldId}">${label}${required ? ' <span class="required">*</span>' : ''}</label>
      ${speakerButton(label, { ariaLabel: `Dengarkan isian ${label}` })}
    </div>
  `;
}

function nutritionStatusMarkup(nutrition, age) {
  if (!nutrition) {
    const hasAge = numberValue(age) > 0;
    const title = 'Status gizi otomatis';
    const message = hasAge
      ? 'Lengkapi berat dan tinggi badan. Masukkan berat badan dan tinggi badan untuk menghitung IMT.'
      : 'Usia belum tersedia. Kembali ke Langkah 1 untuk mengisi usia warga.';
    return `
      <div class="nutrition-panel nutrition-panel--empty" id="nutritionPanel" aria-live="polite">
        <div class="nutrition-panel-header">
          <span class="nutrition-label">${title}</span>
          ${speakerButton(`${title}. ${message}`, { ariaLabel: 'Dengarkan status gizi otomatis' })}
        </div>
        <strong>${hasAge ? 'Lengkapi berat dan tinggi badan' : 'Usia belum tersedia'}</strong>
        <p>${hasAge ? 'Masukkan berat badan dan tinggi badan untuk menghitung IMT.' : 'Kembali ke Langkah 1 untuk mengisi usia warga.'}</p>
      </div>
    `;
  }

  return `
    <div class="nutrition-panel nutrition-panel--${nutrition.tone}" id="nutritionPanel" aria-live="polite">
      <div class="nutrition-panel-header">
        <span class="nutrition-label">Status gizi otomatis</span>
        ${speakerButton(
          `Status gizi otomatis. ${nutrition.status}. Usia ${nutrition.age} tahun. IMT ${nutrition.bmi}.`,
          { ariaLabel: 'Dengarkan status gizi otomatis' },
        )}
      </div>
      <strong>${escapeHtml(nutrition.status)}</strong>
      <dl>
        <div><dt>Usia</dt><dd>${escapeHtml(nutrition.age)} tahun</dd></div>
        <div><dt>IMT</dt><dd>${escapeHtml(nutrition.bmi)}</dd></div>
      </dl>
    </div>
  `;
}

export function physicalFormView() {
  const draft = getDraft();
  const physical = draft.physical || {};
  const physicalAnswers = { ...physical };
  const citizen = draft.citizen || {};
  const nutrition = calculateNutritionStatus({
    age: citizen.age,
    weight: physical.weight,
    height: physical.height,
  });

  const content = `
    ${appHeader('Langkah 2: Kondisi Fisik', 'Informasi fisik dasar', { back: '/skrining/data-warga' })}
    ${progressBar(40, 'Kondisi fisik')}
    <div class="mobile-content screening-content">
      <form id="physicalForm" novalidate>
        <div class="soft-card mb-3">
          <div class="section-heading-action">
            <h2 class="paper-section-title mb-0">Pengukuran Fisik</h2>
            ${speakerButton('Pengukuran fisik. Isi berat badan dan tinggi badan responden.', {
              ariaLabel: 'Dengarkan bagian pengukuran fisik',
            })}
          </div>
          <div class="row g-3">
            <div class="col-6">
              ${fieldLabel('weight', 'Berat badan', true)}
              <input class="form-control" id="weight" name="weight" type="number" min="1" step="0.1" inputmode="decimal" value="${physical.weight || ''}" placeholder="kg" required />
              <div class="invalid-feedback">Berat badan wajib diisi.</div>
            </div>
            <div class="col-6">
              ${fieldLabel('height', 'Tinggi badan', true)}
              <input class="form-control" id="height" name="height" type="number" min="1" step="0.1" inputmode="decimal" value="${physical.height || ''}" placeholder="cm" required />
              <div class="invalid-feedback">Tinggi badan wajib diisi.</div>
            </div>
          </div>
          <div class="small muted mt-2">IMT dihitung otomatis dari usia, berat badan, dan tinggi badan.</div>
          ${nutritionStatusMarkup(nutrition, citizen.age)}
        </div>

        <section class="paper-section" id="physicalQuestions" data-field-group>
          <h2 class="paper-section-title">Penyakit Lain / Faktor Risiko</h2>
          <p class="paper-section-description">Pilih Ya atau Tidak untuk setiap kondisi berikut.</p>
          ${riskFactorQuestions
            .map((question, index) =>
              yesNoGroup({ ...question, label: `${index + 1}. ${question.label}` }, physicalAnswers[question.id]),
            )
            .join('')}
        </section>
        <div id="physicalError" class="alert alert-danger d-none" role="alert">
          Mohon pilih Ya atau Tidak untuk setiap penyakit lain / faktor risiko.
        </div>
        <div id="nutritionError" class="alert alert-danger d-none" role="alert">
          Mohon lengkapi usia, berat badan, dan tinggi badan agar status gizi dapat dihitung.
        </div>

        <div class="form-actions">
          <button class="btn btn-outline-primary" type="button" data-nav="/skrining/data-warga">Kembali</button>
          <button class="btn btn-primary" type="submit">Lanjut ke Gejala Klinis</button>
        </div>
      </form>
    </div>
  `;

  return {
    html: mobileShell(content, 'skrining'),
    mount({ app, navigate }) {
      const form = app.querySelector('#physicalForm');
      const weightInput = app.querySelector('#weight');
      const heightInput = app.querySelector('#height');
      const nutritionError = app.querySelector('#nutritionError');
      const answers = { ...physical };

      const renderNutritionStatus = () => {
        const latestNutrition = calculateNutritionStatus({
          age: citizen.age,
          weight: weightInput.value,
          height: heightInput.value,
        });
        app.querySelector('#nutritionPanel').outerHTML = nutritionStatusMarkup(latestNutrition, citizen.age);
        return latestNutrition;
      };

      const savePhysicalMeasurements = (showError = false) => {
        const latestNutrition = renderNutritionStatus();
        updateDraftSection('physical', {
          weight: weightInput.value,
          height: heightInput.value,
          bmi: latestNutrition?.bmi || '',
          nutritionStatus: latestNutrition?.status || '',
        });
        nutritionError.classList.toggle('d-none', !showError || !!latestNutrition);
        return latestNutrition;
      };

      [weightInput, heightInput].forEach((input) => {
        input.addEventListener('input', () => savePhysicalMeasurements(false));
      });

      bindYesNoGroups(app, (field, value) => {
        answers[field] = value;
        updateDraftSection('physical', { [field]: value });
      });

      form.addEventListener('submit', (event) => {
        event.preventDefault();
        form.classList.add('was-validated');
        const missing = riskFactorQuestions.some((question) => !answers[question.id]);
        app.querySelector('#physicalError').classList.toggle('d-none', !missing);
        const latestNutrition = savePhysicalMeasurements(true);
        if (!form.checkValidity() || missing || !latestNutrition) return;
        updateDraftSection('physical', {
          ...answers,
          ...formDataObject(form),
          bmi: latestNutrition.bmi,
          nutritionStatus: latestNutrition.status,
        });
        navigate('/skrining/gejala');
      });
    },
  };
}
