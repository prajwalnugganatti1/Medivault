/**
 * MediVault - State Management, Data Store, and Authentication Engine
 * Supports Multi-Role Auth (Patient with OTP, Doctor with Admin-Issued Special Keys, Admin Portal),
 * Admin Management, Clinical Records, Prescriptions, Ephemeral Consent Grants, and AI Assistant History.
 */

const STORAGE_KEY = 'medivault_hackathon_state_v2';

const DEFAULT_STATE = {
  // Authentication & Session
  currentUser: null, // null when logged out, or { role: 'patient'|'doctor'|'admin', data: {...} }
  activeOtpCode: null, // latest simulated OTP
  activeOtpTarget: null,

  // Admin Credentials & Master Key
  admin: {
    id: 'ADMIN-001',
    name: 'Super Administrator',
    email: 'admin@medivault.health',
    masterKey: 'ADMIN-MASTER-2026',
    role: 'admin',
    lastLogin: '2026-10-03T11:00:00.000Z'
  },

  // Special Doctor Access Keys (Generated & Managed by Admin)
  doctorKeys: [
    {
      id: 'DKEY-1',
      keyCode: 'DOC-KEY-8472',
      doctorName: 'Dr. Rahul Sharma',
      hospital: 'Apollo Specialty Hospital',
      specialization: 'Internal Medicine',
      status: 'active', // 'active', 'used', 'revoked'
      generatedAt: '2026-09-01T10:00:00.000Z',
      assignedDoctorId: 'DOC-101',
      notes: 'Issued by Admin for Apollo Chief Physician'
    },
    {
      id: 'DKEY-2',
      keyCode: 'DOC-KEY-5219',
      doctorName: 'Dr. Priya Kumar',
      hospital: 'Fortis Memorial Healthcare',
      specialization: 'Gastroenterology',
      status: 'active',
      generatedAt: '2026-09-10T12:30:00.000Z',
      assignedDoctorId: 'DOC-102',
      notes: 'Issued by Admin for Fortis Digestive Clinic'
    },
    {
      id: 'DKEY-3',
      keyCode: 'DOC-KEY-9941',
      doctorName: 'New Doctor Authorization',
      hospital: 'AIIMS / City Medical Center',
      specialization: 'General Medicine',
      status: 'active', // Available for new doctor signup!
      generatedAt: '2026-10-02T16:00:00.000Z',
      assignedDoctorId: null,
      notes: 'Unassigned special license key for onboarding demo'
    },
    {
      id: 'DKEY-4',
      keyCode: 'DOC-KEY-3108',
      doctorName: 'Dr. Vikram Seth',
      hospital: 'City Urgent Care Center',
      specialization: 'Emergency Medicine',
      status: 'revoked',
      generatedAt: '2026-08-15T09:00:00.000Z',
      assignedDoctorId: 'DOC-999',
      notes: 'Revoked by Admin due to expired credential audit'
    }
  ],

  // Registered Patients List
  registeredPatients: [
    {
      id: 'MV-88219',
      fullName: 'Aarav Patel',
      dob: '1992-05-14',
      age: 34,
      gender: 'Male',
      bloodGroup: 'O+',
      phone: '+91 98201 45890',
      email: 'aarav.patel@healthmail.com',
      address: '402, Green Meadows, Outer Ring Road, Bangalore, Karnataka - 560103',
      photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      status: 'Active',
      registeredDate: '2026-06-12',
      
      // Emergency Info
      emergencyContact: 'Ananya Patel',
      emergencyPhone: '+91 98201 45899',
      emergencyRelation: 'Spouse',
      
      // Medical Information
      allergies: ['Penicillin', 'Sulfa Drugs', 'Aspirin (Mild Gastric Irritation)'],
      existingConditions: ['Type 2 Diabetes (Well-controlled)', 'Mild Intermittent Asthma', 'Hypertension Stage 1'],
      currentMedications: [
        { name: 'Metformin', dosage: '500 mg', frequency: 'Twice daily', timing: 'After food', condition: 'Diabetes' },
        { name: 'Telmisartan', dosage: '40 mg', frequency: 'Once daily (Morning)', timing: 'Before food', condition: 'Hypertension' },
        { name: 'Montelukast', dosage: '10 mg', frequency: 'Once at night', timing: 'Bedtime', condition: 'Asthma' }
      ],
      previousSurgeries: [
        { procedure: 'Laparoscopic Appendectomy', hospital: 'Manipal Hospital, Bangalore', date: '12 Nov 2021', surgeon: 'Dr. Suresh Rao' },
        { procedure: 'Deviated Septum Correction (Septoplasty)', hospital: 'Apollo Speciality', date: '04 Mar 2018', surgeon: 'Dr. K. Nair' }
      ],
      familyMedicalHistory: [
        { relation: 'Father', conditions: 'Coronary Artery Disease, Hypertension' },
        { relation: 'Mother', conditions: 'Type 2 Diabetes' },
        { relation: 'Maternal Grandfather', conditions: 'Stroke at age 72' }
      ]
    },
    {
      id: 'MV-91420',
      fullName: 'Meera Iyer',
      dob: '1988-11-20',
      age: 38,
      gender: 'Female',
      bloodGroup: 'B+',
      phone: '+91 98112 34567',
      email: 'meera.iyer@healthmail.com',
      address: '12-B, Indiranagar, Bangalore, Karnataka - 560038',
      photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      status: 'Active',
      registeredDate: '2026-07-19',
      emergencyContact: 'Karthik Iyer',
      emergencyPhone: '+91 98112 34568',
      emergencyRelation: 'Spouse',
      allergies: ['Ciprofloxacin', 'Shellfish'],
      existingConditions: ['Hypothyroidism', 'PCOS'],
      currentMedications: [
        { name: 'Levothyroxine', dosage: '50 mcg', frequency: 'Once daily', timing: 'Empty stomach', condition: 'Hypothyroidism' }
      ],
      previousSurgeries: [],
      familyMedicalHistory: [
        { relation: 'Mother', conditions: 'Hypothyroidism, Arthritis' }
      ]
    }
  ],

  // Registered Doctors List
  registeredDoctors: [
    {
      id: 'DOC-101',
      name: 'Dr. Rahul Sharma',
      qualification: 'MBBS, MD (Internal Medicine)',
      specialization: 'Internal Medicine & Critical Care',
      hospital: 'Apollo Specialty Hospital',
      department: 'General & Internal Medicine',
      registrationNumber: 'MCI-2019-84729',
      phone: '+91 98450 12345',
      email: 'dr.sharma@apollohealth.org',
      assignedKey: 'DOC-KEY-8472',
      status: 'Verified & Active',
      registeredDate: '2026-04-10',
      totalConsultations: 148,
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80'
    },
    {
      id: 'DOC-102',
      name: 'Dr. Priya Kumar',
      qualification: 'MBBS, MS, DNB (Gastroenterology)',
      specialization: 'Gastroenterology & Hepatology',
      hospital: 'Fortis Memorial Healthcare',
      department: 'Digestive Diseases Institute',
      registrationNumber: 'MCI-2016-52190',
      phone: '+91 98711 99882',
      email: 'dr.priyakumar@fortishealth.com',
      assignedKey: 'DOC-KEY-5219',
      status: 'Verified & Active',
      registeredDate: '2026-05-18',
      totalConsultations: 92,
      avatar: 'https://images.unsplash.com/photo-1594824813587-68b31a317424?auto=format&fit=crop&w=200&q=80'
    }
  ],

  // Security & Consent: Access Grants and Audit History
  accessGrants: [
    {
      id: 'GRANT-901',
      accessCode: 'MV-9482',
      patientId: 'MV-88219',
      patientName: 'Aarav Patel',
      doctorId: 'DOC-101',
      doctorName: 'Dr. Rahul Sharma',
      hospital: 'Apollo Specialty Hospital',
      scope: 'Full Medical History (Records, Rx, Consultations)',
      grantedAt: '2026-10-03T10:30:00.000Z',
      expiresAt: '2026-10-04T10:30:00.000Z',
      lastAccessedAt: '2026-10-03T11:15:22.000Z',
      status: 'active',
      notes: 'Consultation for viral fever and throat infection follow-up'
    },
    {
      id: 'GRANT-902',
      accessCode: 'MV-6104',
      patientId: 'MV-88219',
      patientName: 'Aarav Patel',
      doctorId: 'DOC-102',
      doctorName: 'Dr. Priya Kumar',
      hospital: 'Fortis Memorial Healthcare',
      scope: 'Diagnostic Reports & Prescriptions',
      grantedAt: '2026-09-15T09:00:00.000Z',
      expiresAt: '2026-09-16T09:00:00.000Z',
      lastAccessedAt: '2026-09-15T10:45:00.000Z',
      status: 'expired',
      notes: 'Consultation for recurrent gastric discomfort'
    },
    {
      id: 'GRANT-903',
      accessCode: 'MV-3329',
      patientId: 'MV-88219',
      patientName: 'Aarav Patel',
      doctorId: 'DOC-999',
      doctorName: 'Dr. Vikram Seth',
      hospital: 'City Urgent Care Center',
      scope: 'Emergency Vitals & Allergies',
      grantedAt: '2026-08-20T14:10:00.000Z',
      expiresAt: '2026-08-21T14:10:00.000Z',
      lastAccessedAt: '2026-08-20T14:25:00.000Z',
      status: 'revoked',
      notes: 'Access revoked manually by patient after discharge'
    }
  ],

  // Medical Records / Reports
  medicalRecords: [
    {
      id: 'REC-1001',
      patientId: 'MV-88219',
      title: 'Complete Blood Count (CBC) Panel',
      type: 'Blood test',
      hospital: 'ABC Diagnostics & Reference Lab',
      doctor: 'Dr. Rahul Sharma',
      date: '2026-09-28',
      description: 'Routine complete blood count check. Mild lymphocytosis noted secondary to viral etiology. Hemoglobin 14.8 g/dL (Normal). Platelet count 210,000/mcL (Normal).',
      tags: ['Hematology', 'CBC', 'Normal Vitals', 'Routine Check'],
      fileName: 'CBC_Report_Aarav_28Sep2026.pdf',
      fileSize: '420 KB',
      parameters: [
        { name: 'Hemoglobin', value: '14.8 g/dL', normal: '13.5 - 17.5 g/dL', status: 'normal' },
        { name: 'Total Leukocyte Count (WBC)', value: '11,400 /mcL', normal: '4,000 - 11,000 /mcL', status: 'high' },
        { name: 'Platelet Count', value: '2.1 Lakh /mcL', normal: '1.5 - 4.5 Lakh /mcL', status: 'normal' },
        { name: 'Absolute Neutrophils', value: '62 %', normal: '40 - 75 %', status: 'normal' },
        { name: 'Lymphocytes', value: '34 %', normal: '20 - 40 %', status: 'normal' }
      ]
    },
    {
      id: 'REC-1002',
      patientId: 'MV-88219',
      title: 'Chest Radiograph (X-Ray PA View)',
      type: 'X-ray',
      hospital: 'Metro Imaging & Radiological Care',
      doctor: 'Dr. Anjali Verma, MD (Radiology)',
      date: '2026-08-10',
      description: 'Digital Chest X-Ray PA View. Bilateral lung fields appear well-expanded and clear. Costophrenic and cardiophrenic angles are sharp. Cardiothoracic ratio is normal (<0.5). Bony cage intact.',
      tags: ['Radiology', 'X-Ray', 'Chest PA', 'Lungs Clear'],
      fileName: 'Chest_XRay_PA_Aarav_10Aug2026.dcm.pdf',
      fileSize: '1.8 MB',
      parameters: [
        { name: 'Lung Parenchyma', value: 'Clear, no focal consolidation', normal: 'Clear', status: 'normal' },
        { name: 'Cardiothoracic Ratio', value: '46%', normal: '< 50%', status: 'normal' },
        { name: 'Pleural Spaces', value: 'No effusion seen', normal: 'Normal', status: 'normal' }
      ]
    },
    {
      id: 'REC-1003',
      patientId: 'MV-88219',
      title: 'Lipid Profile & Glycated Hemoglobin (HbA1c)',
      type: 'Blood test',
      hospital: 'HealthPlus Pathology Labs',
      doctor: 'Dr. Rahul Sharma',
      date: '2026-07-22',
      description: 'Comprehensive metabolic & lipid screening. Fasting Blood Sugar 112 mg/dL. HbA1c is 6.4% demonstrating good diabetic glycemic control under Metformin 500mg.',
      tags: ['Diabetes', 'Lipids', 'HbA1c', 'Metabolic Panel'],
      fileName: 'Lipid_HbA1c_Panel_July2026.pdf',
      fileSize: '512 KB',
      parameters: [
        { name: 'Fasting Plasma Glucose', value: '112 mg/dL', normal: '70 - 99 mg/dL', status: 'borderline' },
        { name: 'HbA1c (Glycated Hb)', value: '6.4 %', normal: '< 5.7 % (Target < 7% diabetic)', status: 'controlled' },
        { name: 'Total Cholesterol', value: '184 mg/dL', normal: '< 200 mg/dL', status: 'normal' },
        { name: 'Triglycerides', value: '158 mg/dL', normal: '< 150 mg/dL', status: 'borderline' },
        { name: 'HDL (Good Cholesterol)', value: '48 mg/dL', normal: '> 40 mg/dL', status: 'normal' },
        { name: 'LDL (Bad Cholesterol)', value: '104 mg/dL', normal: '< 100 mg/dL', status: 'normal' }
      ]
    },
    {
      id: 'REC-1004',
      patientId: 'MV-88219',
      title: 'Ultrasound Whole Abdomen & Pelvis',
      type: 'Ultrasound',
      hospital: 'Fortis Memorial Healthcare',
      doctor: 'Dr. Priya Kumar',
      date: '2026-05-18',
      description: 'Sonographic evaluation of abdomen. Liver shows mild Grade I diffuse fatty infiltration. Gallbladder normal without calculi. Kidneys normal cortical thickness. Appendix surgically absent.',
      tags: ['Ultrasound', 'Abdomen', 'Fatty Liver Grade 1', 'Normal Gallbladder'],
      fileName: 'USG_Abdomen_Aarav_May2026.pdf',
      fileSize: '2.1 MB',
      parameters: [
        { name: 'Liver Echotexture', value: 'Mild Grade 1 Fatty Changes', normal: 'Normal homogeneous', status: 'borderline' },
        { name: 'Gallbladder', value: 'Acalculous, thin walled', normal: 'Normal', status: 'normal' }
      ]
    },
    {
      id: 'REC-1005',
      patientId: 'MV-88219',
      title: 'Discharge Summary - Laparoscopic Appendectomy',
      type: 'Hospital discharge summaries',
      hospital: 'Manipal Hospital, Bangalore',
      doctor: 'Dr. Suresh Rao, MS (General Surgery)',
      date: '2021-11-15',
      description: 'Admitted with acute appendicitis. Underwent uneventful laparoscopic appendectomy under GA. Post-operative recovery smooth. Sutures removed on post-op day 7.',
      tags: ['Surgery', 'Discharge Summary', 'Appendectomy', 'Post-Op Clear'],
      fileName: 'Discharge_Summary_Appendectomy_2021.pdf',
      fileSize: '1.2 MB',
      parameters: [
        { name: 'Hospitalization Duration', value: '3 Days (12-15 Nov 2021)', normal: 'N/A', status: 'normal' }
      ]
    }
  ],

  // Digital Prescriptions
  prescriptions: [
    {
      id: 'RX-2026-8801',
      date: '2026-10-03',
      time: '11:20 AM',
      doctorId: 'DOC-101',
      doctorName: 'Dr. Rahul Sharma',
      qualification: 'MBBS, MD (Internal Medicine)',
      specialization: 'Internal Medicine & Critical Care',
      hospital: 'Apollo Specialty Hospital',
      registrationNumber: 'MCI-2019-84729',
      patientId: 'MV-88219',
      patientName: 'Aarav Patel',
      age: 34,
      gender: 'Male',
      bloodGroup: 'O+',
      chiefComplaint: 'High grade fever (101.5°F), throat pain, body aches and dry cough for 3 days.',
      symptoms: 'Pharyngeal erythema, dry cough, body aches, no chest crepitations.',
      diagnosis: 'Acute Viral Pharyngitis with Upper Respiratory Infection',
      doctorNotes: 'Patient has documented Penicillin allergy. Prescribed alternative macrolide and antipyretic.',
      medicines: [
        {
          name: 'Paracetamol',
          dosage: '650 mg',
          frequency: '1 tablet 3 times a day (after meals)',
          duration: '5 days',
          timing: 'After food',
          instructions: 'Take when temperature exceeds 99.5°F'
        },
        {
          name: 'Azithromycin',
          dosage: '500 mg',
          frequency: '1 tablet once daily',
          duration: '3 days',
          timing: '1 hour before food',
          instructions: 'Complete full 3-day course without skipping'
        },
        {
          name: 'Levocetirizine + Montelukast',
          dosage: '5 mg / 10 mg',
          frequency: '1 tablet once at bedtime',
          duration: '5 days',
          timing: 'Bedtime',
          instructions: 'May cause mild drowsiness'
        }
      ],
      dietAdvice: 'Warm soups, light semi-solid diet, warm hydration.',
      restAdvice: 'Strict bed rest for 48 hours.',
      followUpDate: '2026-10-08 (5 days)',
      testsRecommended: 'If fever persists past day 5, repeat CBC and Dengue NS1.'
    },
    {
      id: 'RX-2026-7490',
      date: '2026-09-15',
      time: '10:50 AM',
      doctorId: 'DOC-102',
      doctorName: 'Dr. Priya Kumar',
      qualification: 'MBBS, MS, DNB (Gastroenterology)',
      specialization: 'Gastroenterology & Hepatology',
      hospital: 'Fortis Memorial Healthcare',
      registrationNumber: 'MCI-2016-52190',
      patientId: 'MV-88219',
      patientName: 'Aarav Patel',
      age: 34,
      gender: 'Male',
      bloodGroup: 'O+',
      chiefComplaint: 'Epigastric burning sensation, postprandial fullness, acid regurgitation.',
      symptoms: 'Mild tenderness in epigastrium, bloating, occasional water brash.',
      diagnosis: 'Acute Gastritis / Gastroesophageal Reflux Disease (GERD)',
      doctorNotes: 'Advised lifestyle modification, avoid late night screen time and caffeine.',
      medicines: [
        {
          name: 'Pantoprazole + Domperidone (Pan-D)',
          dosage: '40 mg / 30 mg',
          frequency: '1 capsule once daily in morning',
          duration: '14 days',
          timing: 'Empty stomach (30 mins before breakfast)',
          instructions: 'Swallow whole with a glass of water'
        }
      ],
      dietAdvice: 'Avoid spicy foods, black tea, chocolates, and carbonated drinks.',
      restAdvice: 'Do not lie down immediately after meals.',
      followUpDate: '2026-09-29 (2 weeks)',
      testsRecommended: 'H. Pylori Stool Antigen test if symptoms persist.'
    }
  ],

  // Recent Medical Activity Timeline
  timeline: [
    {
      id: 'TL-101',
      date: '2026-10-03',
      title: 'Consultation & Digital Prescription Issued',
      doctor: 'Dr. Rahul Sharma',
      hospital: 'Apollo Specialty Hospital',
      category: 'consultation',
      diagnosis: 'Viral Pharyngitis & Fever',
      summary: 'Diagnosed with acute viral pharyngitis. Prescribed Paracetamol 650mg, Azithromycin 500mg. Follow-up scheduled for 5 days.',
      icon: 'stethoscope',
      relatedId: 'RX-2026-8801'
    },
    {
      id: 'TL-102',
      date: '2026-09-28',
      title: 'Complete Blood Count (CBC) Uploaded',
      doctor: 'ABC Diagnostics',
      hospital: 'ABC Diagnostics Lab',
      category: 'report',
      diagnosis: 'Routine Blood Test',
      summary: 'CBC Report showing Hb 14.8 g/dL and WBC 11,400 /mcL uploaded to MediVault.',
      icon: 'file-text',
      relatedId: 'REC-1001'
    },
    {
      id: 'TL-103',
      date: '2026-09-15',
      title: 'Consultation for Acute Gastritis',
      doctor: 'Dr. Priya Kumar',
      hospital: 'Fortis Memorial Healthcare',
      category: 'consultation',
      diagnosis: 'Acute Gastritis / GERD',
      summary: 'Prescribed Pantoprazole. Advised dietary modifications.',
      icon: 'stethoscope',
      relatedId: 'RX-2026-7490'
    },
    {
      id: 'TL-104',
      date: '2026-08-10',
      title: 'Chest X-Ray PA View Uploaded',
      doctor: 'Dr. Anjali Verma',
      hospital: 'Metro Imaging & Radiological Care',
      category: 'report',
      diagnosis: 'Clear Lung Fields',
      summary: 'Radiology report confirmed normal lung parenchyma and cardiac silhouette.',
      icon: 'file-text',
      relatedId: 'REC-1002'
    }
  ],

  // Notifications
  notifications: [
    {
      id: 'NOTIF-1',
      title: 'Doctor Access Granted',
      message: 'Access granted to Dr. Rahul Sharma (Apollo Hospital) with code MV-9482.',
      time: '2 hours ago',
      read: false,
      type: 'security'
    },
    {
      id: 'NOTIF-2',
      title: 'New Digital Prescription',
      message: 'Dr. Rahul Sharma issued a prescription for Viral Pharyngitis.',
      time: '1 hour ago',
      read: false,
      type: 'prescription'
    }
  ],

  // AI Chat History
  chatHistory: []
};

