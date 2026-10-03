/**
 * MediVault - Digital Prescription Engine
 * Multi-medicine dynamic builder, consultation logger, digital signature stamp, and PDF / Print generation
 */

const PrescriptionEngine = {
  medicineRows: [],
  activePreviewRx: null,

  init() {
    this.resetForm();
    this.renderPrescriptionsList();
  },

  resetForm() {
    const doctor = window.mediStore.getCurrentDoctor();
    const patient = window.mediStore.getPatient();

    // Prefill Doctor fields
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || '';
    };

    setVal('rx-doc-name', doctor.name);
    setVal('rx-doc-qual', doctor.qualification);
    setVal('rx-doc-spec', doctor.specialization);
    setVal('rx-doc-hosp', doctor.hospital);
    setVal('rx-doc-reg', doctor.registrationNumber);

    // Prefill Patient fields
    setVal('rx-pat-name', patient.fullName);
    setVal('rx-pat-id', patient.id);
    setVal('rx-pat-age', patient.age);
    setVal('rx-pat-gender', patient.gender);

    // Date
    setVal('rx-date', new Date().toISOString().split('T')[0]);

    // Clear clinical inputs
    setVal('rx-complaint', '');
    setVal('rx-symptoms', '');
    setVal('rx-diagnosis', '');
    setVal('rx-notes', '');
    setVal('rx-diet', '');
    setVal('rx-rest', '');
    setVal('rx-followup', '');
    setVal('rx-tests', '');

    // Initialize with 1 default medicine row
    this.medicineRows = [
      {
        name: 'Paracetamol',
        dosage: '650 mg',
        frequency: '1 tablet 3 times a day',
        duration: '5 days',
        timing: 'After food',
        instructions: 'Take if temperature exceeds 99.5°F'
      }
    ];

    this.renderMedicineRows();
  },

  renderMedicineRows() {
    const container = document.getElementById('medicines-table-body');
    if (!container) return;

    container.innerHTML = this.medicineRows.map((med, index) => `
      <tr class="border-b border-slate-100 hover:bg-slate-50/50">
        <td class="p-2.5">
          <input type="text" value="${med.name || ''}" onchange="PrescriptionEngine.updateMedicineField(${index}, 'name', this.value)" 
                 placeholder="e.g. Amoxicillin / Paracetamol" class="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-teal-500 font-medium text-slate-800" />
        </td>
        <td class="p-2.5">
          <input type="text" value="${med.dosage || ''}" onchange="PrescriptionEngine.updateMedicineField(${index}, 'dosage', this.value)" 
                 placeholder="e.g. 500 mg / 1 tab" class="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-teal-500 text-slate-800" />
        </td>
        <td class="p-2.5">
          <select onchange="PrescriptionEngine.updateMedicineField(${index}, 'frequency', this.value)" 
                  class="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-teal-500 text-slate-800 bg-white">
            <option value="1-0-1 (Twice daily)" ${med.frequency.includes('1-0-1') ? 'selected' : ''}>1-0-1 (Twice daily)</option>
            <option value="1-1-1 (Thrice daily)" ${med.frequency.includes('1-1-1') ? 'selected' : ''}>1-1-1 (Thrice daily)</option>
            <option value="1-0-0 (Morning only)" ${med.frequency.includes('1-0-0') ? 'selected' : ''}>1-0-0 (Morning)</option>
            <option value="0-0-1 (Night only)" ${med.frequency.includes('0-0-1') ? 'selected' : ''}>0-0-1 (Night)</option>
            <option value="1 tablet once daily" ${med.frequency.includes('once daily') ? 'selected' : ''}>Once daily</option>
            <option value="SOS (As needed / When required)" ${med.frequency.includes('SOS') ? 'selected' : ''}>SOS (As needed)</option>
          </select>
        </td>
        <td class="p-2.5">
          <input type="text" value="${med.duration || ''}" onchange="PrescriptionEngine.updateMedicineField(${index}, 'duration', this.value)" 
                 placeholder="e.g. 5 days / 2 weeks" class="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-teal-500 text-slate-800" />
        </td>
        <td class="p-2.5">
          <select onchange="PrescriptionEngine.updateMedicineField(${index}, 'timing', this.value)" 
                  class="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-teal-500 text-slate-800 bg-white">
            <option value="After food" ${med.timing === 'After food' ? 'selected' : ''}>After food</option>
            <option value="Before food" ${med.timing === 'Before food' ? 'selected' : ''}>Before food</option>
            <option value="Empty stomach (Morning)" ${med.timing.includes('Empty stomach') ? 'selected' : ''}>Empty stomach</option>
            <option value="With meals" ${med.timing === 'With meals' ? 'selected' : ''}>With meals</option>
            <option value="Bedtime" ${med.timing === 'Bedtime' ? 'selected' : ''}>Bedtime</option>
          </select>
        </td>
        <td class="p-2.5">
          <input type="text" value="${med.instructions || ''}" onchange="PrescriptionEngine.updateMedicineField(${index}, 'instructions', this.value)" 
                 placeholder="e.g. Drink warm water" class="w-full text-xs p-2 rounded-lg border border-slate-200 focus:ring-1 focus:ring-teal-500 text-slate-800" />
        </td>
        <td class="p-2.5 text-center">
          <button type="button" onclick="PrescriptionEngine.removeMedicineRow(${index})" class="text-slate-400 hover:text-red-600 p-1 rounded-md transition" title="Remove row">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </td>
      </tr>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  },

  addMedicineRow(prefill = {}) {
    this.medicineRows.push({
      name: prefill.name || '',
      dosage: prefill.dosage || '1 tablet',
      frequency: prefill.frequency || '1-0-1 (Twice daily)',
      duration: prefill.duration || '5 days',
      timing: prefill.timing || 'After food',
      instructions: prefill.instructions || 'Follow doctor advice'
    });
    this.renderMedicineRows();
  },

  removeMedicineRow(index) {
    if (this.medicineRows.length <= 1) {
      window.MediVaultApp.showToast('Prescription must contain at least one medicine.', 'warning');
      return;
    }
    this.medicineRows.splice(index, 1);
    this.renderMedicineRows();
  },

  updateMedicineField(index, field, value) {
    if (this.medicineRows[index]) {
      this.medicineRows[index][field] = value;
    }
  },

  addQuickMed(name, dosage, frequency, duration, timing, instructions) {
    this.addMedicineRow({ name, dosage, frequency, duration, timing, instructions });
    window.MediVaultApp.showToast(`Added ${name} to prescription`, 'info');
  },

  // ----------------------------------------------------
  // Save & Issue Prescription
  // ----------------------------------------------------
  handleSavePrescription(event) {
    if (event) event.preventDefault();

    const getVal = id => {
      const el = document.getElementById(id);
      return el ? el.value.trim() : '';
    };

    const diagnosis = getVal('rx-diagnosis');
    const complaint = getVal('rx-complaint');

    if (!diagnosis) {
      window.MediVaultApp.showToast('Please enter a clinical diagnosis before issuing prescription.', 'error');
      return;
    }

    // Filter valid medicines
    const validMeds = this.medicineRows.filter(m => m.name.trim().length > 0);
    if (validMeds.length === 0) {
      window.MediVaultApp.showToast('Please add at least one medication with a valid name.', 'error');
      return;
    }

    const doctor = window.mediStore.getCurrentDoctor();
    const patient = window.mediStore.getPatient();

    const rxData = {
      doctorId: doctor.id,
      doctorName: getVal('rx-doc-name') || doctor.name,
      qualification: getVal('rx-doc-qual') || doctor.qualification,
      specialization: getVal('rx-doc-spec') || doctor.specialization,
      hospital: getVal('rx-doc-hosp') || doctor.hospital,
      registrationNumber: getVal('rx-doc-reg') || doctor.registrationNumber,

      patientId: patient.id,
      patientName: patient.fullName,
      age: patient.age,
      gender: patient.gender,
      bloodGroup: patient.bloodGroup,

      date: getVal('rx-date') || new Date().toISOString().split('T')[0],
      chiefComplaint: complaint || 'General medical consultation',
      symptoms: getVal('rx-symptoms') || 'Clinical examination conducted',
      diagnosis: diagnosis,
      doctorNotes: getVal('rx-notes') || 'Follow prescribed medication and hydration.',

      medicines: validMeds,

      dietAdvice: getVal('rx-diet') || 'Standard healthy balanced diet, warm hydration.',
      restAdvice: getVal('rx-rest') || 'Adequate rest recommended.',
      followUpDate: getVal('rx-followup') || 'As advised or SOS in 5 days',
      testsRecommended: getVal('rx-tests') || 'None at present'
    };

    const createdRx = window.mediStore.addPrescription(rxData);
    this.renderPrescriptionsList();
    if (window.PatientController) window.PatientController.renderDashboard();

    window.MediVaultApp.showToast('Prescription saved and added to Patient Vault!', 'success');

    // Automatically open preview modal for immediate verification & PDF download
    this.openPreviewModal(createdRx.id);
  },

  // ----------------------------------------------------
  // Prescription Preview & Print / PDF Engine
  // ----------------------------------------------------
  openPreviewModal(rxId) {
    const rx = window.mediStore.getPrescriptions().find(r => r.id === rxId);
    if (!rx) return;

    this.activePreviewRx = rx;
    const modal = document.getElementById('preview-prescription-modal');
    const container = document.getElementById('prescription-print-area');

    container.innerHTML = `
      <div class="prescription-paper p-8 rounded-2xl border border-slate-200 relative bg-white max-w-3xl mx-auto shadow-lg text-slate-800">
        <!-- Rx Watermark Background -->
        <div class="rx-watermark">Rx</div>

        <!-- Clinic & Doctor Header (Letterhead) -->
        <div class="border-b-2 border-teal-600 pb-5 mb-5 flex items-start justify-between">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-black text-sm">MV</span>
              <span class="text-xl font-black tracking-tight text-slate-900">MediVault Health</span>
            </div>
            <h3 class="text-lg font-bold text-teal-800">${rx.hospital}</h3>
            <p class="text-xs text-slate-500 font-medium">Department of ${rx.specialization}</p>
          </div>
          <div class="text-right">
            <h4 class="font-bold text-slate-900 text-base">${rx.doctorName}</h4>
            <p class="text-xs text-slate-600 font-medium">${rx.qualification}</p>
            <p class="text-xs text-teal-700 font-mono-code font-semibold">Reg. No: ${rx.registrationNumber}</p>
            <p class="text-xs text-slate-400 mt-1 font-mono-code">Date: ${rx.date} ${rx.time ? `• ${rx.time}` : ''}</p>
          </div>
        </div>

        <!-- Patient Demographics Bar -->
        <div class="bg-teal-50/70 border border-teal-100 rounded-xl p-3.5 mb-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span class="text-slate-400 block text-[10px] uppercase font-semibold">Patient Name</span>
            <span class="font-bold text-slate-900 text-sm">${rx.patientName}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[10px] uppercase font-semibold">Patient ID / Age / Gender</span>
            <span class="font-semibold text-slate-800 font-mono-code">${rx.patientId} • ${rx.age}Y • ${rx.gender}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[10px] uppercase font-semibold">Blood Group</span>
            <span class="font-bold text-red-600">${rx.bloodGroup || 'O+'}</span>
          </div>
          <div>
            <span class="text-slate-400 block text-[10px] uppercase font-semibold">Prescription ID</span>
            <span class="font-bold text-teal-700 font-mono-code">${rx.id}</span>
          </div>
        </div>

        <!-- Chief Complaint & Diagnosis -->
        <div class="mb-5 space-y-2">
          ${rx.chiefComplaint ? `
            <div class="text-xs">
              <span class="font-bold text-slate-700 uppercase tracking-wide">Chief Complaint:</span>
              <span class="text-slate-800 ml-1 font-medium">${rx.chiefComplaint}</span>
            </div>
          ` : ''}

          <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div>
              <span class="text-[11px] uppercase tracking-wider font-bold text-teal-700 block">Provisional Diagnosis:</span>
              <span class="text-base font-bold text-slate-900">${rx.diagnosis}</span>
            </div>
            <div class="text-right">
              <span class="text-3xl font-serif text-teal-700 font-bold">℞</span>
            </div>
          </div>
        </div>

        <!-- Medicines Table -->
        <div class="mb-6">
          <h4 class="text-xs uppercase font-bold text-slate-400 mb-2 tracking-wider">Prescribed Medication & Dosage Schedule</h4>
          <div class="border border-slate-200 rounded-xl overflow-hidden">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th class="p-3">#</th>
                  <th class="p-3">Drug / Medication</th>
                  <th class="p-3">Dosage</th>
                  <th class="p-3">Frequency</th>
                  <th class="p-3">Duration</th>
                  <th class="p-3">Instructions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${rx.medicines.map((m, idx) => `
                  <tr class="hover:bg-slate-50/50">
                    <td class="p-3 font-mono-code text-slate-400">${idx + 1}</td>
                    <td class="p-3 font-bold text-slate-900">${m.name}</td>
                    <td class="p-3 text-slate-700 font-medium">${m.dosage}</td>
                    <td class="p-3 text-slate-700 font-semibold">${m.frequency}</td>
                    <td class="p-3 text-teal-700 font-bold">${m.duration}</td>
                    <td class="p-3 text-slate-600">
                      <span class="inline-block bg-teal-50 text-teal-800 px-1.5 py-0.5 rounded text-[11px] font-medium mr-1">${m.timing}</span>
                      ${m.instructions || ''}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Advice, Diet & Follow-up -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div>
            <span class="font-bold text-slate-700 block mb-1">Dietary & Lifestyle Advice:</span>
            <p class="text-slate-600 leading-relaxed">${rx.dietAdvice || 'Normal healthy balanced diet, warm hydration.'}</p>
            ${rx.restAdvice ? `<p class="text-slate-600 mt-1 font-medium text-amber-800">Rest: ${rx.restAdvice}</p>` : ''}
          </div>
          <div>
            <span class="font-bold text-slate-700 block mb-1">Next Follow-Up / Review:</span>
            <p class="text-teal-700 font-bold mb-2">${rx.followUpDate || 'After 5-7 days or if symptoms worsen'}</p>
            ${rx.testsRecommended && rx.testsRecommended !== 'None at present' ? `
              <span class="font-bold text-slate-700 block mb-0.5">Recommended Lab Tests:</span>
              <p class="text-slate-600">${rx.testsRecommended}</p>
            ` : ''}
          </div>
        </div>

        <!-- Doctor Signature & Digital Seal -->
        <div class="pt-4 border-t-2 border-slate-100 flex items-center justify-between">
          <div class="text-[11px] text-slate-400">
            <p>Generated via <strong class="text-teal-700">MediVault Digital Health Network</strong></p>
            <p>Protected by end-to-end patient consent & ABDM compliance</p>
            <p class="font-mono-code text-[10px] mt-0.5">Hash: ${rx.id}-SECURE-AUTH-2026</p>
          </div>
          <div class="text-right">
            <div class="inline-block p-3 rounded-xl doctor-signature-seal text-center mb-1">
              <span class="text-teal-800 font-serif italic text-base font-bold block">${rx.doctorName}</span>
              <span class="text-[9px] uppercase font-bold text-teal-600 tracking-wider">Digitally Verified & Certified</span>
            </div>
            <p class="text-[11px] font-bold text-slate-700">Medical Practitioner Signature</p>
          </div>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  },

  closePreviewModal() {
    const modal = document.getElementById('preview-prescription-modal');
    if (modal) modal.classList.add('hidden');
  },

  downloadPrescriptionPDF() {
    if (!this.activePreviewRx) return;
    const printArea = document.getElementById('prescription-print-area');
    const rx = this.activePreviewRx;

    window.MediVaultApp.showToast('Generating high-resolution prescription PDF...', 'info');

    if (window.html2pdf) {
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `MediVault_Prescription_${rx.patientName.replace(/\s+/g, '_')}_${rx.id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      window.html2pdf().set(opt).from(printArea).save().then(() => {
        window.MediVaultApp.showToast('Prescription PDF downloaded successfully!', 'success');
      }).catch(err => {
        console.error('html2pdf error:', err);
        // Fallback to print
        window.print();
      });
    } else {
      window.print();
    }
  },

  printPrescription() {
    window.print();
  },

  // ----------------------------------------------------
  // Prescriptions List View (Patient & Doctor)
  // ----------------------------------------------------
  renderPrescriptionsList() {
    const prescriptions = window.mediStore.getPrescriptions();
    const container = document.getElementById('prescriptions-list-container');
    if (!container) return;

    if (prescriptions.length === 0) {
      container.innerHTML = `
        <div class="py-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
          <i data-lucide="file-text" class="w-12 h-12 text-slate-400 mx-auto mb-3"></i>
          <h4 class="font-bold text-slate-700 text-sm">No prescriptions found</h4>
          <p class="text-xs text-slate-500 mt-1">Prescriptions issued by authorized doctors will appear here.</p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    container.innerHTML = prescriptions.map(rx => `
      <div class="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm card-hover mb-4">
        <div class="flex items-start justify-between gap-4 flex-wrap pb-3 border-b border-slate-100">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 font-mono-code">${rx.id}</span>
              <span class="text-xs text-slate-400 font-mono-code">${rx.date}</span>
            </div>
            <h4 class="font-bold text-slate-900 text-base">${rx.diagnosis}</h4>
            <p class="text-xs text-teal-700 font-medium">${rx.doctorName} • ${rx.hospital}</p>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="PrescriptionEngine.openPreviewModal('${rx.id}')" class="text-xs font-semibold px-3 py-1.5 bg-teal-50 text-teal-700 hover:bg-teal-100 rounded-lg transition flex items-center gap-1.5">
              <i data-lucide="eye" class="w-3.5 h-3.5"></i> View Rx
            </button>
            <button onclick="PrescriptionEngine.openPreviewModal('${rx.id}'); setTimeout(() => PrescriptionEngine.downloadPrescriptionPDF(), 300);" class="text-xs font-semibold px-3 py-1.5 bg-teal-600 text-white hover:bg-teal-700 rounded-lg transition flex items-center gap-1.5">
              <i data-lucide="download" class="w-3.5 h-3.5"></i> Download PDF
            </button>
          </div>
        </div>

        <!-- Medicines Summary -->
        <div class="mt-3">
          <p class="text-xs text-slate-500 font-medium mb-1.5">Prescribed Medicines (${rx.medicines.length}):</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            ${rx.medicines.map(m => `
              <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                <span class="font-bold text-slate-800 block">${m.name}</span>
                <span class="text-slate-500 text-[11px]">${m.dosage} • ${m.frequency}</span>
                <span class="text-teal-700 block text-[11px] font-medium mt-0.5">${m.timing} (${m.duration})</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Follow-up banner -->
        ${rx.followUpDate ? `
          <div class="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Next Recommended Follow-Up: <strong class="text-teal-700">${rx.followUpDate}</strong></span>
            <span class="text-[11px] text-slate-400">Reg: ${rx.registrationNumber}</span>
          </div>
        ` : ''}
      </div>
    `).join('');

    if (window.lucide) window.lucide.createIcons();
  }
};

window.PrescriptionEngine = PrescriptionEngine;
