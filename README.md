# MediVault 🩺🔒
### Centralized Digital Medical Record, Consent & Prescription Platform
#### With Multi-Role Authentication, Admin Control Console & MediBot AI

> **Hackathon 2026 Submission**  
> *A patient-centric digital health record platform that follows the patient, connecting patients, doctors, and hospital administrators through cryptographic consent, verified doctor keys, digital prescriptions, and an AI clinical co-pilot.*

---

## 1. 📌 Key Innovations & Updates

In addition to centralized records, patient consent controls, and digital prescriptions, MediVault now includes:
1. **Dedicated Pre-Login Authentication Portal:**
   * **Separate Patient Portal:** Name, Phone, Gmail/Email, with an interactive **6-digit SMS/Email OTP verification flow** (60s timer, auto-fill demo). Supports both **Existing User (Login)** and **New User (Sign Up)**.
   * **Separate Doctor Portal:** Doctor Name, Phone, Hospital Name, and an **Admin-Issued Special Doctor Access Key** (e.g., `DOC-KEY-8472`). Supports both **Existing Doctor (Login)** and **New Doctor Registration (Sign Up)**.
2. **Super-Administrator Control Console:**
   * **Doctor Key Provisioning:** Admin generates, tracks, and revokes special doctor access keys assigned to hospitals and physicians.
   * **Patient & Doctor Oversight:** Manage registered citizens and clinical staff.
   * **Platform Insights:** Diagnostic record distributions, consent grant metrics, and real-time security audit trails.
3. **MediBot AI Healthcare Assistant:**
   * **For Patients:** Plain-language lab report explanations (e.g. elevated WBC in CBC), medication schedules (when to take Metformin / Pantoprazole), diet guidance for gastritis, and consent tutorials.
   * **For Doctors (Clinical Co-Pilot):** Critical allergy contraindication warnings (preventing beta-lactam prescriptions for Penicillin-allergic patients), drug dosage guidelines, and patient history summaries.
4. **Complete Working Backend:**
   * Zero-dependency Node.js server (`server.js`) & Python Flask server (`app.py`) with REST API endpoints for OTP dispatch, doctor key verification, admin key generation, and AI chat.

---

## 2. 👥 Three Distinguishing Roles & Portals

```
                      [ MediVault Auth Portal ]
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
  🧑 PATIENT PORTAL        🩺 DOCTOR PORTAL        🛡️ ADMIN CONSOLE
  • Name, Phone, Gmail     • Name, Phone, Hospital  • Admin Email & Master Key
  • 6-digit OTP Verify     • Special Doctor Key     • Generate Doctor Keys
  • Login / Sign Up        • Login / Sign Up        • Patient / Doctor Audits
         │                        │                        │
         ▼                        ▼                        ▼
 [ Patient Dashboard ]    [ Doctor Gateway ]      [ Admin Control Console ]
 • Medical Records        • Verify Patient QR      • Key Registry (Active/Revoked)
 • Share QR / Code        • Allergy Warnings       • Diagnostic Analytics
 • Digital Rx Vault       • Digital Rx Studio      • Consent Audit Trail
         │                        │
         └────────────┬───────────┘
                      ▼
             🤖 MEDIBOT AI ASSISTANT
             (Patient & Doctor Co-Pilot)
```

---

## 3. 🔐 Authentication & Security Workflows

### 🧑 Patient Authentication (OTP-Verified)
1. **Existing User (Login):**
   * Patient enters Name, Phone number, and Gmail/Email.
   * System generates a cryptographic **6-digit OTP** (e.g. `597745`).
   * Patient enters the OTP within the 60-second window to unlock their vault.
2. **New User (Sign Up):**
   * Collects Name, Phone, Gmail, Age, Gender, Blood Group, and Allergies.
   * Dispatches OTP, assigns a unique Patient ID (`MV-XXXXX`), stores the profile, and logs in.
3. **1-Click Quick Demo:** Click *"1-Click Demo Login as Aarav Patel"* to instantly test without typing.

### 🩺 Doctor Authentication (Admin-Issued Special Key)
1. **Existing Doctor (Login):**
   * Doctor enters Name, Phone, Hospital Name, and their **Special Doctor Access Key** (e.g. `DOC-KEY-8472`).
   * System verifies that the key exists and is `active` in the Admin Registry.
2. **New Doctor (Sign Up):**
   * Doctor provides Name, Phone, Hospital, Specialization, Medical Reg Number, and an unassigned Admin License Key (e.g. `DOC-KEY-9941`).
   * Validates key, binds doctor to the hospital, and grants clinical privileges.
3. **1-Click Quick Demo:** Click *"1-Click Demo Login as Dr. Rahul Sharma"* for immediate verification.

