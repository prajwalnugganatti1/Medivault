/**
 * MediVault - Administrator Controller
 * Super-Admin Control Console: Doctor Special Key Management, Patient & Doctor Account Oversight, and Platform Insights
 */

const AdminController = {
  activeTab: 'keys', // 'keys', 'patients', 'doctors', 'insights'

  init() {
    this.renderOverviewMetrics();
    this.renderDoctorKeysTable();
    this.renderPatientsTable();
    this.renderDoctorsTable();
    this.renderPlatformInsights();
  },

  switchAdminTab(tabName) {
    this.activeTab = tabName;
    ['keys', 'patients', 'doctors', 'insights'].forEach(t => {
      const panel = document.getElementById(`admin-panel-${t}`);
      const btn = document.getElementById(`admin-tab-btn-${t}`);
      if (panel) {
        if (t === tabName) panel.classList.remove('hidden');
        else panel.classList.add('hidden');
      }
      if (btn) {
        if (t === tabName) {
          btn.classList.add('bg-purple-600', 'text-white', 'shadow-sm');
          btn.classList.remove('text-slate-600', 'hover:bg-slate-100');
        } else {
          btn.classList.remove('bg-purple-600', 'text-white', 'shadow-sm');
          btn.classList.add('text-slate-600', 'hover:bg-slate-100');
        }
      }
    });

    if (window.lucide) window.lucide.createIcons();
  },

  // ----------------------------------------------------
  // Overview Metrics
  // ----------------------------------------------------
  renderOverviewMetrics() {
    const insights = window.mediStore.getAdminInsights();

    const setMetric = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.innerText = val;
    };

    setMetric('admin-stat-patients', insights.totalPatients);
    setMetric('admin-stat-doctors', insights.totalDoctors);
    setMetric('admin-stat-keys', insights.totalKeys);
    setMetric('admin-stat-records', insights.totalRecords);
    setMetric('admin-stat-rx', insights.totalRx);
    setMetric('admin-stat-consent', insights.activeConsentGrants);
  },

  // ----------------------------------------------------
  // Special Doctor Key Management
  // ----------------------------------------------------
  renderDoctorKeysTable() {
    const keys = window.mediStore.getDoctorKeys();
    const tableBody = document.getElementById('admin-doctor-keys-table-body');
    if (!tableBody) return;

    if (keys.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" class="py-6 text-center text-slate-400 text-xs">No doctor keys generated yet.</td></tr>`;
      return;
    }

    tableBody.innerHTML = keys.map(k => {
      const isRevoked = k.status === 'revoked';
      const isUsed = k.status === 'used';
      const isActive = k.status === 'active';

      let statusBadge = '';
      if (isActive) {
        statusBadge = `<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1.5 w-max">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-active"></span> Active (Available)
        </span>`;
      } else if (isUsed) {
        statusBadge = `<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-100 text-cyan-800 w-max inline-block">Assigned & In Use</span>`;
      } else {
        statusBadge = `<span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 w-max inline-block">Revoked</span>`;
      }

      const generated = new Date(k.generatedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

      return `
        <tr class="hover:bg-slate-50 transition border-b border-slate-100 text-xs">
          <td class="p-3.5 font-mono-code font-bold text-purple-700 bg-purple-50/50 rounded-lg">
            ${k.keyCode}
          </td>
          <td class="p-3.5 font-bold text-slate-900">${k.doctorName}</td>
          <td class="p-3.5 text-slate-700 font-medium">${k.hospital}</td>
          <td class="p-3.5 text-slate-500">${k.specialization}</td>
          <td class="p-3.5 text-slate-400 font-mono-code">${generated}</td>
          <td class="p-3.5">${statusBadge}</td>
          <td class="p-3.5 text-right space-x-1">
            <button onclick="AdminController.copyKey('${k.keyCode}')" title="Copy Key" class="px-2.5 py-1 bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-800 rounded-lg font-semibold transition text-[11px]">
              Copy
            </button>
            ${!isRevoked ? `
              <button onclick="AdminController.revokeKey('${k.id}')" title="Revoke Key" class="px-2.5 py-1 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 rounded-lg font-semibold transition text-[11px]">
                Revoke
              </button>
            ` : `
              <span class="text-slate-400 text-[11px] italic">Revoked</span>
            `}
          </td>
        </tr>
      `;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  handleGenerateKey(event) {
    event.preventDefault();
    const docName = document.getElementById('new-key-doctor-name').value.trim();
    const hospital = document.getElementById('new-key-hospital').value.trim();
    const spec = document.getElementById('new-key-specialization').value.trim();
    const notes = document.getElementById('new-key-notes').value.trim();

    if (!hospital) {
      window.MediVaultApp.showToast('Please specify the hospital or clinic name.', 'error');
      return;
    }

    const createdKey = window.mediStore.generateDoctorKey({
      doctorName: docName || 'Authorized Clinician',
      hospital,
      specialization: spec || 'Internal Medicine',
      notes
    });

    this.renderDoctorKeysTable();
    this.renderOverviewMetrics();

    // Reset form
    event.target.reset();
    window.MediVaultApp.showToast(`Special Key ${createdKey.keyCode} generated successfully!`, 'success');
  },

  copyKey(keyCode) {
    navigator.clipboard.writeText(keyCode).then(() => {
      window.MediVaultApp.showToast(`Copied Doctor Key: ${keyCode}`, 'success');
    }).catch(() => {
      window.MediVaultApp.showToast(`Doctor Key: ${keyCode}`, 'info');
    });
  },

  revokeKey(keyId) {
    if (confirm('Revoke this doctor access key immediately? Any doctor attempting to login with this key will be denied.')) {
      window.mediStore.revokeDoctorKey(keyId);
      this.renderDoctorKeysTable();
      this.renderOverviewMetrics();
      window.MediVaultApp.showToast('Doctor key revoked by Administrator.', 'info');
    }
  },

  // ----------------------------------------------------
  // Patient Oversight Table
  // ----------------------------------------------------
  renderPatientsTable() {
    const patients = window.mediStore.getRegisteredPatients();
    const tableBody = document.getElementById('admin-patients-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = patients.map(p => `
      <tr class="hover:bg-slate-50 transition border-b border-slate-100 text-xs">
        <td class="p-3.5 font-bold text-slate-900 flex items-center gap-2">
          <div class="w-7 h-7 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-[11px]">
            ${p.bloodGroup}
          </div>
          <div>
            <span>${p.fullName}</span>
            <span class="block text-[10px] text-teal-700 font-mono-code">${p.id}</span>
          </div>
        </td>
        <td class="p-3.5 text-slate-700">${p.age} yrs • ${p.gender}</td>
        <td class="p-3.5 text-slate-500 font-mono-code">${p.phone}</td>
        <td class="p-3.5 text-slate-600">${p.email}</td>
        <td class="p-3.5">
          <div class="flex flex-wrap gap-1 max-w-xs">
            ${(p.allergies || []).map(a => `<span class="bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.5 rounded text-[10px] font-bold">${a}</span>`).join('')}
          </div>
        </td>
        <td class="p-3.5">
          <span class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
            ${p.status || 'Active'}
          </span>
        </td>
      </tr>
    `).join('');
  },

  // ----------------------------------------------------
  // Doctor Oversight Table
  // ----------------------------------------------------
  renderDoctorsTable() {
    const doctors = window.mediStore.getRegisteredDoctors();
    const tableBody = document.getElementById('admin-doctors-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = doctors.map(d => `
      <tr class="hover:bg-slate-50 transition border-b border-slate-100 text-xs">
        <td class="p-3.5 font-bold text-slate-900 flex items-center gap-2.5">
          <img src="${d.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=100&q=80'}" class="w-8 h-8 rounded-xl object-cover border border-cyan-200" />
          <div>
            <span>${d.name}</span>
            <span class="block text-[10px] text-cyan-700 font-mono-code">${d.id} • ${d.registrationNumber}</span>
          </div>
        </td>
        <td class="p-3.5 font-medium text-slate-800">${d.hospital}</td>
        <td class="p-3.5 text-slate-600">${d.specialization}</td>
        <td class="p-3.5 font-mono-code font-bold text-purple-700">${d.assignedKey || 'DOC-KEY-8472'}</td>
        <td class="p-3.5 text-slate-800 font-bold">${d.totalConsultations || 148}</td>
        <td class="p-3.5">
          <span class="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-100 text-cyan-800">
            ${d.status || 'Verified'}
          </span>
        </td>
      </tr>
    `).join('');
  },

  // ----------------------------------------------------
  // Platform Insights & Analytics
  // ----------------------------------------------------
  renderPlatformInsights() {
    const insights = window.mediStore.getAdminInsights();
    const breakdownEl = document.getElementById('admin-records-breakdown');
    if (breakdownEl) {
      const recordsMap = insights.recordsByType || {};
      breakdownEl.innerHTML = Object.keys(recordsMap).map(type => `
        <div class="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs flex items-center justify-between">
          <span class="font-medium text-slate-700">${type}</span>
          <span class="font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 font-mono-code">${recordsMap[type]} files</span>
        </div>
      `).join('');
    }

    const auditListEl = document.getElementById('admin-audit-logs-list');
    if (auditListEl) {
      auditListEl.innerHTML = (insights.recentAudits || []).map(audit => `
        <div class="p-3 rounded-xl border border-slate-100 bg-white hover:border-purple-200 transition text-xs mb-2">
          <div class="flex items-center justify-between mb-1">
            <span class="font-bold text-slate-900">${audit.patientName} ➔ ${audit.doctorName}</span>
            <span class="text-[10px] text-slate-400 font-mono-code">${new Date(audit.grantedAt).toLocaleString()}</span>
          </div>
          <p class="text-[11px] text-slate-500">${audit.hospital} • Scope: ${audit.scope} • Code: <strong class="text-teal-700 font-mono-code">${audit.accessCode}</strong></p>
        </div>
      `).join('');
    }
  }
};

window.AdminController = AdminController;
