import { cadres } from '../data/mock-data.js';
import {
  emptyDraft,
  getCurrentUser,
  getCurrentWargaProfile,
  getDraft,
  saveDraft,
  updateDraftSection,
} from '../modules/storage.js';
import {
  appHeader,
  escapeHtml,
  formDataObject,
  mobileShell,
  progressBar,
  speakerButton,
} from '../modules/screening.js';

function fieldLabel(fieldId, label, required = false) {
  return `
    <div class="form-label-row">
      <label class="form-label" for="${fieldId}">${label}${required ? ' <span class="required">*</span>' : ''}</label>
      ${speakerButton(label, { ariaLabel: `Dengarkan isian ${label}` })}
    </div>
  `;
}

export function citizenFormView() {
  const currentUser = getCurrentUser();
  const isSelfScreening = currentUser?.role === 'warga';
  const wargaProfile = getCurrentWargaProfile(currentUser);
  const storedDraft = getDraft();
  const draft =
    isSelfScreening && storedDraft.ownerUserId !== currentUser.id
      ? {
          ...emptyDraft(),
          ownerUserId: currentUser.id,
          createdByUserId: currentUser.id,
          citizen: {
            ...emptyDraft().citizen,
            name: wargaProfile?.name || currentUser.name || '',
            age: wargaProfile?.age || currentUser.age || '',
            nik: wargaProfile?.nik || currentUser.nik || '',
            gender: wargaProfile?.gender || currentUser.gender || '',
            address: wargaProfile?.address || wargaProfile?.region || currentUser.address || '',
            region: wargaProfile?.region || wargaProfile?.address || currentUser.region || '',
            phone: wargaProfile?.phone || currentUser.phone || '',
            cadreName: wargaProfile?.cadreName || currentUser.cadreName || 'Kader Asep',
          },
        }
      : storedDraft;
  const citizen = draft.citizen;
  const address = citizen.address || citizen.region || '';
  const backRoute = isSelfScreening ? '/warga' : '/kader';
  const title = isSelfScreening ? 'Skrining Mandiri' : 'Langkah 1: Data Warga';
  const subtitle = isSelfScreening ? 'Data diri diambil dari akun warga' : 'Pencatatan awal skrining';
  const fixedProfile = {
    name: wargaProfile?.name || citizen.name || '',
    age: wargaProfile?.age || citizen.age || '',
    nik: wargaProfile?.nik || citizen.nik || '',
    gender: wargaProfile?.gender || citizen.gender || '',
    address: wargaProfile?.address || wargaProfile?.region || address,
    cadreName: wargaProfile?.cadreName || citizen.cadreName || 'Kader Asep',
  };

  const content = `
    ${appHeader(title, subtitle, { back: backRoute })}
    ${progressBar(20, 'Data warga')}
    <div class="mobile-content screening-content">
      <form id="citizenForm" class="needs-validation" novalidate>
        <div class="soft-card paper-form mb-3">
          <div class="section-heading-action">
            <h2 class="paper-section-title mb-0">Identitas Pasien / Responden</h2>
            ${speakerButton('Identitas Pasien atau responden. Isi data warga yang akan diskrining.', {
              ariaLabel: 'Dengarkan bagian identitas pasien atau responden',
            })}
          </div>
          <div class="mb-3">
            ${fieldLabel('name', 'Nama', true)}
            <input class="form-control" id="name" name="name" value="${escapeHtml(fixedProfile.name)}" placeholder="Nama lengkap atau inisial" ${isSelfScreening ? 'readonly' : ''} required />
            <div class="invalid-feedback">Nama wajib diisi.</div>
          </div>
          <div class="row g-3">
            <div class="col-6">
              ${fieldLabel('age', 'Umur', true)}
              <input class="form-control" id="age" name="age" type="number" min="0" max="120" value="${escapeHtml(fixedProfile.age)}" placeholder="Tahun" ${isSelfScreening ? 'readonly' : ''} required />
              <div class="invalid-feedback">Umur wajib diisi.</div>
            </div>
            <div class="col-6">
              ${fieldLabel('birthDate', 'Tanggal lahir')}
              <input class="form-control" id="birthDate" name="birthDate" type="date" value="${escapeHtml(citizen.birthDate || '')}" />
            </div>
          </div>
          <div class="mt-3">
            ${fieldLabel('nik', 'NIK')}
            <input class="form-control" id="nik" name="nik" inputmode="numeric" maxlength="16" value="${escapeHtml(fixedProfile.nik || '')}" placeholder="16 digit bila tersedia" ${isSelfScreening ? 'readonly' : ''} />
          </div>
          <div class="mt-3">
            ${fieldLabel('gender', 'Jenis kelamin', true)}
            ${
              isSelfScreening
                ? `<input class="form-control" id="gender" name="gender" value="${escapeHtml(fixedProfile.gender)}" readonly required />`
                : `<select class="form-select" id="gender" name="gender" required>
                    <option value="">Pilih</option>
                    <option ${citizen.gender === 'Laki-laki' ? 'selected' : ''}>Laki-laki</option>
                    <option ${citizen.gender === 'Perempuan' ? 'selected' : ''}>Perempuan</option>
                  </select>`
            }
            <div class="invalid-feedback">Jenis kelamin wajib dipilih.</div>
          </div>
          <div class="mt-3">
            ${fieldLabel('address', 'Alamat', true)}
            <textarea class="form-control" id="address" name="address" rows="3" placeholder="Kampung, RT/RW, desa/kecamatan" ${isSelfScreening ? 'readonly' : ''} required>${escapeHtml(fixedProfile.address)}</textarea>
            <div class="invalid-feedback">Alamat wajib diisi.</div>
          </div>
          <div class="row g-3 mt-1">
            <div class="col-12">
              ${fieldLabel('screeningDate', 'Tanggal pemeriksaan', true)}
              <input class="form-control" id="screeningDate" name="screeningDate" type="date" value="${escapeHtml(citizen.screeningDate)}" required />
              <div class="invalid-feedback">Tanggal pemeriksaan wajib diisi.</div>
            </div>
          </div>
          <div class="mt-3">
            ${fieldLabel('cadreName', 'Nama petugas skrining', true)}
            ${
              isSelfScreening
                ? `<input class="form-control" id="cadreName" name="cadreName" value="${escapeHtml(fixedProfile.cadreName)}" readonly required />`
                : `<select class="form-select" id="cadreName" name="cadreName" required>
                    ${cadres
                      .map((cadre) => `<option ${citizen.cadreName === cadre.name ? 'selected' : ''}>${cadre.name}</option>`)
                      .join('')}
                  </select>`
            }
            <div class="invalid-feedback">Nama petugas wajib diisi.</div>
          </div>
        </div>

        <div class="form-actions">
          <button class="btn btn-outline-primary" type="button" data-nav="${backRoute}">Kembali</button>
          <button class="btn btn-primary" type="submit">Lanjut ke Kondisi Fisik</button>
        </div>
      </form>
    </div>
  `;

  return {
    html: mobileShell(content, 'skrining'),
    mount({ app, navigate }) {
      const form = app.querySelector('#citizenForm');
      const ageInput = app.querySelector('#age');
      const birthDateInput = app.querySelector('#birthDate');

      if (isSelfScreening) {
        saveDraft(draft);
      }

      birthDateInput.addEventListener('change', () => {
        if (!birthDateInput.value) return;
        const birthDate = new Date(`${birthDateInput.value}T00:00:00`);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age -= 1;
        }
        if (Number.isFinite(age) && age >= 0) ageInput.value = String(age);
      });

      form.addEventListener('submit', (event) => {
        event.preventDefault();
        form.classList.add('was-validated');
        if (!form.checkValidity()) return;
        const data = formDataObject(form);
        if (isSelfScreening) {
          const latestDraft = getDraft();
          latestDraft.ownerUserId = currentUser.id;
          latestDraft.createdByUserId = currentUser.id;
          latestDraft.citizen = {
            ...(latestDraft.citizen || {}),
            ...data,
            name: fixedProfile.name,
            age: fixedProfile.age,
            nik: fixedProfile.nik,
            gender: fixedProfile.gender,
            address: fixedProfile.address,
            region: fixedProfile.address,
            cadreName: fixedProfile.cadreName,
          };
          saveDraft(latestDraft);
        } else {
          updateDraftSection('citizen', { ...data, region: data.address });
        }
        navigate('/skrining/kondisi-fisik');
      });
    },
  };
}