### 🛡️ Administrator Portal (Super-Admin Control)
* Admin signs in with `admin@medivault.health` and Master Key `ADMIN-MASTER-2026`.
* Has full authority to generate new Doctor Keys, revoke compromised keys, and inspect patient/doctor records.

---

## 4. 🤖 MediBot AI Assistant

Click the floating **MediBot AI Assistant** button in the bottom right corner (or in the header) to interact with the role-aware clinical co-pilot:

* **Patient Queries:**
  * *"What does elevated WBC in my CBC report mean?"*
  * *"When should I take Metformin and Pantoprazole?"*
  * *"How do I share my records with Dr. Rahul Sharma?"*
* **Doctor Queries:**
  * *"Check drug interaction for patient with Penicillin allergy"* ➔ Alerts the clinician that Aarav Patel has a documented Penicillin allergy and warns against prescribing Amoxicillin/Augmentin!
  * *"Recommended dosage schedule for Azithromycin"*
  * *"Summarize Aarav Patel's lab results & vitals"*

---

## 5. 🚀 How to Run the Application

The web server is already active on your local machine:

### Option A: Node.js (Active on Port 3000)
```bash
node server.js
# Or:
npm start
```
Open **`http://localhost:3000`** in your browser.

### Option B: Python Flask (Alternative on Port 5000)
```bash
python app.py
```
Open **`http://localhost:5000`** in your browser.

### Option C: Direct Browser Opening
Open `index.html` directly in any web browser.

---

## 6. 🎬 4-Minute Hackathon Demo Script for Judges

1. **Step 1: Pre-Login Authentication & OTP Verification**
   * Visit `http://localhost:3000`. You will see the **Pre-Login Screen**.
   * On the **Patient** tab, click *Request Security OTP*.
   * Notice the **6-digit OTP modal** with countdown timer and auto-fill feature.
   * Click *Verify & Unlock Vault* (or use the *1-Click Demo Login as Aarav Patel*).
2. **Step 2: Patient Health Dashboard & Records**
   * Review Aarav Patel's health summary, blood group (`O+`), and emergency contacts.
   * Go to *Medical Records*. Filter by *Blood Tests* and click *View Details* on the CBC panel.
3. **Step 3: Patient Consent & QR Code Generation**
   * Click **Share Records**.
   * Note the temporary **6-digit code** (`MV-9482`) and the live **QR code**.
   * Show the *Access Audit Trail* with status badges and the **Revoke Access** trigger.
4. **Step 4: Logout & Doctor Login via Special Key**
   * Click the **Logout** icon in the header.
   * Switch to the **Doctor** tab on the login screen.
   * Notice the **Special Doctor Access Key** field (`DOC-KEY-8472`).
   * Click *Validate Key & Enter Doctor Portal*.
5. **Step 5: Doctor Gateway & Patient View**
   * In the Doctor Portal, enter code `MV-9482` (or click *Valid Code MV-9482*).
   * Review the patient's record and point out the prominent **CRITICAL ALLERGIES ALERT** in red (*Penicillin, Sulfa Drugs*).
6. **Step 6: Digital Prescription Studio & PDF Export**
   * In the *New Consultation & Digital Rx* tab, add diagnosis and click quick-add medication pills (*Paracetamol, Azithromycin*).
   * Click *Save & Issue Digital Prescription*.
   * Show the official clinic letterhead Rx and click **Download PDF**.
7. **Step 7: Super-Admin Control Console**
   * Switch role or log in as **Admin** (`admin@medivault.health` / `ADMIN-MASTER-2026`).
   * Go to **Doctor Special Keys**. Fill in a hospital name and click **Generate & Issue Special Doctor Key**.
   * Note the newly issued key (`DOC-KEY-XXXX`). Show the **Revoke Key** button.
   * Inspect **Patients Oversight**, **Doctors Registry**, and **Platform Insights**.
8. **Step 8: MediBot AI Assistant**
   * Click the bottom-right floating **MediBot AI** button.
   * Click *"Check drug interaction for patient with Penicillin allergy"* to demonstrate the AI co-pilot catching the contraindication!

---

## 7. 📄 REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health status and version check |
| `POST` | `/api/auth/patient/request-otp` | Generates and sends 6-digit OTP |
| `POST` | `/api/auth/patient/verify-otp` | Verifies OTP code and unlocks session |
| `POST` | `/api/auth/doctor/verify-key` | Validates Doctor Key against Admin registry |
| `POST` | `/api/admin/keys/generate` | Issues a new Doctor Special Key |
| `GET` | `/api/admin/insights` | Fetches platform analytics and metrics |
| `POST` | `/api/ai/chat` | AI chatbot processing endpoint |

---

## 8. 📄 License
MIT License. Created for Hackathon 2026.
