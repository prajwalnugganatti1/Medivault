/**
 * MediVault - Doctor Controller
 * Handles Doctor Dashboard, Consent Authorization Gateway, QR Scanner Simulation, and Authorized Patient Chart View
 */

const DoctorController = {
  authorizedPatientSession: null,
  activeTab: 'timeline',

  init() {
    this.renderDashboard();
    this.renderActiveAuthorizedPatients();
  },

  // ----------------------------------------------------
  // Doctor Dashboard & Metrics
  // ----------------------------------------------------
  renderDashboard() {
    const doctor = window.mediStore.getCurrentDoctor();
    const grants = window.mediStore.getAccessGrants();
    const prescriptions = window.mediStore.getPrescriptions();

    // Doctor profile badges
    const docNameEl = document.getElementById('doctor-profile-name');
    const docSpecEl = document.getElementById('doctor-profile-spec');
    const docHospEl = document.getElementById('doctor-profile-hospital');
    const docRegEl = document.getElementById('doctor-profile-reg');

    if (docNameEl) docNameEl.innerText = doctor.name;
    if (docSpecEl) docSpecEl.innerText = `${doctor.qualification} • ${doctor.specialization}`;
    if (docHospEl) docHospEl.innerText = doctor.hospital;
    if (docRegEl) docRegEl.innerText = `Reg No: ${doctor.registrationNumber}`;

    // Metrics
    const activeGrants = grants.filter(g => {
      const isExpired = new Date() > new Date(g.expiresAt) || g.status === 'expired';
      return !isExpired && g.status !== 'revoked';
    });

    const statTotalPat = document.getElementById('stat-doc-total-patients');
    const statConsults = document.getElementById('stat-doc-today-consults');
    const statActiveAccess = document.getElementById('stat-doc-active-access');
    const statRecentRx = document.getElementById('stat-doc-recent-rx');

    if (statTotalPat) statTotalPat.innerText = '148';
    if (statConsults) statConsults.innerText = '6';
    if (statActiveAccess) statActiveAccess.innerText = activeGrants.length;
    if (statRecentRx) statRecentRx.innerText = prescriptions.length;
  },

  renderActiveAuthorizedPatients() {
    const grants = window.mediStore.getAccessGrants();
    const activeGrants = grants.filter(g => {
      const isExpired = new Date() > new Date(g.expiresAt) || g.status === 'expired';
      return !isExpired && g.status !== 'revoked';
    });

    const container = document.getElementById('authorized-patients-list');
    if (!container) return;

    if (activeGrants.length === 0) {
      container.innerHTML = `
        <div class="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <i data-lucide="shield-alert" class="w-10 h-10 text-amber-500 mx-auto mb-2"></i>
          <p class="text-xs font-bold text-slate-700">No active patient authorizations</p>
          <p class="text-[11px] text-slate-500 mt-0.5">Ask the patient to generate an access code or QR code from their MediVault.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    container.innerHTML = activeGrants.map(grant => {
      const patient = window.mediStore.getPatient();
      const expires = new Date(grant.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      return `
        <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-teal-300 transition flex items-center justify-between gap-4 mb-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">
              ${patient.bloodGroup}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h4 class="font-bold text-slate-900 text-sm">${grant.patientName}</h4>
                <span class="text-[10px] font-mono-code bg-teal-50 text-teal-700 px-2 py-0.5 rounded font-semibold">${grant.accessCode}</span>
              </div>
              <p class="text-xs text-slate-500">${grant.scope} • Valid until ${expires}</p>
            </div>
          </div>
          <button onclick="DoctorController.openPatientChart('${grant.accessCode}')" class="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition">
            <i data-lucide="folder-open" class="w-3.5 h-3.5"></i> Open Records
          </button>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  // ----------------------------------------------------
  // Patient Consent Authorization Gateway
  // ----------------------------------------------------
  handleAuthorizeAccess(event) {
    if (event) event.preventDefault();

    const codeInput = document.getElementById('gateway-access-code');
    const patIdInput = document.getElementById('gateway-patient-id');

    const code = codeInput ? codeInput.value.trim() : '';
    const patId = patIdInput ? patIdInput.value.trim() : '';

    if (!code) {
      window.MediVaultApp.showToast('Please enter the 6-character patient access code.', 'error');
      return;
    }

    const verification = window.mediStore.verifyDoctorAccess(code, patId);

    if (!verification.success) {
      window.MediVaultApp.showToast(verification.reason, 'error');
      this.showAccessDeniedModal(verification.reason);
      return;
    }

    // Success!
    this.authorizedPatientSession = verification;
    window.MediVaultApp.showToast(`Patient consent verified! Records unlocked.`, 'success');
    this.showPatientView(verification.patient, verification.grant);
  },

  // Quick Demo Access Helper for hackathon judges
  quickDemoAccess(code) {
    const codeInput = document.getElementById('gateway-access-code');
    const patIdInput = document.getElementById('gateway-patient-id');
    if (codeInput) codeInput.value = code;
    if (patIdInput) patIdInput.value = 'MV-88219';
    this.handleAuthorizeAccess();
  },

  // QR Code Scanner Simulation
  openQRScanner() {
    const modal = document.getElementById('doctor-qr-scanner-modal');
    if (modal) modal.classList.remove('hidden');
  },

  closeQRScanner() {
    const modal = document.getElementById('doctor-qr-scanner-modal');
    if (modal) modal.classList.add('hidden');
  },

  simulateQRScan(code = 'MV-9482') {
    this.closeQRScanner();
    window.MediVaultApp.showToast(`Scanned QR Token: ${code}`, 'info');
    const codeInput = document.getElementById('gateway-access-code');
    if (codeInput) codeInput.value = code;
    this.handleAuthorizeAccess();
  },

  showAccessDeniedModal(reason) {
    const deniedModal = document.getElementById('access-denied-modal');
    const reasonEl = document.getElementById('access-denied-reason');
    if (reasonEl) reasonEl.innerText = reason;
    if (deniedModal) deniedModal.classList.remove('hidden');
  },

  closeAccessDeniedModal() {
    const deniedModal = document.getElementById('access-denied-modal');
    if (deniedModal) deniedModal.classList.add('hidden');
  },

  openPatientChart(code) {
    const verification = window.mediStore.verifyDoctorAccess(code);
    if (verification.success) {
      this.authorizedPatientSession = verification;
      this.showPatientView(verification.patient, verification.grant);
    } else {
      window.MediVaultApp.showToast(verification.reason, 'error');
    }
  },

  // ----------------------------------------------------
  // Authorized Patient Chart View
  // ----------------------------------------------------
  showPatientView(patient, grant) {
    // Switch to doctor patient view tab
    window.MediVaultApp.switchDoctorSubView('doc-patient-view');

    // Populate Patient Demographics Header
    const nameEl = document.getElementById('doc-view-pat-name');
    const metaEl = document.getElementById('doc-view-pat-meta');
    const phoneEl = document.getElementById('doc-view-pat-phone');
    const emergEl = document.getElementById('doc-view-pat-emergency');
    const consentBanner = document.getElementById('doc-consent-banner');

    if (nameEl) nameEl.innerText = patient.fullName;
    if (metaEl) metaEl.innerText = `ID: ${patient.id} • ${patient.age} yrs • ${patient.gender} • Blood Group: ${patient.bloodGroup}`;
    if (phoneEl) phoneEl.innerText = patient.phone;
    if (emergEl) emergEl.innerText = `${patient.emergencyContact} (${patient.emergencyRelation}) • ${patient.emergencyPhone}`;

    if (consentBanner) {
      const expiresFormatted = new Date(grant.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      consentBanner.innerHTML = `
        <div class="flex items-center justify-between flex-wrap gap-2 text-xs">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500 pulse-active"></span>
            <span class="font-bold text-emerald-950">Patient Authorized Session Active</span>
            <span class="text-emerald-800">• Access Scope: <strong>${grant.scope}</strong></span>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-emerald-800 font-mono-code">Valid until: ${expiresFormatted}</span>
            <button onclick="DoctorController.endAuthorizedSession()" class="text-[11px] font-bold text-red-700 bg-red-100 hover:bg-red-200 px-2.5 py-1 rounded-md transition">
              Close Session
            </button>
          </div>
        </div>
      `;
    }

    // Critical Drug Allergies Warning Banner
    const allergiesContainer = document.getElementById('doc-view-allergies');
    if (allergiesContainer) {
      allergiesContainer.innerHTML = patient.allergies.map(a => `
        <span class="inline-flex items-center gap-1 bg-red-100 text-red-900 border border-red-300 font-bold px-2.5 py-1 rounded-lg text-xs">
          <i data-lucide="alert-triangle" class="w-3.5 h-3.5 text-red-600"></i> ${a}
        </span>
      `).join('');
    }

    // Existing Chronic Conditions
    const conditionsContainer = document.getElementById('doc-view-conditions');
    if (conditionsContainer) {
      conditionsContainer.innerHTML = patient.existingConditions.map(c => `
        <span class="bg-amber-50 text-amber-900 border border-amber-200 font-medium px-2.5 py-1 rounded-lg text-xs">
          ${c}
        </span>
      `).join('');
    }

    // Current Medications
    const medsContainer = document.getElementById('doc-view-meds');
    if (medsContainer) {
      medsContainer.innerHTML = patient.currentMedications.map(m => `
        <div class="bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs">
          <span class="font-bold text-slate-800 block">${m.name} ${m.dosage}</span>
          <span class="text-slate-500 text-[11px]">${m.frequency} (${m.timing}) for ${m.condition}</span>
        </div>
      `).join('');
    }

    // Render Sub-Tabs (Timeline, Reports, Past Rx)
    this.switchPatientChartTab('timeline');
    this.renderPatientReportsForDoctor();
    this.renderPatientPrescriptionsForDoctor();

    if (window.lucide) window.lucide.createIcons();
  },

  switchPatientChartTab(tabName) {
    this.activeTab = tabName;
    ['timeline', 'reports', 'rx', 'new-consultation'].forEach(t => {
      const panel = document.getElementById(`doc-tab-panel-${t}`);
      const btn = document.getElementById(`doc-tab-btn-${t}`);
      if (panel) {
        if (t === tabName) panel.classList.remove('hidden');
        else panel.classList.add('hidden');
      }
      if (btn) {
        if (t === tabName) {
          btn.classList.add('border-teal-600', 'text-teal-700', 'font-bold');
          btn.classList.remove('border-transparent', 'text-slate-500');
        } else {
          btn.classList.remove('border-teal-600', 'text-teal-700', 'font-bold');
          btn.classList.add('border-transparent', 'text-slate-500');
        }
      }
    });

    if (tabName === 'new-consultation' && window.PrescriptionEngine) {
      window.PrescriptionEngine.resetForm();
    }
  },

  renderPatientReportsForDoctor() {
    const records = window.mediStore.getRecords();
    const container = document.getElementById('doc-patient-reports-container');
    if (!container) return;

    container.innerHTML = records.map(rec => `
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between gap-4 mb-3">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${PatientController.getRecordTypeBadge(rec.type)}">${rec.type}</span>
            <span class="text-xs text-slate-400 font-mono-code">${rec.date}</span>
          </div>
          <h4 class="font-bold text-slate-900 text-sm">${rec.title}</h4>
          <p class="text-xs text-slate-500">${rec.hospital} • ${rec.doctor}</p>
          <p class="text-xs text-slate-600 mt-1 line-clamp-1">${rec.description}</p>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="PatientController.openRecordModal('${rec.id}')" class="px-3 py-1.5 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-lg text-xs font-semibold flex items-center gap-1">
            <i data-lucide="eye" class="w-3.5 h-3.5"></i> Inspect
          </button>
        </div>
      </div>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  renderPatientPrescriptionsForDoctor() {
    const prescriptions = window.mediStore.getPrescriptions();
    const container = document.getElementById('doc-patient-rx-container');
    if (!container) return;

    container.innerHTML = prescriptions.map(rx => `
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-3">
        <div class="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-teal-700 font-mono-code">${rx.id}</span>
              <span class="text-xs text-slate-400 font-mono-code">${rx.date}</span>
            </div>
            <h4 class="font-bold text-slate-900 text-sm">${rx.diagnosis}</h4>
            <p class="text-xs text-slate-500">By ${rx.doctorName} (${rx.hospital})</p>
          </div>
          <button onclick="PrescriptionEngine.openPreviewModal('${rx.id}')" class="px-3 py-1 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-lg text-xs font-semibold flex items-center gap-1">
            <i data-lucide="eye" class="w-3.5 h-3.5"></i> View Rx
          </button>
        </div>
        <div class="mt-2 text-xs text-slate-600">
          <strong>Medications:</strong> ${rx.medicines.map(m => `${m.name} (${m.dosage})`).join(', ')}
        </div>
      </div>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  endAuthorizedSession() {
    this.authorizedPatientSession = null;
    window.MediVaultApp.switchDoctorSubView('doc-dashboard-view');
    window.MediVaultApp.showToast('Authorized session closed.', 'info');
  }
};

window.DoctorController = DoctorController;
