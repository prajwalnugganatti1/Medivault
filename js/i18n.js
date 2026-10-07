/**
 * Patient Portal language support.
 * Translates text nodes and placeholders inside the patient nav and patient views,
 * including content rendered later by other controllers (via MutationObserver).
 */
(function () {
  const STORAGE_KEY = 'medivault_patient_lang';
  const ROOT_IDS = ['nav-patient', 'patient-views-container'];

  const LANGUAGES = {
    en: { label: 'English', htmlLang: 'en' },
    hi: { label: 'हिन्दी', htmlLang: 'hi' },
    kn: { label: 'ಕನ್ನಡ', htmlLang: 'kn' },
    ta: { label: 'தமிழ்', htmlLang: 'ta' }
  };

  // English string -> [Hindi, Kannada, Tamil]
  const D = {
    // Navigation
    'Dashboard': ['डैशबोर्ड', 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', 'டாஷ்போர்டு'],
    'Medical Records': ['मेडिकल रिकॉर्ड', 'ವೈದ್ಯಕೀಯ ದಾಖಲೆಗಳು', 'மருத்துவ பதிவுகள்'],
    'Prescriptions': ['प्रिस्क्रिप्शन', 'ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್‌ಗಳು', 'மருந்துச் சீட்டுகள்'],
    'Consent & Access': ['सहमति और एक्सेस', 'ಸಮ್ಮತಿ ಮತ್ತು ಪ್ರವೇಶ', 'ஒப்புதல் & அணுகல்'],
    'Health Profile': ['स्वास्थ्य प्रोफ़ाइल', 'ಆರೋಗ್ಯ ಪ್ರೊಫೈಲ್', 'சுகாதார சுயவிவரம்'],
    'Timeline': ['टाइमलाइन', 'ಕಾಲಾನುಕ್ರಮ', 'காலவரிசை'],
    'Appointments': ['अपॉइंटमेंट', 'ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗಳು', 'சந்திப்புகள்'],
    'Language': ['भाषा', 'ಭಾಷೆ', 'மொழி'],

    // Dashboard
    'Good morning': ['सुप्रभात', 'ಶುಭೋದಯ', 'காலை வணக்கம்'],
    'Good afternoon': ['नमस्कार', 'ಶುಭ ಮಧ್ಯಾಹ್ನ', 'மதிய வணக்கம்'],
    'Good evening': ['शुभ संध्या', 'ಶುಭ ಸಂಜೆ', 'மாலை வணக்கம்'],
    'MediVault Encrypted Profile • ABDM & HIPAA Aligned': ['MediVault एन्क्रिप्टेड प्रोफ़ाइल • ABDM और HIPAA अनुरूप', 'MediVault ಎನ್‌ಕ್ರಿಪ್ಟ್ ಮಾಡಿದ ಪ್ರೊಫೈಲ್ • ABDM ಮತ್ತು HIPAA ಅನುಗುಣ', 'MediVault மறையாக்கப்பட்ட சுயவிவரம் • ABDM & HIPAA இணக்கம்'],
    'Give Doctor Access': ['डॉक्टर को एक्सेस दें', 'ವೈದ್ಯರಿಗೆ ಪ್ರವೇಶ ನೀಡಿ', 'மருத்துவருக்கு அணுகல் வழங்கு'],
    'Upload Report': ['रिपोर्ट अपलोड करें', 'ವರದಿ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ', 'அறிக்கையை பதிவேற்று'],
    'Reports & Scans': ['रिपोर्ट और स्कैन', 'ವರದಿಗಳು ಮತ್ತು ಸ್ಕ್ಯಾನ್‌ಗಳು', 'அறிக்கைகள் & ஸ்கேன்கள்'],
    'Digital Prescriptions': ['डिजिटल प्रिस्क्रिप्शन', 'ಡಿಜಿಟಲ್ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್‌ಗಳು', 'டிஜிட்டல் மருந்துச் சீட்டுகள்'],
    'Digital Rx Issued': ['जारी डिजिटल Rx', 'ನೀಡಲಾದ ಡಿಜಿಟಲ್ Rx', 'வழங்கப்பட்ட டிஜிட்டல் Rx'],
    'Consultations': ['परामर्श', 'ಸಮಾಲೋಚನೆಗಳು', 'ஆலோசனைகள்'],
    'Recorded Visits': ['दर्ज विज़िट', 'ದಾಖಲಾದ ಭೇಟಿಗಳು', 'பதிவு செய்யப்பட்ட வருகைகள்'],
    'Active Medications': ['सक्रिय दवाएँ', 'ಸಕ್ರಿಯ ಔಷಧಿಗಳು', 'செயலில் உள்ள மருந்துகள்'],
    'Daily Regimens': ['दैनिक खुराक', 'ದೈನಂದಿನ ಕ್ರಮ', 'தினசரி முறைகள்'],
    'Quick Actions': ['त्वरित कार्य', 'ತ್ವರಿತ ಕ್ರಿಯೆಗಳು', 'விரைவு செயல்கள்'],
    'PDFs, Scans, Labs': ['PDF, स्कैन, लैब', 'PDF, ಸ್ಕ್ಯಾನ್, ಲ್ಯಾಬ್', 'PDF, ஸ்கேன், ஆய்வகம்'],
    'Add Prescription': ['प्रिस्क्रिप्शन जोड़ें', 'ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ಸೇರಿಸಿ', 'மருந்துச் சீட்டு சேர்'],
    'View or Upload': ['देखें या अपलोड करें', 'ನೋಡಿ ಅಥವಾ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ', 'பார் அல்லது பதிவேற்று'],
    'Share Records': ['रिकॉर्ड साझा करें', 'ದಾಖಲೆಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಿ', 'பதிவுகளைப் பகிர்'],
    'Generate QR / Code': ['QR / कोड बनाएँ', 'QR / ಕೋಡ್ ರಚಿಸಿ', 'QR / குறியீடு உருவாக்கு'],
    'Ask MediBot AI': ['MediBot AI से पूछें', 'MediBot AI ಅನ್ನು ಕೇಳಿ', 'MediBot AI-இடம் கேள்'],
    'Health Assistant': ['स्वास्थ्य सहायक', 'ಆರೋಗ್ಯ ಸಹಾಯಕ', 'சுகாதார உதவியாளர்'],
    'Medical Timeline': ['मेडिकल टाइमलाइन', 'ವೈದ್ಯಕೀಯ ಕಾಲಾನುಕ್ರಮ', 'மருத்துவ காலவரிசை'],
    'Full History': ['पूरा इतिहास', 'ಸಂಪೂರ್ಣ ಇತಿಹಾಸ', 'முழு வரலாறு'],
    'Recent Medical Activity': ['हाल की चिकित्सा गतिविधि', 'ಇತ್ತೀಚಿನ ವೈದ್ಯಕೀಯ ಚಟುವಟಿಕೆ', 'சமீபத்திய மருத்துவ செயல்பாடு'],
    'Chronological feed of your consultations and investigations': ['आपके परामर्श और जाँचों का क्रमवार विवरण', 'ನಿಮ್ಮ ಸಮಾಲೋಚನೆಗಳು ಮತ್ತು ಪರೀಕ್ಷೆಗಳ ಕಾಲಾನುಕ್ರಮ ಪಟ್ಟಿ', 'உங்கள் ஆலோசனைகள் மற்றும் பரிசோதனைகளின் கால வரிசை'],
    'View All': ['सभी देखें', 'ಎಲ್ಲವನ್ನೂ ನೋಡಿ', 'அனைத்தையும் பார்'],
    'CONSULTATION': ['परामर्श', 'ಸಮಾಲೋಚನೆ', 'ஆலோசனை'],
    'REPORT': ['रिपोर्ट', 'ವರದಿ', 'அறிக்கை'],
    'Emergency Info': ['आपातकालीन जानकारी', 'ತುರ್ತು ಮಾಹಿತಿ', 'அவசரத் தகவல்'],
    'Critical Drug Allergies:': ['गंभीर दवा एलर्जी:', 'ಗಂಭೀರ ಔಷಧ ಅಲರ್ಜಿಗಳು:', 'முக்கிய மருந்து ஒவ்வாமைகள்:'],
    'Patient Consent Active': ['रोगी सहमति सक्रिय', 'ರೋಗಿಯ ಸಮ್ಮತಿ ಸಕ್ರಿಯ', 'நோயாளி ஒப்புதல் செயலில்'],
    'Your Records Are Private': ['आपके रिकॉर्ड निजी हैं', 'ನಿಮ್ಮ ದಾಖಲೆಗಳು ಖಾಸಗಿಯಾಗಿವೆ', 'உங்கள் பதிவுகள் தனிப்பட்டவை'],
    'Create Doctor Access Code': ['डॉक्टर एक्सेस कोड बनाएँ', 'ವೈದ್ಯರ ಪ್ರವೇಶ ಕೋಡ್ ರಚಿಸಿ', 'மருத்துவர் அணுகல் குறியீடு உருவாக்கு'],

    // Records
    'Medical Records & Diagnostic Reports': ['मेडिकल रिकॉर्ड और जाँच रिपोर्ट', 'ವೈದ್ಯಕೀಯ ದಾಖಲೆಗಳು ಮತ್ತು ರೋಗನಿರ್ಣಯ ವರದಿಗಳು', 'மருத்துவ பதிவுகள் & பரிசோதனை அறிக்கைகள்'],
    'Upload Medical Document': ['मेडिकल दस्तावेज़ अपलोड करें', 'ವೈದ್ಯಕೀಯ ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ', 'மருத்துவ ஆவணத்தை பதிவேற்று'],
    'Sort: Newest First': ['क्रम: नवीनतम पहले', 'ವಿಂಗಡಣೆ: ಹೊಸದು ಮೊದಲು', 'வரிசை: புதியவை முதலில்'],
    'Sort: Oldest First': ['क्रम: सबसे पुराने पहले', 'ವಿಂಗಡಣೆ: ಹಳೆಯದು ಮೊದಲು', 'வரிசை: பழையவை முதலில்'],
    'Sort: Name (A-Z)': ['क्रम: नाम (A-Z)', 'ವಿಂಗಡಣೆ: ಹೆಸರು (A-Z)', 'வரிசை: பெயர் (A-Z)'],
    'All Records': ['सभी रिकॉर्ड', 'ಎಲ್ಲಾ ದಾಖಲೆಗಳು', 'அனைத்து பதிவுகள்'],
    'Blood Tests': ['रक्त जाँच', 'ರಕ್ತ ಪರೀಕ್ಷೆಗಳು', 'இரத்தப் பரிசோதனைகள்'],
    'X-Ray & Radiology': ['एक्स-रे और रेडियोलॉजी', 'ಎಕ್ಸ್-ರೇ ಮತ್ತು ರೇಡಿಯಾಲಜಿ', 'எக்ஸ்-ரே & கதிரியக்கவியல்'],
    'Ultrasound & Scans': ['अल्ट्रासाउंड और स्कैन', 'ಅಲ್ಟ್ರಾಸೌಂಡ್ ಮತ್ತು ಸ್ಕ್ಯಾನ್‌ಗಳು', 'அல்ட்ராசவுண்ட் & ஸ்கேன்கள்'],
    'Discharge Summaries': ['डिस्चार्ज सारांश', 'ಡಿಸ್ಚಾರ್ಜ್ ಸಾರಾಂಶಗಳು', 'வெளியேற்றச் சுருக்கங்கள்'],
    'Blood test': ['रक्त जाँच', 'ರಕ್ತ ಪರೀಕ್ಷೆ', 'இரத்தப் பரிசோதனை'],
    'X-ray': ['एक्स-रे', 'ಎಕ್ಸ್-ರೇ', 'எக்ஸ்-ரே'],
    'Ultrasound': ['अल्ट्रासाउंड', 'ಅಲ್ಟ್ರಾಸೌಂಡ್', 'அல்ட்ராசவுண்ட்'],
    'Hospital discharge summaries': ['अस्पताल डिस्चार्ज सारांश', 'ಆಸ್ಪತ್ರೆ ಡಿಸ್ಚಾರ್ಜ್ ಸಾರಾಂಶಗಳು', 'மருத்துவமனை வெளியேற்றச் சுருக்கங்கள்'],
    'View Details': ['विवरण देखें', 'ವಿವರಗಳನ್ನು ನೋಡಿ', 'விவரங்களைப் பார்'],
    'Search by test name, hospital, doctor, or tag...': ['जाँच, अस्पताल, डॉक्टर या टैग से खोजें...', 'ಪರೀಕ್ಷೆ, ಆಸ್ಪತ್ರೆ, ವೈದ್ಯರು ಅಥವಾ ಟ್ಯಾಗ್ ಮೂಲಕ ಹುಡುಕಿ...', 'சோதனை, மருத்துவமனை, மருத்துவர் அல்லது குறிச்சொல் மூலம் தேடு...'],

    // Prescriptions
    'Prescriptions Vault': ['प्रिस्क्रिप्शन वॉल्ट', 'ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್ ವಾಲ್ಟ್', 'மருந்துச் சீட்டு பெட்டகம்'],
    'Access digital doctor prescriptions, dosage instructions, and download printable PDFs.': ['डॉक्टर के डिजिटल प्रिस्क्रिप्शन, खुराक निर्देश देखें और प्रिंट योग्य PDF डाउनलोड करें।', 'ವೈದ್ಯರ ಡಿಜಿಟಲ್ ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್‌ಗಳು, ಡೋಸೇಜ್ ಸೂಚನೆಗಳನ್ನು ನೋಡಿ ಮತ್ತು ಮುದ್ರಿಸಬಹುದಾದ PDF ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ.', 'மருத்துவரின் டிஜிட்டல் மருந்துச் சீட்டுகள், அளவு வழிமுறைகளைப் பார்த்து அச்சிடக்கூடிய PDF-ஐ பதிவிறக்கவும்.'],
    'View Rx': ['Rx देखें', 'Rx ನೋಡಿ', 'Rx பார்'],
    'Download PDF': ['PDF डाउनलोड करें', 'PDF ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ', 'PDF பதிவிறக்கு'],
    'Next Recommended Follow-Up:': ['अगला अनुशंसित फ़ॉलो-अप:', 'ಮುಂದಿನ ಶಿಫಾರಸು ಮಾಡಿದ ಫಾಲೋ-ಅಪ್:', 'அடுத்த பரிந்துரைக்கப்பட்ட பின்தொடர்வு:'],

    // Consent & Access
    'Patient Consent Architecture': ['रोगी सहमति व्यवस्था', 'ರೋಗಿಯ ಸಮ್ಮತಿ ವ್ಯವಸ್ಥೆ', 'நோயாளி ஒப்புதல் அமைப்பு'],
    'Doctor Access & Permission Control': ['डॉक्टर एक्सेस और अनुमति नियंत्रण', 'ವೈದ್ಯರ ಪ್ರವೇಶ ಮತ್ತು ಅನುಮತಿ ನಿಯಂತ್ರಣ', 'மருத்துவர் அணுகல் & அனுமதி கட்டுப்பாடு'],
    'Generate New Access Code': ['नया एक्सेस कोड बनाएँ', 'ಹೊಸ ಪ್ರವೇಶ ಕೋಡ್ ರಚಿಸಿ', 'புதிய அணுகல் குறியீடு உருவாக்கு'],
    'Access Audit Trail': ['एक्सेस ऑडिट इतिहास', 'ಪ್ರವೇಶ ಲೆಕ್ಕಪರಿಶೋಧನಾ ದಾಖಲೆ', 'அணுகல் தணிக்கைப் பதிவு'],
    'History of authorized clinical sessions and doctors who accessed your vault': ['अधिकृत क्लिनिकल सत्रों और आपके वॉल्ट तक पहुँचने वाले डॉक्टरों का इतिहास', 'ಅಧಿಕೃತ ಕ್ಲಿನಿಕಲ್ ಅವಧಿಗಳು ಮತ್ತು ನಿಮ್ಮ ವಾಲ್ಟ್ ಪ್ರವೇಶಿಸಿದ ವೈದ್ಯರ ಇತಿಹಾಸ', 'அங்கீகரிக்கப்பட்ட மருத்துவ அமர்வுகள் மற்றும் உங்கள் பெட்டகத்தை அணுகிய மருத்துவர்களின் வரலாறு'],
    'Doctor & Access Code': ['डॉक्टर और एक्सेस कोड', 'ವೈದ್ಯರು ಮತ್ತು ಪ್ರವೇಶ ಕೋಡ್', 'மருத்துவர் & அணுகல் குறியீடு'],
    'Hospital / Clinic': ['अस्पताल / क्लिनिक', 'ಆಸ್ಪತ್ರೆ / ಕ್ಲಿನಿಕ್', 'மருத்துவமனை / மருத்துவகம்'],
    'Access Scope': ['एक्सेस दायरा', 'ಪ್ರವೇಶ ವ್ಯಾಪ್ತಿ', 'அணுகல் வரம்பு'],
    'Granted Date': ['अनुमति तिथि', 'ನೀಡಿದ ದಿನಾಂಕ', 'வழங்கிய தேதி'],
    'Expires': ['समाप्ति', 'ಅವಧಿ ಮುಕ್ತಾಯ', 'காலாவதி'],
    'Status': ['स्थिति', 'ಸ್ಥಿತಿ', 'நிலை'],
    'Actions': ['कार्य', 'ಕ್ರಿಯೆಗಳು', 'செயல்கள்'],
    'Expired': ['समाप्त', 'ಅವಧಿ ಮುಗಿದಿದೆ', 'காலாவதியானது'],
    'Active': ['सक्रिय', 'ಸಕ್ರಿಯ', 'செயலில்'],
    'Revoke': ['रद्द करें', 'ರದ್ದುಗೊಳಿಸಿ', 'திரும்பப் பெறு'],
    'Access Inactive': ['एक्सेस निष्क्रिय', 'ಪ್ರವೇಶ ನಿಷ್ಕ್ರಿಯ', 'அணுகல் செயலற்றது'],
    'Revoked': ['रद्द किया गया', 'ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ', 'திரும்பப் பெறப்பட்டது'],
    'Full Medical History (Records, Rx, Consultations)': ['पूरा चिकित्सा इतिहास (रिकॉर्ड, Rx, परामर्श)', 'ಸಂಪೂರ್ಣ ವೈದ್ಯಕೀಯ ಇತಿಹಾಸ (ದಾಖಲೆಗಳು, Rx, ಸಮಾಲೋಚನೆಗಳು)', 'முழு மருத்துவ வரலாறு (பதிவுகள், Rx, ஆலோசனைகள்)'],
    'Diagnostic Reports & Prescriptions': ['जाँच रिपोर्ट और प्रिस्क्रिप्शन', 'ರೋಗನಿರ್ಣಯ ವರದಿಗಳು ಮತ್ತು ಪ್ರಿಸ್ಕ್ರಿಪ್ಷನ್‌ಗಳು', 'பரிசோதனை அறிக்கைகள் & மருந்துச் சீட்டுகள்'],
    'Emergency Vitals & Allergies': ['आपातकालीन वाइटल्स और एलर्जी', 'ತುರ್ತು ಜೀವಸೂಚಕಗಳು ಮತ್ತು ಅಲರ್ಜಿಗಳು', 'அவசர உயிர்க்குறிகள் & ஒவ்வாமைகள்'],

    // Profile
    'Patient Health Profile': ['रोगी स्वास्थ्य प्रोफ़ाइल', 'ರೋಗಿಯ ಆರೋಗ್ಯ ಪ್ರೊಫೈಲ್', 'நோயாளி சுகாதார சுயவிவரம்'],
    'Manage personal demographics, critical allergies, emergency contacts, and family history.': ['व्यक्तिगत विवरण, गंभीर एलर्जी, आपातकालीन संपर्क और पारिवारिक इतिहास प्रबंधित करें।', 'ವೈಯಕ್ತಿಕ ವಿವರಗಳು, ಗಂಭೀರ ಅಲರ್ಜಿಗಳು, ತುರ್ತು ಸಂಪರ್ಕಗಳು ಮತ್ತು ಕುಟುಂಬದ ಇತಿಹಾಸವನ್ನು ನಿರ್ವಹಿಸಿ.', 'தனிப்பட்ட விவரங்கள், முக்கிய ஒவ்வாமைகள், அவசரத் தொடர்புகள் மற்றும் குடும்ப வரலாற்றை நிர்வகிக்கவும்.'],
    'Personal Information': ['व्यक्तिगत जानकारी', 'ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ', 'தனிப்பட்ட தகவல்'],
    'Full Legal Name': ['पूरा कानूनी नाम', 'ಪೂರ್ಣ ಕಾನೂನುಬದ್ಧ ಹೆಸರು', 'முழு சட்டப் பெயர்'],
    'Date of Birth': ['जन्म तिथि', 'ಜನ್ಮ ದಿನಾಂಕ', 'பிறந்த தேதி'],
    'Gender': ['लिंग', 'ಲಿಂಗ', 'பாலினம்'],
    'Male': ['पुरुष', 'ಪುರುಷ', 'ஆண்'],
    'Female': ['महिला', 'ಮಹಿಳೆ', 'பெண்'],
    'Other': ['अन्य', 'ಇತರೆ', 'மற்றவை'],
    'Blood Group': ['रक्त समूह', 'ರಕ್ತದ ಗುಂಪು', 'இரத்த வகை'],
    'Phone Number': ['फ़ोन नंबर', 'ಫೋನ್ ಸಂಖ್ಯೆ', 'தொலைபேசி எண்'],
    'Email Address': ['ईमेल पता', 'ಇಮೇಲ್ ವಿಳಾಸ', 'மின்னஞ்சல் முகவரி'],
    'Residential Address': ['आवासीय पता', 'ವಾಸದ ವಿಳಾಸ', 'வசிப்பிட முகவரி'],
    'Emergency Information': ['आपातकालीन जानकारी', 'ತುರ್ತು ಮಾಹಿತಿ', 'அவசரத் தகவல்'],
    'Emergency Contact Person': ['आपातकालीन संपर्क व्यक्ति', 'ತುರ್ತು ಸಂಪರ್ಕ ವ್ಯಕ್ತಿ', 'அவசரத் தொடர்பு நபர்'],
    'Relationship': ['संबंध', 'ಸಂಬಂಧ', 'உறவுமுறை'],
    'Emergency Contact Number': ['आपातकालीन संपर्क नंबर', 'ತುರ್ತು ಸಂಪರ್ಕ ಸಂಖ್ಯೆ', 'அவசரத் தொடர்பு எண்'],
    'Clinical History & Allergies': ['नैदानिक इतिहास और एलर्जी', 'ವೈದ್ಯಕೀಯ ಇತಿಹಾಸ ಮತ್ತು ಅಲರ್ಜಿಗಳು', 'மருத்துவ வரலாறு & ஒவ்வாமைகள்'],
    'Known Drug Allergies (Comma separated)': ['ज्ञात दवा एलर्जी (अल्पविराम से अलग करें)', 'ತಿಳಿದಿರುವ ಔಷಧ ಅಲರ್ಜಿಗಳು (ಅಲ್ಪವಿರಾಮದಿಂದ ಬೇರ್ಪಡಿಸಿ)', 'அறியப்பட்ட மருந்து ஒவ்வாமைகள் (காற்புள்ளியால் பிரிக்கவும்)'],
    'Existing Chronic Conditions (Comma separated)': ['मौजूदा दीर्घकालिक रोग (अल्पविराम से अलग करें)', 'ಈಗಿರುವ ದೀರ್ಘಕಾಲೀನ ಸ್ಥಿತಿಗಳು (ಅಲ್ಪವಿರಾಮದಿಂದ ಬೇರ್ಪಡಿಸಿ)', 'தற்போதைய நாள்பட்ட நோய்கள் (காற்புள்ளியால் பிரிக்கவும்)'],
    'Previous Surgeries (One per line)': ['पिछली सर्जरी (प्रति पंक्ति एक)', 'ಹಿಂದಿನ ಶಸ್ತ್ರಚಿಕಿತ್ಸೆಗಳು (ಪ್ರತಿ ಸಾಲಿಗೆ ಒಂದು)', 'முந்தைய அறுவை சிகிச்சைகள் (ஒரு வரிக்கு ஒன்று)'],
    'Family Medical History (One per line)': ['पारिवारिक चिकित्सा इतिहास (प्रति पंक्ति एक)', 'ಕುಟುಂಬದ ವೈದ್ಯಕೀಯ ಇತಿಹಾಸ (ಪ್ರತಿ ಸಾಲಿಗೆ ಒಂದು)', 'குடும்ப மருத்துவ வரலாறு (ஒரு வரிக்கு ஒன்று)'],
    'Save Health Profile Changes': ['स्वास्थ्य प्रोफ़ाइल बदलाव सहेजें', 'ಆರೋಗ್ಯ ಪ್ರೊಫೈಲ್ ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ', 'சுகாதார சுயவிவர மாற்றங்களைச் சேமி'],
    'e.g. Penicillin, Sulfa drugs, Aspirin': ['जैसे पेनिसिलिन, सल्फा दवाएँ, एस्पिरिन', 'ಉದಾ. ಪೆನ್ಸಿಲಿನ್, ಸಲ್ಫಾ ಔಷಧಗಳು, ಆಸ್ಪಿರಿನ್', 'எ.கா. பென்சிலின், சல்ஃபா மருந்துகள், ஆஸ்பிரின்'],

    // Timeline
    'Comprehensive Medical Timeline': ['विस्तृत मेडिकल टाइमलाइन', 'ಸಮಗ್ರ ವೈದ್ಯಕೀಯ ಕಾಲಾನುಕ್ರಮ', 'விரிவான மருத்துவ காலவரிசை'],

    // Appointments
    'Doctor Appointments': ['डॉक्टर अपॉइंटमेंट', 'ವೈದ್ಯರ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗಳು', 'மருத்துவர் சந்திப்புகள்'],
    'Book a consultation with a verified MediVault doctor and manage your upcoming visits.': ['सत्यापित MediVault डॉक्टर के साथ परामर्श बुक करें और अपनी आगामी विज़िट प्रबंधित करें।', 'ಪರಿಶೀಲಿತ MediVault ವೈದ್ಯರೊಂದಿಗೆ ಸಮಾಲೋಚನೆ ಬುಕ್ ಮಾಡಿ ಮತ್ತು ನಿಮ್ಮ ಮುಂಬರುವ ಭೇಟಿಗಳನ್ನು ನಿರ್ವಹಿಸಿ.', 'சரிபார்க்கப்பட்ட MediVault மருத்துவருடன் ஆலோசனையை முன்பதிவு செய்து உங்கள் வரவிருக்கும் வருகைகளை நிர்வகிக்கவும்.'],
    'Book an Appointment': ['अपॉइंटमेंट बुक करें', 'ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ಬುಕ್ ಮಾಡಿ', 'சந்திப்பை முன்பதிவு செய்'],
    'Doctor': ['डॉक्टर', 'ವೈದ್ಯರು', 'மருத்துவர்'],
    'Date': ['तिथि', 'ದಿನಾಂಕ', 'தேதி'],
    'Visit Type': ['विज़िट का प्रकार', 'ಭೇಟಿಯ ಪ್ರಕಾರ', 'வருகை வகை'],
    'In-person': ['व्यक्तिगत रूप से', 'ಖುದ್ದಾಗಿ', 'நேரில்'],
    'Video Consult': ['वीडियो परामर्श', 'ವೀಡಿಯೊ ಸಮಾಲೋಚನೆ', 'வீடியோ ஆலோசனை'],
    'Time Slot': ['समय स्लॉट', 'ಸಮಯದ ಸ್ಲಾಟ್', 'நேர இடைவெளி'],
    'Reason for Visit': ['विज़िट का कारण', 'ಭೇಟಿಯ ಕಾರಣ', 'வருகைக்கான காரணம்'],
    'Confirm Appointment': ['अपॉइंटमेंट की पुष्टि करें', 'ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್ ದೃಢೀಕರಿಸಿ', 'சந்திப்பை உறுதிசெய்'],
    'My Appointments': ['मेरे अपॉइंटमेंट', 'ನನ್ನ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗಳು', 'எனது சந்திப்புகள்'],
    'Upcoming': ['आगामी', 'ಮುಂಬರುವ', 'வரவிருப்பவை'],
    'Past & Cancelled': ['पिछले और रद्द', 'ಹಿಂದಿನ ಮತ್ತು ರದ್ದಾದ', 'கடந்தவை & ரத்து செய்யப்பட்டவை'],
    'Briefly describe your symptoms or purpose of the visit': ['अपने लक्षण या विज़िट का उद्देश्य संक्षेप में बताएँ', 'ನಿಮ್ಮ ಲಕ್ಷಣಗಳು ಅಥವಾ ಭೇಟಿಯ ಉದ್ದೇಶವನ್ನು ಸಂಕ್ಷಿಪ್ತವಾಗಿ ವಿವರಿಸಿ', 'உங்கள் அறிகுறிகள் அல்லது வருகையின் நோக்கத்தை சுருக்கமாக விவரிக்கவும்'],
    'Select a date to see available slots': ['उपलब्ध स्लॉट देखने के लिए तिथि चुनें', 'ಲಭ್ಯವಿರುವ ಸ್ಲಾಟ್‌ಗಳನ್ನು ನೋಡಲು ದಿನಾಂಕ ಆಯ್ಕೆಮಾಡಿ', 'கிடைக்கும் நேரங்களைக் காண தேதியைத் தேர்ந்தெடுக்கவும்'],
    'Confirmed': ['पुष्टि हुई', 'ದೃಢೀಕರಿಸಲಾಗಿದೆ', 'உறுதிசெய்யப்பட்டது'],
    'Cancelled': ['रद्द', 'ರದ್ದಾಗಿದೆ', 'ரத்து செய்யப்பட்டது'],
    'Completed': ['पूर्ण', 'ಪೂರ್ಣಗೊಂಡಿದೆ', 'முடிந்தது'],
    'Cancel': ['रद्द करें', 'ರದ್ದುಮಾಡಿ', 'ரத்து செய்'],
    'Reschedule': ['समय बदलें', 'ಮರುನಿಗದಿ ಮಾಡಿ', 'மறு அட்டவணை'],
    'No upcoming appointments': ['कोई आगामी अपॉइंटमेंट नहीं', 'ಮುಂಬರುವ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗಳಿಲ್ಲ', 'வரவிருக்கும் சந்திப்புகள் இல்லை'],
    'No past appointments': ['कोई पिछला अपॉइंटमेंट नहीं', 'ಹಿಂದಿನ ಅಪಾಯಿಂಟ್‌ಮೆಂಟ್‌ಗಳಿಲ್ಲ', 'கடந்த சந்திப்புகள் இல்லை']
  };

  // Strings with variable parts: [regex, (match, langIndex) => string]
  const PATTERNS = [
    [/^Prescribed Medicines \((\d+)\):$/, (m, i) => `${['निर्धारित दवाएँ', 'ಸೂಚಿಸಿದ ಔಷಧಿಗಳು', 'பரிந்துரைக்கப்பட்ட மருந்துகள்'][i]} (${m[1]}):`],
    [/^Diagnosis: (.+)$/, (m, i) => `${['निदान', 'ರೋಗನಿರ್ಣಯ', 'நோயறிதல்'][i]}: ${m[1]}`],
    [/^Code: (.+)$/, (m, i) => `${['कोड', 'ಕೋಡ್', 'குறியீடு'][i]}: ${m[1]}`]
  ];

  const LANG_INDEX = { hi: 0, kn: 1, ta: 2 };
  const originals = new WeakMap();
  const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'svg']);

  let currentLang = localStorage.getItem(STORAGE_KEY) || 'en';
  if (!LANGUAGES[currentLang]) currentLang = 'en';
  let observer = null;

  function translateString(text) {
    if (currentLang === 'en') return null;
    const idx = LANG_INDEX[currentLang];
    const key = text.trim().replace(/\s+/g, ' ');
    if (!key) return null;
    if (D[key]) return D[key][idx];
    for (const [re, fn] of PATTERNS) {
      const m = key.match(re);
      if (m) return fn(m, idx);
    }
    return null;
  }

  function translateTextNode(node) {
    const record = originals.get(node);
    // If app code changed the text since we translated it, treat the new value as the source.
    const source = record && node.nodeValue === record.applied ? record.source : node.nodeValue;
    const translated = translateString(source);

    if (translated) {
      const lead = source.match(/^\s*/)[0];
      const trail = source.match(/\s*$/)[0];
      const applied = lead + translated + trail;
      if (node.nodeValue !== applied) node.nodeValue = applied;
      originals.set(node, { source, applied });
    } else {
      if (node.nodeValue !== source) node.nodeValue = source;
      originals.delete(node);
    }
  }

  function translatePlaceholder(el) {
    if (!el.dataset.i18nPh) el.dataset.i18nPh = el.placeholder;
    const translated = translateString(el.dataset.i18nPh);
    el.placeholder = translated || el.dataset.i18nPh;
  }

  function translateRoot(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        const p = n.parentElement;
        if (!p || SKIP_TAGS.has(p.tagName) || p.closest('[data-i18n-skip]')) return NodeFilter.FILTER_REJECT;
        return /[A-Za-z\u0900-\u0D7F]/.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(translateTextNode);
    root.querySelectorAll('[placeholder]').forEach(translatePlaceholder);
  }

  function getRoots() {
    return ROOT_IDS.map((id) => document.getElementById(id)).filter(Boolean);
  }

  function applyAll() {
    if (observer) observer.disconnect();
    getRoots().forEach(translateRoot);
    document.documentElement.lang = LANGUAGES[currentLang].htmlLang;
    observe();
  }

  let scheduled = false;
  function scheduleApply() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      applyAll();
    });
  }

  function observe() {
    if (!observer) observer = new MutationObserver(scheduleApply);
    getRoots().forEach((root) =>
      observer.observe(root, { childList: true, subtree: true, characterData: true })
    );
  }

  function setLanguage(lang) {
    if (!LANGUAGES[lang]) return;
    currentLang = lang;
    localStorage.setItem(STORAGE_KEY, lang);
    const select = document.getElementById('patient-lang-select');
    if (select) select.value = lang;
    applyAll();
  }

  function init() {
    const select = document.getElementById('patient-lang-select');
    if (select) {
      select.innerHTML = Object.entries(LANGUAGES)
        .map(([code, { label }]) => `<option value="${code}">${label}</option>`)
        .join('');
      select.value = currentLang;
      select.addEventListener('change', (e) => setLanguage(e.target.value));
    }
    applyAll();
  }

  window.PatientI18n = { setLanguage, apply: applyAll, get lang() { return currentLang; } };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
