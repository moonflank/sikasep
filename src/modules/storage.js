import { referralRecords, screeningRecords, wargaUsers } from '../data/mock-data.js';

const STORAGE_KEYS = {
  draft: 'sobatBaduy:draft',
  records: 'sobatBaduy:records',
  referrals: 'sobatBaduy:referrals',
  user: 'sobatBaduy:user',
  lastResult: 'sobatBaduy:lastResult',
  medications: 'sobatBaduy:medications',
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function normalizeResult(result) {
  if (result === 'low') return 'negative';
  if (result === 'monitor' || result === 'follow-up' || result === 'followUp') return 'positive';
  return result || 'negative';
}

function defaultReason(result) {
  return result === 'positive'
    ? 'Positif karena terdapat gejala atau riwayat yang memenuhi kriteria skrining TBC.'
    : 'Negatif karena belum ada gejala yang memenuhi kriteria skrining gejala TBC positif.';
}

function defaultRecommendation(result) {
  return result === 'positive'
    ? 'Rujuk untuk pemeriksaan lanjutan sesuai alur layanan kesehatan.'
    : 'Edukasi pencegahan TBC dan anjurkan skrining ulang bila muncul gejala.';
}

function normalizedText(value = '') {
  return String(value || '').trim().toLowerCase();
}

function wargaByNik(nik = '') {
  const normalizedNik = String(nik || '').trim();
  if (!normalizedNik || normalizedNik === '-') return null;
  return wargaUsers.find((warga) => warga.nik === normalizedNik) || null;
}

function wargaForRecord(record = {}) {
  const byNik = wargaByNik(record.nik);
  if (byNik) return byNik;

  const name = normalizedText(record.patientName || record.name);
  const address = normalizedText(record.address || record.region);
  const initials = normalizedText(record.initials);
  if (!address) return null;

  return (
    wargaUsers.find(
      (warga) =>
        normalizedText(warga.address || warga.region) === address &&
        (normalizedText(warga.name) === name ||
          (initials &&
            (normalizedText(makeInitials(warga.name)) === initials ||
              normalizedText(String(warga.name).split(/\s+/).pop()) === initials))),
    ) || null
  );
}

function normalizeRecord(record = {}) {
  const result = normalizeResult(record.result);
  const address = record.address || record.region || '-';
  const age = Number(record.age || 0);
  const profile = wargaForRecord(record);

  return {
    ...record,
    ownerUserId: record.ownerUserId || record.userId || profile?.id || '',
    patientName: record.patientName || profile?.name || `Warga Contoh ${record.initials || ''}`.trim(),
    nik: record.nik && record.nik !== '-' ? record.nik : profile?.nik || record.nik || '-',
    address,
    region: address,
    result,
    respondentCategory: record.respondentCategory || (age > 0 && age < 15 ? 'Anak' : 'Dewasa'),
    screeningStatus: record.screeningStatus || (result === 'positive' ? 'Positif' : 'Negatif'),
    reasonSummary: record.reasonSummary || defaultReason(result),
    recommendation: record.recommendation || defaultRecommendation(result),
    previousTbTreatment: record.previousTbTreatment || 'no',
    treatmentCompleted: record.treatmentCompleted || '',
    treatmentStatusLabel: record.treatmentStatusLabel || 'Tidak ada riwayat',
  };
}

function normalizeMedicationRecord(record = {}) {
  const createdAt = record.created_at || new Date().toISOString();
  const reportedAt = record.reported_at || record.updated_at || createdAt;
  const createdDate = String(createdAt).slice(0, 10);
  const updatedDate = String(reportedAt).slice(0, 10);
  const isLate =
    Boolean(record.reported_late) ||
    (record.tanggal && ((createdDate && createdDate > record.tanggal) || (updatedDate && updatedDate > record.tanggal)));

  return {
    id: record.id || `OB-${Date.now()}`,
    userId: record.userId || record.warga || record.warga_id || '',
    tanggal: record.tanggal || today(),
    status_minum_obat: record.status_minum_obat === 'belum' ? 'belum' : 'sudah',
    jam_minum_obat: record.jam_minum_obat || '',
    catatan: record.catatan || '',
    inputBy: record.inputBy || record.userId || '',
    reported_late: isLate,
    reported_at: reportedAt,
    created_at: createdAt,
    updated_at: record.updated_at || createdAt,
  };
}

function defaultMedicationRecords() {
  const currentDate = today();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const previousDate = yesterday.toISOString().slice(0, 10);

  return [
    {
      id: `OB-${currentDate}-warga01`,
      userId: 'warga01',
      tanggal: currentDate,
      status_minum_obat: 'sudah',
      jam_minum_obat: '07:15',
      catatan: 'Minum setelah sarapan.',
      inputBy: 'warga01',
      created_at: `${currentDate}T00:30:00.000Z`,
      updated_at: `${currentDate}T00:30:00.000Z`,
    },
    {
      id: `OB-${currentDate}-warga02`,
      userId: 'warga02',
      tanggal: currentDate,
      status_minum_obat: 'belum',
      jam_minum_obat: '',
      catatan: 'Menunggu jadwal malam.',
      inputBy: 'warga02',
      created_at: `${currentDate}T02:00:00.000Z`,
      updated_at: `${currentDate}T02:00:00.000Z`,
    },
    {
      id: `OB-${previousDate}-warga01`,
      userId: 'warga01',
      tanggal: previousDate,
      status_minum_obat: 'sudah',
      jam_minum_obat: '07:10',
      catatan: '',
      inputBy: 'warga01',
      created_at: `${previousDate}T00:20:00.000Z`,
      updated_at: `${previousDate}T00:20:00.000Z`,
    },
  ].map(normalizeMedicationRecord);
}

function uniqueBy(items, getKey) {
  const seen = new Set();
  return items.filter((item) => {
    const key = getKey(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function daysAgo(days = 0) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

export function emptyDraft() {
  return {
    ownerUserId: '',
    createdByUserId: '',
    citizen: {
      name: '',
      age: '',
      birthDate: '',
      nik: '',
      gender: '',
      address: '',
      region: '',
      householdSize: '',
      phone: '',
      cadreName: 'Kader Asep',
      screeningDate: today(),
    },
    physical: {
      weight: '',
      height: '',
      bmi: '',
      nutritionStatus: '',
      diabetes: '',
      kidneyDisease: '',
      hiv: '',
      corticosteroid: '',
    },
    symptoms: {},
    treatment: {
      previousTbTreatment: '',
      treatmentCompleted: '',
    },
    environment: {
      ventilationType: '',
    },
    consent: false,
  };
}

export function getDraft() {
  const draft = read(STORAGE_KEYS.draft, emptyDraft());
  const treatment = {
    ...emptyDraft().treatment,
    ...(draft.treatment || {}),
  };
  if (!treatment.previousTbTreatment && draft.symptoms?.previousTbTreatment) {
    treatment.previousTbTreatment = draft.symptoms.previousTbTreatment;
  }

  return {
    ...emptyDraft(),
    ...draft,
    citizen: { ...emptyDraft().citizen, ...(draft.citizen || {}) },
    physical: { ...emptyDraft().physical, ...(draft.physical || {}) },
    symptoms: { ...(draft.symptoms || {}) },
    treatment,
    environment: { ...emptyDraft().environment, ...(draft.environment || {}) },
  };
}

export function saveDraft(draft) {
  write(STORAGE_KEYS.draft, draft);
}

export function updateDraftSection(section, data) {
  const draft = getDraft();
  draft[section] = { ...(draft[section] || {}), ...data };
  saveDraft(draft);
  return draft;
}

export function clearDraft() {
  localStorage.removeItem(STORAGE_KEYS.draft);
}

export function getScreeningRecords() {
  const existing = read(STORAGE_KEYS.records, null);
  if (Array.isArray(existing) && existing.length) return existing.map(normalizeRecord);
  const normalizedRecords = clone(screeningRecords).map(normalizeRecord);
  write(STORAGE_KEYS.records, normalizedRecords);
  return normalizedRecords;
}

export function saveScreeningRecords(records) {
  write(STORAGE_KEYS.records, records.map(normalizeRecord));
}

export function addScreeningRecord(record) {
  const records = getScreeningRecords();
  records.unshift(normalizeRecord(record));
  saveScreeningRecords(records);
}

export function getAccessibleScreeningRecords(user = getCurrentUser()) {
  const records = getScreeningRecords();
  if (!user) return [];
  if (user.role === 'warga') {
    const accessibleRecords = records.filter(
      (record) =>
        record.ownerUserId === user.id ||
        record.userId === user.id ||
        (user.nik && record.nik === user.nik),
    );
    if (accessibleRecords.length) return accessibleRecords;

    return clone(screeningRecords)
      .map(normalizeRecord)
      .filter((record) => record.ownerUserId === user.id || (user.nik && record.nik === user.nik));
  }
  return records;
}

export function markAllRecordsSynced() {
  const records = getScreeningRecords().map((record) => ({ ...record, syncStatus: 'synced' }));
  saveScreeningRecords(records);
  return records;
}

export function getReferralRecords() {
  const existing = read(STORAGE_KEYS.referrals, null);
  if (existing) return existing;
  write(STORAGE_KEYS.referrals, referralRecords);
  return clone(referralRecords);
}

export function addReferralRecord(record) {
  const records = getReferralRecords();
  records.unshift(record);
  write(STORAGE_KEYS.referrals, records);
  return records;
}

export function setCurrentUser(user) {
  if (!user) {
    localStorage.removeItem(STORAGE_KEYS.user);
    return;
  }
  write(STORAGE_KEYS.user, user);
}

export function getCurrentUser() {
  return read(STORAGE_KEYS.user, null);
}

export function getHomeRoute(user = getCurrentUser()) {
  if (!user) return '/login';
  if (user.role === 'warga') return '/warga';
  if (user.role === 'admin') return '/admin';
  return '/kader';
}

export function getWargaProfile(userId) {
  return wargaUsers.find((warga) => warga.id === userId) || null;
}

export function getCurrentWargaProfile(user = getCurrentUser()) {
  if (!user || user.role !== 'warga') return null;
  return getWargaProfile(user.id) || {
    id: user.id,
    name: user.name,
    nik: user.nik || '',
    age: user.age || '',
    gender: user.gender || '',
    address: user.address || user.region || '',
    region: user.region || user.address || '',
    phone: user.phone || '',
    cadreId: user.cadreId || '',
    cadreName: user.cadreName || 'Kader Asep',
  };
}

export function getCitizenProfiles(user = getCurrentUser()) {
  const seededProfiles = wargaUsers.map((warga) => ({ ...warga }));
  const recordProfiles = getScreeningRecords().map((record) => ({
    id: record.ownerUserId || `nik-${record.nik}`,
    name: record.patientName || record.initials,
    nik: record.nik || '',
    age: record.age || '',
    gender: record.gender || '',
    address: record.address || record.region || '',
    region: record.region || record.address || '',
    cadreName: record.cadre || '',
  }));
  const profiles = uniqueBy(
    [...seededProfiles, ...recordProfiles],
    (profile) =>
      profile.nik ||
      `${profile.name || ''}-${profile.address || profile.region || ''}`.toLowerCase() ||
      profile.id,
  );

  if (user?.role === 'warga') {
    return profiles.filter((profile) => profile.id === user.id || (user.nik && profile.nik === user.nik));
  }

  return profiles;
}

export function setLastResult(result) {
  write(STORAGE_KEYS.lastResult, result);
}

export function getLastResult() {
  return read(STORAGE_KEYS.lastResult, null);
}

export function makeInitials(name = '') {
  const cleaned = String(name).trim();
  if (!cleaned) return 'WW';
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function makeLocalRecord(draft, risk) {
  const currentUser = getCurrentUser();
  const date = draft.citizen?.screeningDate || today();
  const address = draft.citizen?.address || draft.citizen?.region || '-';
  const previousTbTreatment = draft.treatment?.previousTbTreatment || draft.symptoms?.previousTbTreatment || '';
  const treatmentCompleted = previousTbTreatment === 'yes' ? draft.treatment?.treatmentCompleted || '' : '';
  const ownerUserId =
    draft.ownerUserId ||
    (currentUser?.role === 'warga' ? currentUser.id : '') ||
    wargaByNik(draft.citizen?.nik)?.id ||
    '';
  return {
    id: `SB-${Date.now().toString().slice(-6)}`,
    ownerUserId,
    createdByUserId: currentUser?.id || '',
    createdByRole: currentUser?.role || 'kader',
    selfScreening: currentUser?.role === 'warga',
    date,
    initials: makeInitials(draft.citizen?.name),
    patientName: draft.citizen?.name || '-',
    nik: draft.citizen?.nik || '-',
    age: Number(draft.citizen?.age || 0),
    birthDate: draft.citizen?.birthDate || '',
    gender: draft.citizen?.gender || '-',
    address,
    region: address,
    cadre: draft.citizen?.cadreName || 'Kader Asep',
    result: risk.level === 'followUp' ? 'follow-up' : risk.level,
    respondentCategory: risk.respondentCategory || '-',
    screeningStatus: risk.status || '-',
    reasonSummary: risk.reasonSummary || '',
    recommendation: risk.recommendation || '',
    weight: draft.physical?.weight || '',
    height: draft.physical?.height || '',
    bmi: draft.physical?.bmi || '',
    nutritionStatus: draft.physical?.nutritionStatus || '',
    previousTbTreatment,
    treatmentCompleted,
    treatmentStatusLabel:
      previousTbTreatment === 'yes'
        ? treatmentCompleted === 'yes'
          ? 'Tuntas'
          : treatmentCompleted === 'no'
            ? 'Tidak tuntas'
            : 'Belum diisi'
        : 'Tidak ada riwayat',
    syncStatus: navigator.onLine ? 'synced' : 'pending',
    factors: risk.factors?.length ? risk.factors : ['Edukasi pencegahan TBC'],
  };
}

export function getMedicationRecords() {
  const existing = read(STORAGE_KEYS.medications, null);
  if (existing) return existing.map(normalizeMedicationRecord);
  const records = defaultMedicationRecords();
  write(STORAGE_KEYS.medications, records);
  return records;
}

export function saveMedicationRecords(records) {
  write(STORAGE_KEYS.medications, records.map(normalizeMedicationRecord));
}

export function getMedicationForUserDate(userId, tanggal = today()) {
  return getMedicationRecords().find((record) => record.userId === userId && record.tanggal === tanggal) || null;
}

export function getMedicationHistoryForUser(userId) {
  return getMedicationRecords()
    .filter((record) => record.userId === userId)
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal) || b.updated_at.localeCompare(a.updated_at));
}

export function isLateMedication(record) {
  if (!record) return false;
  return Boolean(normalizeMedicationRecord(record).reported_late);
}

export function upsertMedicationRecord(data) {
  const userId = data.userId || getCurrentUser()?.id;
  const tanggal = data.tanggal || today();
  const status = data.status_minum_obat;

  if (!userId) {
    throw new Error('Pengguna wajib tersedia.');
  }

  if (!tanggal) {
    throw new Error('Tanggal wajib diisi.');
  }

  if (tanggal > today()) {
    throw new Error('Tanggal laporan tidak boleh melebihi hari ini.');
  }

  if (tanggal < daysAgo(7)) {
    throw new Error('Laporan terlambat hanya dapat diisi sampai 7 hari ke belakang.');
  }

  if (!['sudah', 'belum'].includes(status)) {
    throw new Error('Status minum obat wajib dipilih.');
  }

  const records = getMedicationRecords();
  const index = records.findIndex((record) => record.userId === userId && record.tanggal === tanggal);
  const now = new Date().toISOString();
  const nextRecord = normalizeMedicationRecord({
    ...(index >= 0 ? records[index] : {}),
    id: index >= 0 ? records[index].id : `OB-${tanggal}-${userId}`,
    userId,
    tanggal,
    status_minum_obat: status,
    jam_minum_obat: data.jam_minum_obat || '',
    catatan: data.catatan || '',
    inputBy: data.inputBy || getCurrentUser()?.id || userId,
    reported_late: tanggal < today() || records[index]?.reported_late || false,
    reported_at: now,
    created_at: index >= 0 ? records[index].created_at : now,
    updated_at: now,
  });

  if (index >= 0) {
    records[index] = nextRecord;
  } else {
    records.unshift(nextRecord);
  }

  saveMedicationRecords(records);
  return nextRecord;
}

export function getMedicationOverview(tanggal = today(), user = getCurrentUser()) {
  return getCitizenProfiles(user).map((profile) => {
    const medication = getMedicationForUserDate(profile.id, tanggal);
    return {
      profile,
      medication,
      statusKey: medication?.status_minum_obat || 'belum-update',
    };
  });
}