class MediVaultStore {
  constructor() {
    this.state = this.loadState();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Could not read from localStorage, using initial mock data.', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Error saving state to localStorage', e);
    }
  }

  resetDemoData() {
    this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this.saveState();
  }

  // ----------------------------------------------------
  // Authentication & Sessions
  // ----------------------------------------------------
  getCurrentUser() {
    return this.state.currentUser;
  }

  setCurrentUser(userObj) {
    this.state.currentUser = userObj;
    this.saveState();
  }

  logout() {
    this.state.currentUser = null;
    this.saveState();
  }

  // Patient OTP System
  requestPatientOtp(contact) {
    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.state.activeOtpCode = otp;
    this.state.activeOtpTarget = contact;
    this.saveState();

    return {
      success: true,
      otp,
      target: contact,
      message: `OTP sent to ${contact}. For demo convenience, your OTP is: ${otp}`
    };
  }

  verifyPatientOtp(contact, enteredOtp, isSignUp = false, newPatientData = {}) {
    const cleanEntered = (enteredOtp || '').trim();
    const cleanStored = (this.state.activeOtpCode || '').trim();

    // Verify against active stored OTP, master codes, or valid 6-digit numeric string
    const isMatch = cleanEntered === cleanStored || 
                    cleanEntered === '123456' || 
                    cleanEntered === '000000' ||
                    (cleanEntered.length === 6 && /^\d+$/.test(cleanEntered));

    if (!isMatch) {
      return { success: false, reason: 'Invalid OTP entered. Please check the 6-digit code.' };
    }

    let patient = null;

    if (isSignUp) {
      const newId = 'MV-' + Math.floor(10000 + Math.random() * 90000);
      patient = {
        id: newId,
        fullName: newPatientData.fullName || 'New Patient',
        dob: newPatientData.dob || '1995-01-01',
        age: newPatientData.age ? parseInt(newPatientData.age, 10) : 30,
        gender: newPatientData.gender || 'Other',
        bloodGroup: newPatientData.bloodGroup || 'O+',
        phone: newPatientData.phone || contact,
        email: newPatientData.email || contact,
        address: newPatientData.address || 'Address on file',
        photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        status: 'Active',
        registeredDate: new Date().toISOString().split('T')[0],
        emergencyContact: newPatientData.emergencyContact || 'Emergency Contact',
        emergencyPhone: newPatientData.emergencyPhone || contact,
        emergencyRelation: newPatientData.emergencyRelation || 'Family',
        allergies: newPatientData.allergies ? (Array.isArray(newPatientData.allergies) ? newPatientData.allergies : newPatientData.allergies.split(',').map(s=>s.trim()).filter(Boolean)) : ['No documented allergies'],
        existingConditions: newPatientData.existingConditions ? (Array.isArray(newPatientData.existingConditions) ? newPatientData.existingConditions : newPatientData.existingConditions.split(',').map(s=>s.trim()).filter(Boolean)) : [],
        currentMedications: [],
        previousSurgeries: [],
        familyMedicalHistory: []
      };

      this.state.registeredPatients.unshift(patient);
    } else {
      // Find existing patient by email or phone, or default to Aarav Patel
      const cleanContactDigits = (contact || '').replace(/[^0-9]/g, '');
      patient = this.state.registeredPatients.find(p => {
        if (!contact) return false;
        const pDigits = (p.phone || '').replace(/[^0-9]/g, '');
        return (cleanContactDigits && pDigits.includes(cleanContactDigits)) ||
               (p.email && p.email.toLowerCase() === contact.toLowerCase());
      }) || this.state.registeredPatients[0];
    }

    const sessionUser = {
      role: 'patient',
      id: patient.id,
      name: patient.fullName,
      email: patient.email,
      phone: patient.phone,
      data: patient
    };

    this.setCurrentUser(sessionUser);
    this.saveState();

    return { success: true, user: sessionUser };
  }

  // Doctor Auth via Admin-Issued Special Key
  verifyDoctorLogin({ name, phone, hospital, keyCode, isSignUp = false, newDoctorData = {} }) {
    if (!keyCode) {
      return { success: false, reason: 'Special Doctor License Key is required.' };
    }

    const cleanKey = keyCode.trim().toUpperCase();
    const keyRecord = this.state.doctorKeys.find(k => k.keyCode.toUpperCase() === cleanKey);

    if (!keyRecord) {
      return { success: false, reason: 'Invalid Doctor Key. This key does not exist in the MediVault Admin Registry.' };
    }

    if (keyRecord.status === 'revoked') {
      return { success: false, reason: 'Access Denied: This Doctor Key was revoked by the System Administrator.' };
    }

    let doctor = null;

    if (isSignUp) {
      const newDocId = 'DOC-' + Math.floor(100 + Math.random() * 900);
      doctor = {
        id: newDocId,
        name: newDoctorData.name || name || 'Dr. Registered Physician',
        qualification: newDoctorData.qualification || 'MBBS, MD',
        specialization: newDoctorData.specialization || keyRecord.specialization || 'Internal Medicine',
        hospital: newDoctorData.hospital || hospital || keyRecord.hospital,
        department: 'Clinical Care',
        registrationNumber: newDoctorData.registrationNumber || `MCI-2026-${Math.floor(10000 + Math.random() * 90000)}`,
        phone: newDoctorData.phone || phone || '+91 98000 00000',
        email: newDoctorData.email || `${(name || 'doctor').toLowerCase().replace(/[^a-z]/g, '')}@medivault.health`,
        assignedKey: cleanKey,
        status: 'Verified & Active',
        registeredDate: new Date().toISOString().split('T')[0],
        totalConsultations: 0,
        avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80'
      };

      keyRecord.status = 'used';
      keyRecord.assignedDoctorId = newDocId;
      keyRecord.doctorName = doctor.name;
      this.state.registeredDoctors.unshift(doctor);
    } else {
      // Find existing doctor linked with this key or by name/hospital
      doctor = this.state.registeredDoctors.find(d => d.assignedKey === cleanKey) ||
               this.state.registeredDoctors.find(d => name && d.name.toLowerCase().includes(name.toLowerCase())) ||
               this.state.registeredDoctors[0];
    }

    const sessionUser = {
      role: 'doctor',
      id: doctor.id,
      name: doctor.name,
      email: doctor.email,
      phone: doctor.phone,
      hospital: doctor.hospital,
      specialization: doctor.specialization,
      data: doctor
    };

    this.setCurrentUser(sessionUser);
    this.saveState();

    return { success: true, user: sessionUser };
  }

  // Admin Login
  verifyAdminLogin(email, masterKey) {
    if (masterKey !== this.state.admin.masterKey) {
      return { success: false, reason: 'Invalid Master Security Key for MediVault Administration.' };
    }

    const sessionUser = {
      role: 'admin',
      id: this.state.admin.id,
      name: this.state.admin.name,
      email: this.state.admin.email,
      data: this.state.admin
    };

    this.setCurrentUser(sessionUser);
    this.saveState();

    return { success: true, user: sessionUser };
  }

  // ----------------------------------------------------
  // Admin Features: Key Generation & Management
  // ----------------------------------------------------
  getDoctorKeys() {
    return [...this.state.doctorKeys];
  }

  generateDoctorKey({ doctorName, hospital, specialization, notes }) {
    const randomCode = 'DOC-KEY-' + Math.floor(1000 + Math.random() * 9000);
    const newKey = {
      id: 'DKEY-' + (this.state.doctorKeys.length + 1),
      keyCode: randomCode,
      doctorName: doctorName || 'Authorized Physician',
      hospital: hospital || 'General Hospital / Clinic',
      specialization: specialization || 'General Medicine',
      status: 'active',
      generatedAt: new Date().toISOString(),
      assignedDoctorId: null,
      notes: notes || 'Admin issued license key for doctor login.'
    };

    this.state.doctorKeys.unshift(newKey);
    this.addNotification({
      title: 'New Doctor Key Issued',
      message: `Admin generated Key ${newKey.keyCode} for ${newKey.hospital}.`,
      type: 'security'
    });

    this.saveState();
    return newKey;
  }

  revokeDoctorKey(keyId) {
    const key = this.state.doctorKeys.find(k => k.id === keyId || k.keyCode === keyId);
    if (key) {
      key.status = 'revoked';
      this.addNotification({
        title: 'Doctor Key Revoked',
        message: `Admin revoked access key ${key.keyCode} for ${key.doctorName}.`,
        type: 'security'
      });
      this.saveState();
      return true;
    }
    return false;
  }

  // Admin Insights & Metrics
  getAdminInsights() {
    const totalPatients = this.state.registeredPatients.length;
    const totalDoctors = this.state.registeredDoctors.length;
    const totalKeys = this.state.doctorKeys.length;
    const activeKeys = this.state.doctorKeys.filter(k => k.status === 'active').length;
    const totalRecords = this.state.medicalRecords.length;
    const totalRx = this.state.prescriptions.length;
    const activeConsentGrants = this.state.accessGrants.filter(g => {
      const isExpired = new Date() > new Date(g.expiresAt) || g.status === 'expired';
      return !isExpired && g.status !== 'revoked';
    }).length;

    // Categorized breakdown
    const recordsByType = {};
    this.state.medicalRecords.forEach(r => {
      recordsByType[r.type] = (recordsByType[r.type] || 0) + 1;
    });

    return {
      totalPatients,
      totalDoctors,
      totalKeys,
      activeKeys,
      totalRecords,
      totalRx,
      activeConsentGrants,
      recordsByType,
      recentAudits: this.state.accessGrants.slice(0, 5)
    };
  }

  // Patient Profile Access
  getPatient() {
    if (this.state.currentUser && this.state.currentUser.role === 'patient') {
      const current = this.state.registeredPatients.find(p => p.id === this.state.currentUser.id);
      if (current) return current;
    }
    return this.state.registeredPatients[0];
  }

  getRegisteredPatients() {
    return [...this.state.registeredPatients];
  }

  updatePatient(updatedFields) {
    const current = this.getPatient();
    Object.assign(current, updatedFields);
    this.saveState();
    return current;
  }

  // Doctor Access
  getCurrentDoctor() {
    if (this.state.currentUser && this.state.currentUser.role === 'doctor') {
      const current = this.state.registeredDoctors.find(d => d.id === this.state.currentUser.id);
      if (current) return current;
    }
    return this.state.registeredDoctors[0];
  }

  getRegisteredDoctors() {
    return [...this.state.registeredDoctors];
  }

  // Records, Prescriptions & Timeline
  getRecords() {
    return [...this.state.medicalRecords];
  }

  addRecord(record) {
    const newRecord = {
      id: 'REC-' + Math.floor(1000 + Math.random() * 9000),
      patientId: this.getPatient().id,
      date: record.date || new Date().toISOString().split('T')[0],
      parameters: record.parameters || [],
      ...record
    };
    this.state.medicalRecords.unshift(newRecord);
    this.addTimelineEvent({
      title: `${newRecord.title} Uploaded`,
      doctor: newRecord.hospital || 'Patient Upload',
      hospital: newRecord.hospital || 'MediVault Vault',
      category: 'report',
      diagnosis: newRecord.type,
      summary: newRecord.description || `Uploaded ${newRecord.type} document to digital health vault.`,
      icon: 'file-text',
      relatedId: newRecord.id
    });
    this.saveState();
    return newRecord;
  }

  deleteRecord(id) {
    this.state.medicalRecords = this.state.medicalRecords.filter(r => r.id !== id);
    this.saveState();
  }

  getPrescriptions() {
    return [...this.state.prescriptions];
  }

  addPrescription(rxData) {
    const now = new Date();
    const newRx = {
      id: 'RX-' + now.getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000),
      date: rxData.date || now.toISOString().split('T')[0],
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...rxData
    };
    this.state.prescriptions.unshift(newRx);

    // Update active medications
    const patient = this.getPatient();
    if (rxData.medicines && rxData.medicines.length > 0) {
      rxData.medicines.forEach(med => {
        const existing = patient.currentMedications.find(m => m.name.toLowerCase() === med.name.toLowerCase());
        if (!existing) {
          patient.currentMedications.unshift({
            name: med.name,
            dosage: med.dosage,
            frequency: med.frequency,
            timing: med.timing,
            condition: rxData.diagnosis || 'Prescribed Medication'
          });
        }
      });
    }

    this.addTimelineEvent({
      title: `Consultation & Digital Prescription Issued`,
      doctor: newRx.doctorName,
      hospital: newRx.hospital,
      category: 'consultation',
      diagnosis: newRx.diagnosis,
      summary: `Diagnosis: ${newRx.diagnosis}. Prescribed ${newRx.medicines.map(m => m.name).join(', ')}. Follow-up: ${newRx.followUpDate || 'As advised'}.`,
      icon: 'stethoscope',
      relatedId: newRx.id
    });

    this.saveState();
    return newRx;
  }

  // Consent & Access Grants
  getAccessGrants() {
    return [...this.state.accessGrants];
  }

  createAccessGrant({ scope, durationHours = 24, doctorName = 'Authorized Doctor', hospital = 'Clinic / Hospital' }) {
    const code = `MV-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const expiry = new Date(now.getTime() + durationHours * 60 * 60 * 1000);
    const patient = this.getPatient();

    const newGrant = {
      id: 'GRANT-' + Math.floor(100 + Math.random() * 900),
      accessCode: code,
      patientId: patient.id,
      patientName: patient.fullName,
      doctorId: 'DOC-TEMP',
      doctorName: doctorName,
      hospital: hospital,
      scope: scope || 'Full Medical History',
      grantedAt: now.toISOString(),
      expiresAt: expiry.toISOString(),
      lastAccessedAt: 'Not accessed yet',
      status: 'active',
      notes: `Temporary ${durationHours}h authorization generated by patient.`
    };

    this.state.accessGrants.unshift(newGrant);
    this.saveState();
    return newGrant;
  }

  verifyDoctorAccess(accessCode, patientId) {
    const grant = this.state.accessGrants.find(
      g => g.accessCode.trim().toUpperCase() === accessCode.trim().toUpperCase() &&
           (!patientId || g.patientId.toUpperCase() === patientId.trim().toUpperCase())
    );

    if (!grant) {
      return { success: false, reason: 'Invalid Access Code. Patient consent record not found.' };
    }

    if (grant.status === 'revoked') {
      return { success: false, reason: 'Access Denied: Patient revoked authorization for this code.' };
    }

    const now = new Date();
    const expiry = new Date(grant.expiresAt);
    if (now > expiry || grant.status === 'expired') {
      grant.status = 'expired';
      this.saveState();
      return { success: false, reason: 'Access Denied: Temporary authorization has expired.' };
    }

    grant.lastAccessedAt = now.toISOString();
    grant.status = 'active';
    this.saveState();

    const patient = this.state.registeredPatients.find(p => p.id === grant.patientId) || this.getPatient();
    return { success: true, grant, patient };
  }

  revokeAccessGrant(grantId) {
    const grant = this.state.accessGrants.find(g => g.id === grantId);
    if (grant) {
      grant.status = 'revoked';
      this.saveState();
      return true;
    }
    return false;
  }

  getTimeline() {
    return [...this.state.timeline].sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  addTimelineEvent(event) {
    const newEvent = {
      id: 'TL-' + Math.floor(1000 + Math.random() * 9000),
      date: new Date().toISOString().split('T')[0],
      ...event
    };
    this.state.timeline.unshift(newEvent);
    this.saveState();
    return newEvent;
  }

  getNotifications() {
    return [...this.state.notifications];
  }

  addNotification(notif) {
    const newNotif = {
      id: 'NOTIF-' + Date.now(),
      time: 'Just now',
      read: false,
      ...notif
    };
    this.state.notifications.unshift(newNotif);
    this.saveState();
  }

  markAllNotificationsRead() {
    this.state.notifications.forEach(n => n.read = true);
    this.saveState();
  }
}

window.mediStore = new MediVaultStore();
