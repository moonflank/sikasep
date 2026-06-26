export const riskFactorQuestions = [
  {
    id: 'diabetes',
    label: 'Diabetes mellitus / kencing manis',
    factor: 'Diabetes mellitus / kencing manis',
  },
  {
    id: 'kidneyDisease',
    label: 'Penyakit ginjal',
    factor: 'Penyakit ginjal',
  },
  {
    id: 'hiv',
    label: 'HIV/AIDS',
    factor: 'HIV/AIDS',
  },
];

export const physicalQuestions = riskFactorQuestions;

export const symptomQuestions = [
  {
    id: 'coughTwoWeeks',
    label: 'Batuk lebih dari 2 minggu',
    factor: 'Batuk lebih dari 2 minggu',
  },
  {
    id: 'anyCough',
    label: 'Batuk berdahak',
    factor: 'Batuk berdahak',
  },
  {
    id: 'bloodCough',
    label: 'Batuk berdarah',
    factor: 'Batuk berdarah',
  },
  {
    id: 'feverOneMonth',
    label: 'Demam hilang timbul lebih dari 1 bulan',
    factor: 'Demam hilang timbul lebih dari 1 bulan',
  },
  {
    id: 'nightSweat',
    label: 'Keringat malam tanpa aktivitas',
    factor: 'Keringat malam tanpa aktivitas',
  },
  {
    id: 'weightLoss',
    label: 'Penurunan berat badan / nafsu makan turun tanpa sebab jelas',
    factor: 'Penurunan berat badan atau nafsu makan turun',
  },
  {
    id: 'lymphNode',
    label: 'Pembesaran kelenjar getah bening / benjolan di leher > 2 cm',
    factor: 'Pembesaran kelenjar getah bening / benjolan di leher',
  },
  {
    id: 'chestPain',
    label: 'Sesak napas dan nyeri dada',
    factor: 'Sesak napas dan nyeri dada',
  },
  {
    id: 'contactTb',
    label: 'Ada keluarga / tetangga yang pernah atau sedang dalam pengobatan TBC',
    factor: 'Riwayat kontak dengan pasien TBC',
  },
  {
    id: 'childMalaise',
    label: 'Lesu atau malaise / anak kurang aktif bermain',
    factor: 'Lesu atau anak kurang aktif bermain',
    childOnly: true,
  },
];

export const treatmentQuestions = [
  {
    id: 'previousTbTreatment',
    label: 'Pernah pengobatan TBC',
    factor: 'Riwayat minum obat TBC lebih dari 1 bulan',
  },
];

export const treatmentCompletionQuestion = {
  id: 'treatmentCompleted',
  label: 'Pengobatan TBC tuntas',
  completedFactor: 'Riwayat pengobatan TBC sebelumnya tuntas',
  incompleteFactor: 'Riwayat pengobatan TBC sebelumnya tidak tuntas',
};

export const environmentQuestions = [
  {
    id: 'poorVentilation',
    label: 'Apakah ventilasi rumah kurang baik?',
    factor: 'Ventilasi rumah perlu diperhatikan',
  },
  {
    id: 'crowdedHouse',
    label: 'Apakah hunian padat atau terasa sesak?',
    factor: 'Hunian padat',
  },
  {
    id: 'smokeExposure',
    label: 'Apakah terdapat paparan asap rokok di dalam rumah?',
    factor: 'Paparan asap rokok di rumah',
  },
  {
    id: 'householdContact',
    label: 'Apakah pernah tinggal serumah dengan pasien TBC?',
    factor: 'Riwayat tinggal serumah dengan pasien TBC',
  },
  {
    id: 'closeContact',
    label: 'Apakah pernah berinteraksi erat dengan pasien TBC?',
    factor: 'Riwayat kontak erat',
  },
  {
    id: 'accessDifficult',
    label: 'Apakah akses menuju fasilitas kesehatan cukup sulit?',
    factor: 'Akses fasilitas kesehatan sulit',
  },
];

export const resultCopy = {
  negative: {
    label: 'Skrining Gejala TBC Negatif',
    icon: 'bi-check-circle-fill',
    tone: 'success',
    text: 'Belum memenuhi kriteria skrining gejala TBC positif.',
    recommendation: 'Edukasi pencegahan TBC dan anjurkan skrining ulang bila muncul gejala.',
  },
  positive: {
    label: 'Skrining Gejala TBC Positif',
    icon: 'bi-exclamation-triangle-fill',
    tone: 'danger',
    text: 'Terdapat gejala atau kondisi yang memenuhi kriteria skrining gejala TBC positif.',
    recommendation: 'Rujuk untuk pemeriksaan lanjutan sesuai alur layanan kesehatan.',
  },
  low: {
    label: 'Risiko Rendah',
    icon: 'bi-check-circle-fill',
    tone: 'success',
    text: 'Belum terdapat tanda yang memerlukan tindak lanjut segera.',
    recommendation: 'Berikan edukasi mengenai pencegahan TBC dan lakukan pemantauan sesuai kebutuhan.',
  },
  monitor: {
    label: 'Perlu Pemantauan',
    icon: 'bi-info-circle-fill',
    tone: 'warning',
    text: 'Terdapat beberapa kondisi yang perlu dipantau lebih lanjut.',
    recommendation: 'Koordinasikan dengan petugas kesehatan apabila keluhan berlanjut atau bertambah.',
  },
  followUp: {
    label: 'Perlu Pemeriksaan Lebih Lanjut',
    icon: 'bi-exclamation-triangle-fill',
    tone: 'danger',
    text: 'Terdapat gejala atau faktor risiko yang memerlukan perhatian lebih lanjut.',
    recommendation:
      'Segera koordinasikan dengan petugas kesehatan atau Puskesmas Cisimeut untuk pemeriksaan lebih lanjut.',
  },
};

