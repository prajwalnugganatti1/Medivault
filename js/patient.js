/**
 * MediVault - Patient Controller
 * Handles Patient Dashboard, Records Management, Profile Editor, and Consent / Access Code Sharing
 */

const PatientController = {
  activeRecordFilter: 'all',
  activeSort: 'newest',
  searchTerm: '',

  init() {
    this.renderDashboard();
    this.renderRecords();
    this.renderAccessHistory();
    this.renderProfile();
    this.renderTimeline();
  },

  // ----------------------------------------------------
  // Dashboard Rendering & Metrics
  // ----------------------------------------------------
  renderDashboard() {
    const patient = window.mediStore.getPatient();
    const records = window.mediStore.getRecords();
    const prescriptions = window.mediStore.getPrescriptions();
    const timeline = window.mediStore.getTimeline();

    // Welcome Greeting based on time of day
    const hour = new Date().getHours();
    let greeting = 'Good morning';
    if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
    else if (hour >= 17) greeting = 'Good evening';

    const greetingEl = document.getElementById('patient-greeting');
    if (greetingEl) {
      greetingEl.innerHTML = `
        <span class="text-teal-600 font-semibold">${greeting}</span>, ${patient.fullName}
      `;
    }

    // Health Summary sub-headline
    const summaryEl = document.getElementById('patient-health-summary');
    if (summaryEl) {
      summaryEl.innerText = `Digital Vault ID: ${patient.id} • Blood Group: ${patient.bloodGroup} • All chronic vitals stable`;
    }

    // Dashboard Stat Cards
    const countRecords = document.getElementById('stat-total-records');
    const countRx = document.getElementById('stat-total-rx');
    const countConsults = document.getElementById('stat-total-consultations');
    const countMeds = document.getElementById('stat-active-meds');

    if (countRecords) countRecords.innerText = records.length;
    if (countRx) countRx.innerText = prescriptions.length;
    if (countConsults) {
      const consults = timeline.filter(t => t.category === 'consultation');
      countConsults.innerText = consults.length;
    }
    if (countMeds) {
      countMeds.innerText = patient.currentMedications ? patient.currentMedications.length : 3;
    }

    // Recent Medical Activity in Dashboard
    const recentActivityEl = document.getElementById('recent-activity-container');
    if (recentActivityEl) {
      const recentEvents = timeline.slice(0, 3);
      recentActivityEl.innerHTML = recentEvents.map(event => `
        <div class="relative pl-6 pb-6 border-l-2 border-teal-100 last:border-transparent last:pb-0">
          <div class="absolute -left-2 top-0 w-4 h-4 rounded-full bg-teal-500 border-2 border-white"></div>
          <div class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:border-teal-200 transition">
            <div class="flex items-center justify-between flex-wrap gap-2 mb-1">
              <span class="text-xs font-semibold px-2 py-0.5 rounded-full ${
                event.category === 'consultation' ? 'bg-blue-100 text-blue-700' :
                event.category === 'report' ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'
              }">${event.category.toUpperCase()}</span>
              <span class="text-xs text-slate-400 font-mono-code">${event.date}</span>
            </div>
            <h4 class="font-bold text-slate-800 text-sm">${event.title}</h4>
            <p class="text-xs text-teal-700 font-medium mb-1">${event.doctor} • ${event.hospital}</p>
            <p class="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 mt-2">${event.summary}</p>
          </div>
        </div>
      `).join('');
    }

    // Emergency Quick Card
    const emergencyInfoEl = document.getElementById('dash-emergency-card');
    if (emergencyInfoEl) {
      emergencyInfoEl.innerHTML = `
        <div class="flex items-start justify-between">
          <div>
            <span class="text-xs uppercase tracking-wider font-bold text-red-600 bg-red-50 px-2 py-1 rounded-md">Emergency Info</span>
            <h4 class="font-bold text-slate-900 mt-2 text-base">${patient.emergencyContact} (${patient.emergencyRelation})</h4>
            <p class="text-sm text-slate-600 font-mono-code mt-0.5">${patient.emergencyPhone}</p>
          </div>
          <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-sm">
            ${patient.bloodGroup}
          </div>
        </div>
        <div class="mt-3 pt-3 border-t border-slate-100">
          <p class="text-xs text-slate-500 font-medium mb-1">Critical Drug Allergies:</p>
          <div class="flex flex-wrap gap-1.5">
            ${patient.allergies.map(a => `<span class="bg-red-50 text-red-700 border border-red-200 text-xs px-2 py-0.5 rounded font-medium">${a}</span>`).join('')}
          </div>
        </div>
      `;
    }
  },

  // ----------------------------------------------------
  // Medical Records Management
  // ----------------------------------------------------
  renderRecords() {
    const records = window.mediStore.getRecords();
    const container = document.getElementById('records-grid-container');
    if (!container) return;

    let filtered = records.filter(rec => {
      // Type filter
      if (this.activeRecordFilter !== 'all' && rec.type.toLowerCase() !== this.activeRecordFilter.toLowerCase()) {
        return false;
      }
      // Search term
      if (this.searchTerm) {
        const query = this.searchTerm.toLowerCase();
        const inTitle = rec.title.toLowerCase().includes(query);
        const inDoc = rec.doctor.toLowerCase().includes(query);
        const inHosp = rec.hospital.toLowerCase().includes(query);
        const inDesc = rec.description.toLowerCase().includes(query);
        const inTags = rec.tags && rec.tags.some(t => t.toLowerCase().includes(query));
        return inTitle || inDoc || inHosp || inDesc || inTags;
      }
      return true;
    });

    // Sorting
    if (this.activeSort === 'newest') {
      filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (this.activeSort === 'oldest') {
      filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (this.activeSort === 'title') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-slate-300">
          <i data-lucide="file-question" class="w-12 h-12 text-slate-400 mx-auto mb-3"></i>
          <h3 class="text-base font-semibold text-slate-700">No medical records found</h3>
          <p class="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">No records match the current filter criteria or search query.</p>
          <button onclick="PatientController.resetRecordFilters()" class="text-xs px-3 py-1.5 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 font-medium">Clear Filters</button>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    container.innerHTML = filtered.map(rec => {
      const typeBadgeColor = this.getRecordTypeBadge(rec.type);
      return `
        <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm card-hover flex flex-col justify-between">
          <div>
            <!-- Header: Type Badge & Date -->
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-semibold px-2.5 py-1 rounded-full ${typeBadgeColor}">
                ${rec.type}
              </span>
              <span class="text-xs text-slate-400 font-mono-code">${rec.date}</span>
            </div>

            <!-- Title & Provider -->
            <h4 class="font-bold text-slate-900 text-base mb-1 line-clamp-1">${rec.title}</h4>
            <p class="text-xs text-teal-700 font-medium flex items-center gap-1 mb-2">
              <i data-lucide="building-2" class="w-3.5 h-3.5"></i>
              ${rec.hospital}
            </p>
            <p class="text-xs text-slate-500 mb-3 flex items-center gap-1">
              <i data-lucide="user-check" class="w-3.5 h-3.5"></i>
              ${rec.doctor}
            </p>

            <!-- Description -->
            <p class="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-lg mb-3 border border-slate-100">
              ${rec.description}
            </p>

            <!-- Tags -->
            <div class="flex flex-wrap gap-1 mb-4">
              ${(rec.tags || []).map(t => `<span class="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">#${t}</span>`).join('')}
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <button onclick="PatientController.openRecordModal('${rec.id}')" class="text-xs font-semibold px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition flex items-center gap-1">
              <i data-lucide="eye" class="w-3.5 h-3.5"></i> View Details
            </button>
            <div class="flex items-center gap-1">
              <button onclick="PatientController.downloadRecordSim('${rec.id}')" title="Download Report" class="p-1.5 text-slate-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition">
                <i data-lucide="download" class="w-4 h-4"></i>
              </button>
              <button onclick="PatientController.deleteRecordConfirm('${rec.id}')" title="Delete Record" class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  getRecordTypeBadge(type) {
    const t = (type || '').toLowerCase();
    if (t.includes('blood')) return 'bg-rose-50 text-rose-700 border border-rose-200';
    if (t.includes('x-ray') || t.includes('mri') || t.includes('ct') || t.includes('scan')) return 'bg-cyan-50 text-cyan-700 border border-cyan-200';
    if (t.includes('discharge')) return 'bg-purple-50 text-purple-700 border border-purple-200';
    if (t.includes('ultrasound') || t.includes('ecg')) return 'bg-blue-50 text-blue-700 border border-blue-200';
    return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  },

  filterRecords(category) {
    this.activeRecordFilter = category;
    document.querySelectorAll('.filter-pill-rec').forEach(btn => {
      btn.classList.remove('bg-teal-600', 'text-white');
      btn.classList.add('bg-white', 'text-slate-600');
    });
    const target = document.querySelector(`[data-filter="${category}"]`);
    if (target) {
      target.classList.remove('bg-white', 'text-slate-600');
      target.classList.add('bg-teal-600', 'text-white');
    }
    this.renderRecords();
  },

  searchRecords(query) {
    this.searchTerm = query;
    this.renderRecords();
  },

  sortRecords(sortType) {
    this.activeSort = sortType;
    this.renderRecords();
  },

  resetRecordFilters() {
    this.activeRecordFilter = 'all';
    this.searchTerm = '';
    const searchInput = document.getElementById('records-search-input');
    if (searchInput) searchInput.value = '';
    this.filterRecords('all');
  },

  // ----------------------------------------------------
  // Record Details Modal with Diagnostic Parameter Viewer
  // ----------------------------------------------------
  openRecordModal(recordId) {
    const record = window.mediStore.getRecords().find(r => r.id === recordId);
    if (!record) return;

    const modal = document.getElementById('view-record-modal');
    const content = document.getElementById('view-record-content');

    const paramsHtml = record.parameters && record.parameters.length > 0 ? `
      <div class="mt-4">
        <h5 class="text-xs uppercase font-bold text-slate-400 mb-2">Test Parameters & Reference Range</h5>
        <div class="overflow-x-auto rounded-xl border border-slate-200">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th class="p-2.5">Investigation</th>
                <th class="p-2.5">Observed Value</th>
                <th class="p-2.5">Biological Reference Range</th>
                <th class="p-2.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${record.parameters.map(p => `
                <tr class="hover:bg-slate-50/50">
                  <td class="p-2.5 font-medium text-slate-800">${p.name}</td>
                  <td class="p-2.5 font-bold ${p.status === 'high' ? 'text-red-600' : p.status === 'borderline' ? 'text-amber-600' : 'text-slate-900'}">${p.value}</td>
                  <td class="p-2.5 text-slate-500 font-mono-code">${p.normal}</td>
                  <td class="p-2.5 text-center">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      p.status === 'normal' || p.status === 'controlled' ? 'bg-emerald-100 text-emerald-800' :
                      p.status === 'borderline' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                    }">${p.status.toUpperCase()}</span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    ` : '';

    content.innerHTML = `
      <div class="p-6">
        <!-- Header -->
        <div class="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full ${this.getRecordTypeBadge(record.type)}">${record.type}</span>
              <span class="text-xs text-slate-400 font-mono-code">ID: ${record.id}</span>
            </div>
            <h3 class="text-xl font-bold text-slate-900">${record.title}</h3>
            <p class="text-xs text-teal-700 font-medium mt-1">${record.hospital} • Verified by ${record.doctor}</p>
          </div>
          <button onclick="PatientController.closeRecordModal()" class="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
            <i data-lucide="x" class="w-6 h-6"></i>
          </button>
        </div>

        <!-- Body Details -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 my-4 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
          <div>
            <span class="text-slate-400 block mb-0.5">Date of Test</span>
            <span class="font-bold text-slate-800 font-mono-code">${record.date}</span>
          </div>
          <div>
            <span class="text-slate-400 block mb-0.5">Category</span>
            <span class="font-bold text-slate-800">${record.type}</span>
          </div>
          <div>
            <span class="text-slate-400 block mb-0.5">Attached File</span>
            <span class="font-bold text-teal-700 truncate block">${record.fileName || 'Report_Document.pdf'}</span>
          </div>
          <div>
            <span class="text-slate-400 block mb-0.5">File Size</span>
            <span class="font-bold text-slate-800">${record.fileSize || '650 KB'}</span>
          </div>
        </div>

        <div class="mt-3">
          <h5 class="text-xs uppercase font-bold text-slate-400 mb-1">Clinical Impressions & Findings</h5>
          <p class="text-sm text-slate-700 bg-teal-50/40 border border-teal-100 p-3.5 rounded-xl leading-relaxed">
            ${record.description}
          </p>
        </div>

        ${paramsHtml}

        <div class="mt-4">
          <h5 class="text-xs uppercase font-bold text-slate-400 mb-1.5">Record Tags</h5>
          <div class="flex flex-wrap gap-1.5">
            ${(record.tags || []).map(t => `<span class="text-xs bg-slate-100 text-slate-700 font-medium px-2.5 py-1 rounded-md">#${t}</span>`).join('')}
          </div>
        </div>

        <!-- Document Preview Canvas / Simulated scan -->
        <div class="mt-6 border border-slate-200 rounded-xl overflow-hidden bg-slate-900 text-white p-4 text-center">
          <div class="flex items-center justify-between text-xs text-slate-400 mb-2 border-b border-slate-800 pb-2">
            <span>Secure Digital Medical Viewer • ABDM & HIPAA Encrypted</span>
            <span class="text-teal-400">Verified Hash: sha256-8a9f...</span>
          </div>
          <div class="py-8 flex flex-col items-center justify-center">
            <i data-lucide="file-check" class="w-12 h-12 text-teal-400 mb-2"></i>
            <p class="text-sm font-semibold">${record.fileName || 'Diagnostic_Report.pdf'}</p>
            <p class="text-xs text-slate-400 mt-1">Digital signature certified by ${record.hospital}</p>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button onclick="PatientController.closeRecordModal()" class="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">Close</button>
          <button onclick="PatientController.downloadRecordSim('${record.id}')" class="px-4 py-2 text-xs font-semibold bg-teal-600 text-white rounded-lg hover:bg-teal-700 flex items-center gap-1.5">
            <i data-lucide="download" class="w-4 h-4"></i> Download Original File
          </button>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  },

  closeRecordModal() {
    const modal = document.getElementById('view-record-modal');
    if (modal) modal.classList.add('hidden');
  },

  downloadRecordSim(recordId) {
    const record = window.mediStore.getRecords().find(r => r.id === recordId);
    if (!record) return;

    // Create a mock text file download with clinical contents
    const content = `MEDIVAULT VERIFIED DIGITAL HEALTH RECORD
======================================================
Record ID: ${record.id}
Date: ${record.date}
Title: ${record.title}
Type: ${record.type}
Facility: ${record.hospital}
Consultant / Radiologist: ${record.doctor}

CLINICAL IMPRESSIONS / FINDINGS:
------------------------------------------------------
${record.description}

TEST PARAMETERS:
------------------------------------------------------
${(record.parameters || []).map(p => `- ${p.name}: ${p.value} (Ref: ${p.normal}) [${p.status.toUpperCase()}]`).join('\n')}

TAGS: ${(record.tags || []).join(', ')}

======================================================
Protected Health Information - Patient Consent Managed
MediVault Centralized Health Record Platform
======================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = record.fileName ? record.fileName.replace('.pdf', '.txt') : `${record.title.replace(/\s+/g, '_')}_MediVault.txt`;
    link.click();
    URL.revokeObjectURL(url);

    window.MediVaultApp.showToast(`Downloading: ${record.title}`, 'success');
  },

  deleteRecordConfirm(recordId) {
    if (confirm('Are you sure you want to permanently remove this record from your MediVault?')) {
      window.mediStore.deleteRecord(recordId);
      this.renderRecords();
      this.renderDashboard();
      window.MediVaultApp.showToast('Record deleted successfully', 'info');
    }
  },

  // ----------------------------------------------------
  // Upload Medical Record Handler
  // ----------------------------------------------------
  handleUploadRecord(event) {
    event.preventDefault();
    const title = document.getElementById('up-title').value.trim();
    const type = document.getElementById('up-type').value;
    const hospital = document.getElementById('up-hospital').value.trim();
    const doctor = document.getElementById('up-doctor').value.trim();
    const date = document.getElementById('up-date').value;
    const description = document.getElementById('up-desc').value.trim();
    const tagsStr = document.getElementById('up-tags').value.trim();
    const fileInput = document.getElementById('up-file');

    if (!title || !hospital || !doctor) {
      window.MediVaultApp.showToast('Please fill in all required fields.', 'error');
      return;
    }

    const tags = tagsStr ? tagsStr.split(',').map(t => t.trim().replace(/^#/, '')) : ['PatientUpload'];
    const fileName = fileInput.files && fileInput.files[0] ? fileInput.files[0].name : `${title.replace(/\s+/g, '_')}.pdf`;
    const fileSize = fileInput.files && fileInput.files[0] ? `${(fileInput.files[0].size / 1024).toFixed(0)} KB` : '480 KB';

    const newRecord = {
      title,
      type,
      hospital,
      doctor,
      date: date || new Date().toISOString().split('T')[0],
      description: description || 'Diagnostic report uploaded by patient to MediVault profile.',
      tags,
      fileName,
      fileSize,
      parameters: [
        { name: 'Investigation Result', value: 'Completed & Verified', normal: 'Satisfactory', status: 'normal' }
      ]
    };

    window.mediStore.addRecord(newRecord);
    this.renderRecords();
    this.renderDashboard();
    this.renderTimeline();

    // Close modal & reset form
    document.getElementById('upload-record-modal').classList.add('hidden');
    event.target.reset();

    window.MediVaultApp.showToast('Medical record uploaded and encrypted!', 'success');
  },

  // ----------------------------------------------------
  // Patient Consent & Access Grants Engine (QR / Code)
  // ----------------------------------------------------
  renderAccessHistory() {
    const grants = window.mediStore.getAccessGrants();
    const tableBody = document.getElementById('access-history-table-body');
    if (!tableBody) return;

    if (grants.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="py-8 text-center text-slate-400 text-xs">No doctor access grants on record.</td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = grants.map(grant => {
      const isExpired = new Date() > new Date(grant.expiresAt) || grant.status === 'expired';
      const isRevoked = grant.status === 'revoked';
      const isActive = !isExpired && !isRevoked;

      let statusBadge = '';
      if (isActive) {
        statusBadge = `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-active"></span> Active
        </span>`;
      } else if (isRevoked) {
        statusBadge = `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">Revoked</span>`;
      } else {
        statusBadge = `<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">Expired</span>`;
      }

      const formattedExpiry = new Date(grant.expiresAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
      const formattedGranted = new Date(grant.grantedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

      return `
        <tr class="hover:bg-slate-50 transition border-b border-slate-100 text-xs">
          <td class="p-3.5 font-bold text-slate-900">
            ${grant.doctorName}
            <span class="block font-mono-code font-normal text-teal-600 text-[11px]">Code: ${grant.accessCode}</span>
          </td>
          <td class="p-3.5 text-slate-700">${grant.hospital}</td>
          <td class="p-3.5">
            <span class="bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded text-[11px] font-medium">${grant.scope}</span>
          </td>
          <td class="p-3.5 text-slate-500 font-mono-code">${formattedGranted}</td>
          <td class="p-3.5 text-slate-500 font-mono-code">${formattedExpiry}</td>
          <td class="p-3.5">${statusBadge}</td>
          <td class="p-3.5 text-right">
            ${isActive ? `
              <button onclick="PatientController.revokeAccess('${grant.id}')" class="px-2.5 py-1 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-lg font-semibold transition text-[11px]">
                Revoke Access
              </button>
            ` : `
              <span class="text-slate-400 text-[11px] italic">Access Inactive</span>
            `}
          </td>
        </tr>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  openShareModal() {
    const modal = document.getElementById('share-records-modal');
    if (!modal) return;

    // Generate a fresh temporary code
    this.generateFreshAccessCode();
    modal.classList.remove('hidden');
  },

  closeShareModal() {
    const modal = document.getElementById('share-records-modal');
    if (modal) modal.classList.add('hidden');
  },

  generateFreshAccessCode() {
    const scope = document.getElementById('share-scope') ? document.getElementById('share-scope').value : 'Full Medical History';
    const duration = document.getElementById('share-duration') ? parseInt(document.getElementById('share-duration').value, 10) : 24;
    const doctorName = document.getElementById('share-doctor-target') ? document.getElementById('share-doctor-target').value : 'Dr. Rahul Sharma';
    const hospital = document.getElementById('share-hospital-target') ? document.getElementById('share-hospital-target').value : 'Apollo Specialty Hospital';

    const newGrant = window.mediStore.createAccessGrant({
      scope,
      durationHours: duration,
      doctorName: doctorName || 'Authorized Clinician',
      hospital: hospital || 'Authorized Clinic'
    });

    // Update Code Display
    const codeDisplay = document.getElementById('active-access-code-display');
    if (codeDisplay) {
      codeDisplay.innerText = newGrant.accessCode;
    }

    // Generate real QR Code using QRCode.js
    const qrContainer = document.getElementById('access-qr-container');
    if (qrContainer) {
      qrContainer.innerHTML = '';
      if (window.QRCode) {
        new QRCode(qrContainer, {
          text: JSON.stringify({
            app: 'MediVault',
            code: newGrant.accessCode,
            patientId: newGrant.patientId,
            expires: newGrant.expiresAt
          }),
          width: 170,
          height: 170,
          colorDark: '#0f766e',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.M
        });
      }
    }

    this.renderAccessHistory();
  },

  copyAccessCode() {
    const code = document.getElementById('active-access-code-display').innerText;
    navigator.clipboard.writeText(code).then(() => {
      window.MediVaultApp.showToast(`Access Code ${code} copied to clipboard!`, 'success');
    }).catch(() => {
      window.MediVaultApp.showToast(`Code: ${code}`, 'info');
    });
  },

  revokeAccess(grantId) {
    if (confirm('Revoke this doctor\'s access immediately? They will no longer be able to view your medical records or prescriptions.')) {
      window.mediStore.revokeAccessGrant(grantId);
      this.renderAccessHistory();
      window.MediVaultApp.showToast('Access revoked successfully.', 'info');
    }
  },

  // ----------------------------------------------------
  // Patient Profile Management
  // ----------------------------------------------------
  renderProfile() {
    const patient = window.mediStore.getPatient();

    // Populate inputs
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || '';
    };

    setVal('prof-name', patient.fullName);
    setVal('prof-dob', patient.dob);
    setVal('prof-gender', patient.gender);
    setVal('prof-blood', patient.bloodGroup);
    setVal('prof-phone', patient.phone);
    setVal('prof-email', patient.email);
    setVal('prof-address', patient.address);

    setVal('prof-emergency-name', patient.emergencyContact);
    setVal('prof-emergency-phone', patient.emergencyPhone);
    setVal('prof-emergency-rel', patient.emergencyRelation);

    setVal('prof-allergies', patient.allergies.join(', '));
    setVal('prof-conditions', patient.existingConditions.join(', '));
    setVal('prof-medications', patient.currentMedications.map(m => `${m.name} ${m.dosage} (${m.frequency})`).join('\n'));
    setVal('prof-surgeries', patient.previousSurgeries.map(s => `${s.procedure} (${s.hospital}, ${s.date})`).join('\n'));
    setVal('prof-family', patient.familyMedicalHistory.map(f => `${f.relation}: ${f.conditions}`).join('\n'));
  },

  handleSaveProfile(event) {
    event.preventDefault();

    const getVal = id => {
      const el = document.getElementById(id);
      return el ? el.value.trim() : '';
    };

    const allergies = getVal('prof-allergies').split(',').map(s => s.trim()).filter(Boolean);
    const existingConditions = getVal('prof-conditions').split(',').map(s => s.trim()).filter(Boolean);
    
    // Parse surgeries
    const surgeryLines = getVal('prof-surgeries').split('\n').filter(Boolean);
    const previousSurgeries = surgeryLines.map(line => ({
      procedure: line,
      hospital: 'Hospital Records',
      date: 'Documented'
    }));

    // Parse family
    const familyLines = getVal('prof-family').split('\n').filter(Boolean);
    const familyMedicalHistory = familyLines.map(line => {
      const parts = line.split(':');
      return {
        relation: parts[0] ? parts[0].trim() : 'Relative',
        conditions: parts[1] ? parts[1].trim() : line
      };
    });

    const updated = {
      fullName: getVal('prof-name'),
      dob: getVal('prof-dob'),
      gender: getVal('prof-gender'),
      bloodGroup: getVal('prof-blood'),
      phone: getVal('prof-phone'),
      email: getVal('prof-email'),
      address: getVal('prof-address'),
      emergencyContact: getVal('prof-emergency-name'),
      emergencyPhone: getVal('prof-emergency-phone'),
      emergencyRelation: getVal('prof-emergency-rel'),
      allergies,
      existingConditions,
      previousSurgeries,
      familyMedicalHistory
    };

    window.mediStore.updatePatient(updated);
    this.renderDashboard();
    window.MediVaultApp.showToast('Patient health profile saved successfully!', 'success');
  },

  // ----------------------------------------------------
  // Full Medical Timeline View
  // ----------------------------------------------------
  renderTimeline() {
    const timeline = window.mediStore.getTimeline();
    const container = document.getElementById('full-timeline-container');
    if (!container) return;

    container.innerHTML = timeline.map((item, index) => {
      const isConsult = item.category === 'consultation';
      const isReport = item.category === 'report';
      const isSurgery = item.category === 'surgery';

      return `
        <div class="relative pl-8 pb-8 border-l-2 ${index === timeline.length - 1 ? 'border-transparent' : 'border-teal-200'}">
          <div class="absolute -left-3 top-0 w-6 h-6 rounded-full flex items-center justify-center ${
            isConsult ? 'bg-blue-600 text-white' : isReport ? 'bg-emerald-600 text-white' : 'bg-purple-600 text-white'
          } shadow-sm border-2 border-white">
            <i data-lucide="${isConsult ? 'stethoscope' : isReport ? 'file-text' : 'activity'}" class="w-3.5 h-3.5"></i>
          </div>

          <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:border-teal-300 transition">
            <div class="flex items-center justify-between flex-wrap gap-2 mb-2">
              <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                isConsult ? 'bg-blue-100 text-blue-800' : isReport ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
              }">${item.category.toUpperCase()}</span>
              <span class="text-xs text-slate-400 font-mono-code">${item.date}</span>
            </div>

            <h4 class="font-bold text-slate-900 text-base mb-0.5">${item.title}</h4>
            <p class="text-xs text-teal-700 font-medium mb-3">${item.doctor} • ${item.hospital}</p>

            ${item.diagnosis ? `
              <div class="inline-block bg-teal-50 border border-teal-100 px-3 py-1 rounded-lg text-xs font-semibold text-teal-900 mb-3">
                Diagnosis: ${item.diagnosis}
              </div>
            ` : ''}

            <p class="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              ${item.summary}
            </p>
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }
};

window.PatientController = PatientController;