export const medicalDisclaimer =
  'Hasil skrining bukan diagnosis medis. Pemeriksaan lebih lanjut perlu dilakukan oleh tenaga kesehatan.';

function numberValue(value) {
  const parsed = Number(String(value || '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

function isYes(answers = {}, id) {
  return answers[id] === 'yes';
}

function labelFor(questionId) {
  const questions = [...symptomQuestions, ...treatmentQuestions];
  return questions.find((question) => question.id === questionId)?.factor || questionId;
}

function formatReasonList(items = []) {
  const uniqueItems = [...new Set(items.filter(Boolean))];
  if (!uniqueItems.length) return 'gejala sesuai kriteria skrining';
  if (uniqueItems.length === 1) return uniqueItems[0];
  if (uniqueItems.length === 2) return `${uniqueItems[0]} dan ${uniqueItems[1]}`;
  return `${uniqueItems.slice(0, -1).join(', ')}, dan ${uniqueItems.at(-1)}`;
}

export function respondentCategory(draft = {}) {
  if (draft.physical?.hiv === 'yes') return 'ODHIV';
  const age = numberValue(draft.citizen?.age);
  return age > 0 && age < 15 ? 'Anak' : 'Dewasa';
}

export function visibleSymptomQuestions(draft = {}) {
  const category = respondentCategory(draft);
  return symptomQuestions.filter((question) => !question.childOnly || category === 'Anak');
}

export function selectedFactors(questions = [], answers = {}) {
  return questions.filter((question) => answers[question.id] === 'yes').map((question) => question.factor);
}

export function calculateRisk(draft = {}) {
  const symptoms = draft.symptoms || {};
  const treatment = draft.treatment || {};
  const category = respondentCategory(draft);
  const hasAnyCough = isYes(symptoms, 'anyCough') || isYes(symptoms, 'coughTwoWeeks') || isYes(symptoms, 'bloodCough');
  const hasAdultAdditional =
    isYes(symptoms, 'weightLoss') ||
    isYes(symptoms, 'feverOneMonth') ||
    isYes(symptoms, 'nightSweat') ||
    isYes(symptoms, 'lymphNode');

  const adultPositive = isYes(symptoms, 'coughTwoWeeks') || (hasAnyCough && hasAdultAdditional);
  const childPositive =
    isYes(symptoms, 'coughTwoWeeks') ||
    isYes(symptoms, 'feverOneMonth') ||
    isYes(symptoms, 'weightLoss') ||
    isYes(symptoms, 'childMalaise');
  const odhivPositive =
    hasAnyCough ||
    isYes(symptoms, 'feverOneMonth') ||
    isYes(symptoms, 'weightLoss') ||
    isYes(symptoms, 'nightSweat') ||
    isYes(symptoms, 'lymphNode');

  const symptomPositive =
    category === 'ODHIV' ? odhivPositive : category === 'Anak' ? childPositive : adultPositive;
  const previousTbTreatment = treatment.previousTbTreatment || symptoms.previousTbTreatment || '';
  const incompleteTreatment = previousTbTreatment === 'yes' && treatment.treatmentCompleted === 'no';
  const positive = symptomPositive || incompleteTreatment;

  const determiningReasons = [];
  if (symptomPositive) {
    if (category === 'ODHIV') {
      if (hasAnyCough) determiningReasons.push(labelFor('anyCough'));
      ['feverOneMonth', 'weightLoss', 'nightSweat', 'lymphNode'].forEach((id) => {
        if (isYes(symptoms, id)) determiningReasons.push(labelFor(id));
      });
    } else if (category === 'Anak') {
      ['coughTwoWeeks', 'feverOneMonth', 'weightLoss', 'childMalaise'].forEach((id) => {
        if (isYes(symptoms, id)) determiningReasons.push(labelFor(id));
      });
    } else {
      if (isYes(symptoms, 'coughTwoWeeks')) determiningReasons.push(labelFor('coughTwoWeeks'));
      if (!isYes(symptoms, 'coughTwoWeeks') && hasAnyCough) determiningReasons.push(labelFor('anyCough'));
      ['weightLoss', 'feverOneMonth', 'nightSweat', 'lymphNode'].forEach((id) => {
        if (isYes(symptoms, id)) determiningReasons.push(labelFor(id));
      });
    }
  }

  if (positive && isYes(symptoms, 'contactTb')) {
    determiningReasons.push(labelFor('contactTb'));
  }

  if (incompleteTreatment) {
    determiningReasons.push(treatmentCompletionQuestion.incompleteFactor);
  }

  const level = positive ? 'positive' : 'negative';
  const copy = resultCopy[level];
  const reasonText = formatReasonList(determiningReasons);

  return {
    level,
    score: positive ? 1 : 0,
    label: copy.label,
    status: positive ? 'Positif' : 'Negatif',
    respondentCategory: category,
    reasonSummary: positive
      ? `Positif karena terdapat ${reasonText}.`
      : 'Negatif karena belum ada gejala yang memenuhi kriteria skrining gejala TBC positif.',
    recommendation: copy.recommendation,
    factors: positive ? [...new Set(determiningReasons)] : [],
  };
}
