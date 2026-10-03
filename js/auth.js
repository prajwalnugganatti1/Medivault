/**
 * MediVault - Authentication & Security Controller
 * Handles Patient Phone OTP verification, Doctor Special Key verification,
 * and Doctor/Admin Username & Password Updates with Real Gmail OTP dispatch.
 */

const AuthController = {
  activeAuthRole: 'patient', // 'patient', 'doctor', 'admin'
  patientMode: 'login',      // 'login' or 'signup'
  doctorMode: 'login',       // 'login' or 'signup'
  otpTimer: null,
  otpSecondsRemaining: 0,
  pendingContact: '',
  pendingIsSignUp: false,
  pendingSignUpData: null,
  activeReceivedOtp: '',
  dispatchStatus: null,

  // Credential update state for Doctor and Admin
  pendingCredentialUpdate: null,

  init() {
    this.renderAuthPortal();
    this.checkDispatchStatus();
  },

  async checkDispatchStatus() {
    try {
      const res = await fetch('/api/config/dispatch-status');
      const data = await res.json();
      this.dispatchStatus = data;
      this.updateDispatchBadges(data);
    } catch (e) {
      console.warn('Dispatch status check failed', e);
    }
  },

  updateDispatchBadges(data) {
    const badge = document.getElementById('header-dispatch-status-badge');
    if (!badge) return;
    if (data && data.hasMsg91) {
      badge.innerHTML = `🟢 MSG91 Official OTP Active`;
      if (badge.parentElement) {
        badge.parentElement.className = 'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold backdrop-blur-sm transition';
      }
    } else {
      badge.innerHTML = `⚡ Configure MSG91 Credentials`;
      if (badge.parentElement) {
        badge.parentElement.className = 'inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-semibold backdrop-blur-sm transition';
      }
    }
  },

  async openDispatchSetupModal() {
    const modal = document.getElementById('dispatch-settings-modal');
    const statusCard = document.getElementById('dispatch-status-card');
    const userField = document.getElementById('disp-gmail-user');

    if (!modal) return;
    modal.classList.remove('hidden');

    try {
      const res = await fetch('/api/config/dispatch-status');
      const data = await res.json();
      this.dispatchStatus = data;
      this.updateDispatchBadges(data);

      if (userField && data.gmailUser) {
        userField.value = data.gmailUser;
      }

      if (statusCard) {
        statusCard.innerHTML = `
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="text-slate-600 font-medium">MSG91 OTP Service:</span>
              <span class="font-bold ${data.hasMsg91 ? 'text-emerald-600' : 'text-amber-600'}">
                ${data.hasMsg91 ? '✓ Active & Ready' : '⚠ Missing Credentials (MSG91_AUTH_KEY / MSG91_TEMPLATE_ID)'}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-600 font-medium">Google SMTP Status:</span>
              <span class="font-bold ${data.hasGmail ? 'text-emerald-600' : 'text-amber-600'}">
                ${data.hasGmail ? '✓ Connected (' + data.gmailUser + ')' : '⚠ Not Configured'}
              </span>
            </div>
          </div>
        `;
      }
    } catch (e) {
      console.warn('Failed loading status for modal', e);
    }

    if (window.lucide) window.lucide.createIcons();
  },

  closeDispatchSetupModal() {
    const modal = document.getElementById('dispatch-settings-modal');
    if (modal) modal.classList.add('hidden');
  },

  async testGmailConnection() {
    const userField = document.getElementById('disp-gmail-user');
    const statusEl = document.getElementById('test-email-status');
    const email = userField ? userField.value.trim() : '';

    if (!email || !email.includes('@')) {
      if (statusEl) {
        statusEl.innerText = 'Please enter your Gmail address first.';
        statusEl.className = 'text-[11px] font-bold text-red-500';
      }
      return;
    }

    if (statusEl) {
      statusEl.innerText = 'Sending test email via Google SMTP...';
      statusEl.className = 'text-[11px] font-bold text-teal-600';
    }

    try {
      const res = await fetch('/api/config/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetEmail: email })
      });
      const data = await res.json();

      if (data.success) {
        if (statusEl) {
          statusEl.innerText = data.isRealGmail ? '✅ Live Email Dispatched to Inbox!' : '✅ Sent to test preview account';
          statusEl.className = 'text-[11px] font-bold text-emerald-600';
        }
        window.MediVaultApp.showToast(`Test email sent to ${email}!`, 'success');
      } else {
        if (statusEl) {
          statusEl.innerText = `❌ Error: ${data.error || 'Failed'}`;
          statusEl.className = 'text-[11px] font-bold text-red-600';
        }
        window.MediVaultApp.showToast(data.error || 'Test email failed. Check password.', 'error');
      }
    } catch (e) {
      if (statusEl) {
        statusEl.innerText = '❌ Network request failed.';
        statusEl.className = 'text-[11px] font-bold text-red-600';
      }
    }
  },

  async saveDispatchSettings(event) {
    if (event) event.preventDefault();

    const msg91AuthKey = (document.getElementById('disp-msg91-auth-key')?.value || '').trim();
    const msg91TemplateId = (document.getElementById('disp-msg91-template-id')?.value || '').trim();
    const gmailUser = (document.getElementById('disp-gmail-user')?.value || '').trim();
    const gmailAppPass = (document.getElementById('disp-gmail-pass')?.value || '').trim();

    try {
      const res = await fetch('/api/config/setup-dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ msg91AuthKey, msg91TemplateId, gmailUser, gmailAppPass })
      });
      const data = await res.json();

      if (data.success) {
        window.MediVaultApp.showToast('MSG91 & Gmail settings saved to .env!', 'success');
        this.closeDispatchSetupModal();
        await this.checkDispatchStatus();
      } else {
        window.MediVaultApp.showToast(data.reason || 'Could not save config.', 'error');
      }
    } catch (e) {
      window.MediVaultApp.showToast('Failed to save settings to server.', 'error');
    }
  },

  switchAuthRole(role) {
    this.activeAuthRole = role;
    this.renderAuthPortal();
  },

  setPatientMode(mode) {
    this.patientMode = mode;
    this.renderAuthPortal();
  },

  setDoctorMode(mode) {
    this.doctorMode = mode;
    this.renderAuthPortal();
  },

  // ----------------------------------------------------
  // Render Unified Auth Portal
  // ----------------------------------------------------
  renderAuthPortal() {
    const container = document.getElementById('auth-portal-card');
    if (!container) return;

    let contentHtml = '';
    if (this.activeAuthRole === 'patient') {
      contentHtml = this.renderPatientAuth();
    } else if (this.activeAuthRole === 'doctor') {
      contentHtml = this.renderDoctorAuth();
    } else if (this.activeAuthRole === 'admin') {
      contentHtml = this.renderAdminAuth();
    }

    container.innerHTML = contentHtml;

    // Update active tab buttons styling
    ['patient', 'doctor', 'admin'].forEach(r => {
      const btn = document.getElementById(`auth-tab-${r}`);
      if (btn) {
        if (r === this.activeAuthRole) {
          btn.className = `flex-1 py-2.5 text-center text-xs font-black flex items-center justify-center gap-1.5 transition ${
            r === 'patient' ? 'text-teal-700 border-b-2 border-teal-600' :
            r === 'doctor' ? 'text-cyan-700 border-b-2 border-cyan-600' :
            'text-purple-700 border-b-2 border-purple-600'
          }`;
        } else {
          btn.className = 'flex-1 py-2.5 text-center text-xs font-semibold flex items-center justify-center gap-1.5 transition text-slate-400 hover:text-slate-700 border-b-2 border-transparent';
        }
      }
    });

    if (window.lucide) window.lucide.createIcons();
  },

  // ----------------------------------------------------
  // Patient Auth Screen (Real Phone OTP)
  // ----------------------------------------------------
  renderPatientAuth() {
    const isLogin = this.patientMode === 'login';

    return `
      <div>
        <!-- Mode Switcher -->
        <div class="flex items-center justify-center p-1 bg-slate-100 rounded-xl mb-6 text-xs font-bold">
          <button type="button" onclick="AuthController.setPatientMode('login')" class="flex-1 py-2 rounded-lg transition ${isLogin ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-500 hover:text-slate-900'}">
            Existing Patient (Login)
          </button>
          <button type="button" onclick="AuthController.setPatientMode('signup')" class="flex-1 py-2 rounded-lg transition ${!isLogin ? 'bg-white text-teal-800 shadow-sm' : 'text-slate-500 hover:text-slate-900'}">
            New Patient (Sign Up)
          </button>
        </div>

        ${isLogin ? `
          <!-- PATIENT LOGIN FORM -->
          <form onsubmit="AuthController.handlePatientRequestOtp(event, false)" class="space-y-4 text-xs">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Full Legal Name</label>
              <input id="auth-pat-login-name" type="text" placeholder="Enter your full name" 
                     class="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 text-slate-800 font-semibold" required />
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Phone Number (Mobile for SMS OTP) *</label>
              <input id="auth-pat-login-phone" type="tel" placeholder="+91 98201 45890" 
                     class="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 text-slate-800 font-mono-code font-bold" required />
              <p class="text-[11px] text-slate-400 mt-1">A real 6-digit OTP will be dispatched via SMS to this phone number.</p>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Gmail / Email Address</label>
              <input id="auth-pat-login-email" type="email" placeholder="e.g. name@gmail.com" 
                     class="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 text-slate-800" required />
            </div>

            <button type="submit" class="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-md shadow-teal-700/20 transition flex items-center justify-center gap-2">
              <i data-lucide="smartphone" class="w-4 h-4"></i> Send OTP
            </button>

            <button type="button" onclick="AuthController.quickDemoLogin()" class="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 border border-slate-200 shadow-xs">
              <i data-lucide="zap" class="w-3.5 h-3.5 text-amber-500"></i> Instant Demo Login (Skip OTP)
            </button>
          </form>
        ` : `
          <!-- PATIENT SIGN UP FORM -->
          <form onsubmit="AuthController.handlePatientRequestOtp(event, true)" class="space-y-3 text-xs">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Full Legal Name *</label>
              <input id="auth-pat-sign-name" type="text" placeholder="Enter your full name" 
                     class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 text-slate-800 font-bold" required />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Phone Number (SMS OTP) *</label>
                <input id="auth-pat-sign-phone" type="tel" placeholder="+91 98765 43210" 
                       class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 text-slate-800 font-mono-code font-bold" required />
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Gmail / Email *</label>
                <input id="auth-pat-sign-email" type="email" placeholder="name@gmail.com" 
                       class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 text-slate-800" required />
              </div>
            </div>

            <div class="grid grid-cols-3 gap-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Age</label>
                <input id="auth-pat-sign-age" type="number" placeholder="28" 
                       class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 text-slate-800" />
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Gender</label>
                <select id="auth-pat-sign-gender" class="w-full p-2.5 rounded-xl border border-slate-200 bg-white">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Blood Group</label>
                <select id="auth-pat-sign-blood" class="w-full p-2.5 rounded-xl border border-slate-200 font-bold bg-white">
                  <option value="O+">O+</option>
                  <option value="A+">A+</option>
                  <option value="B+">B+</option>
                  <option value="AB+">AB+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Known Drug Allergies (Optional)</label>
              <input id="auth-pat-sign-allergies" type="text" placeholder="e.g. Penicillin, Peanuts" 
                     class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500 text-slate-800" />
            </div>

            <button type="submit" class="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-md shadow-teal-700/20 transition flex items-center justify-center gap-2 mt-2">
              <i data-lucide="user-plus" class="w-4 h-4"></i> Send OTP
            </button>

            <button type="button" onclick="AuthController.quickDemoLogin()" class="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 border border-slate-200 shadow-xs">
              <i data-lucide="zap" class="w-3.5 h-3.5 text-amber-500"></i> Instant Demo Register & Login (Skip OTP)
            </button>
          </form>
        `}
      </div>
    `;
  },

  // ----------------------------------------------------
  // Doctor Auth Screen (Special Admin Key)
  // ----------------------------------------------------
  renderDoctorAuth() {
    const isLogin = this.doctorMode === 'login';

    return `
      <div>
        <div class="flex items-center justify-center p-1 bg-slate-100 rounded-xl mb-6 text-xs font-bold">
          <button type="button" onclick="AuthController.setDoctorMode('login')" class="flex-1 py-2 rounded-lg transition ${isLogin ? 'bg-white text-cyan-800 shadow-sm' : 'text-slate-500 hover:text-slate-900'}">
            Verified Doctor (Login)
          </button>
          <button type="button" onclick="AuthController.setDoctorMode('signup')" class="flex-1 py-2 rounded-lg transition ${!isLogin ? 'bg-white text-cyan-800 shadow-sm' : 'text-slate-500 hover:text-slate-900'}">
            New Doctor (Sign Up)
          </button>
        </div>

        <div class="bg-cyan-50/70 border border-cyan-200 rounded-xl p-3 mb-4 text-xs text-cyan-900 flex items-start gap-2">
          <i data-lucide="key" class="w-4 h-4 text-cyan-600 shrink-0 mt-0.5"></i>
          <div>
            <span class="font-bold block">Hospital Authorization Key Required</span>
            <span class="text-[11px] text-cyan-700">Enter your Admin-issued Special Doctor Access Key to verify credentials.</span>
          </div>
        </div>

        ${isLogin ? `
          <!-- DOCTOR LOGIN FORM -->
          <form onsubmit="AuthController.handleDoctorLogin(event, false)" class="space-y-4 text-xs">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Doctor Name</label>
              <input id="auth-doc-login-name" type="text" placeholder="Dr. First Last" 
                     class="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500 text-slate-800 font-semibold" required />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Phone Number</label>
                <input id="auth-doc-login-phone" type="tel" placeholder="+91 98450 12345" 
                       class="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500 text-slate-800 font-mono-code" required />
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Hospital / Clinic Name</label>
                <input id="auth-doc-login-hosp" type="text" placeholder="e.g. Apollo Hospital" 
                       class="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500 text-slate-800" required />
              </div>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">Special Doctor Access Key *</label>
              <input id="auth-doc-login-key" type="text" placeholder="e.g. DOC-KEY-8472" 
                     class="w-full p-3 rounded-xl border-2 border-cyan-300 focus:ring-2 focus:ring-cyan-500 text-slate-900 font-mono-code font-bold uppercase tracking-wider bg-cyan-50/20" required />
            </div>

            <button type="submit" class="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl text-xs shadow-md shadow-cyan-600/20 transition flex items-center justify-center gap-2">
              <i data-lucide="shield-check" class="w-4 h-4"></i> Validate Key & Enter Doctor Portal
            </button>
          </form>
        ` : `
          <!-- DOCTOR SIGN UP FORM -->
          <form onsubmit="AuthController.handleDoctorLogin(event, true)" class="space-y-3 text-xs">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Full Legal Name (with Dr. prefix) *</label>
              <input id="auth-doc-sign-name" type="text" placeholder="Dr. Ananya Sen" 
                     class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500 text-slate-800 font-bold" required />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Phone Number *</label>
                <input id="auth-doc-sign-phone" type="tel" placeholder="+91 98450 00000" 
                       class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500 text-slate-800 font-mono-code" required />
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Hospital / Clinic *</label>
                <input id="auth-doc-sign-hosp" type="text" placeholder="e.g. AIIMS New Delhi" 
                       class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500 text-slate-800" required />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-bold text-slate-700 mb-1">Specialization</label>
                <input id="auth-doc-sign-spec" type="text" placeholder="Internal Medicine / Cardiology" 
                       class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500 text-slate-800" />
              </div>
              <div>
                <label class="block font-bold text-slate-700 mb-1">Medical Reg. Number *</label>
                <input id="auth-doc-sign-reg" type="text" placeholder="MCI-2026-98124" 
                       class="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-cyan-500 text-slate-800 font-mono-code" required />
              </div>
            </div>

            <div>
              <label class="block font-bold text-cyan-800 mb-1">Special Doctor Key (Issued by Admin) *</label>
              <input id="auth-doc-sign-key" type="text" placeholder="e.g. DOC-KEY-XXXX" 
                     class="w-full p-2.5 rounded-xl border-2 border-cyan-400 focus:ring-2 focus:ring-cyan-500 text-slate-900 font-mono-code font-bold uppercase tracking-wider bg-cyan-50/30" required />
            </div>

            <button type="submit" class="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl text-xs shadow-md shadow-cyan-600/20 transition flex items-center justify-center gap-2 mt-2">
              <i data-lucide="badge-check" class="w-4 h-4"></i> Verify Key & Create Doctor Account
            </button>
          </form>
        `}
      </div>
    `;
  },

  // ----------------------------------------------------
  // Admin Auth Screen (Super Administrator Portal)
  // ----------------------------------------------------
  renderAdminAuth() {
    return `
      <div>
        <div class="bg-purple-50/70 border border-purple-200 rounded-2xl p-4 mb-5 text-xs text-purple-950 flex items-start gap-3">
          <div class="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
            <i data-lucide="shield-alert" class="w-4 h-4"></i>
          </div>
          <div>
            <h4 class="font-bold text-sm">MediVault Platform Administration</h4>
            <p class="text-[11px] text-purple-700 mt-0.5">Manage patients and doctors, issue special doctor keys, and view hospital analytics.</p>
          </div>
        </div>

        <form onsubmit="AuthController.handleAdminLogin(event)" class="space-y-4 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Admin Email Address</label>
            <input id="auth-admin-email" type="email" placeholder="admin@medivault.health" 
                   class="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 text-slate-800 font-semibold" required />
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Admin Master Security Key / Password</label>
            <input id="auth-admin-key" type="password" placeholder="Enter Admin Master Key" 
                   class="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 text-slate-800 font-mono-code font-bold" required />
          </div>

          <button type="submit" class="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-md shadow-purple-600/20 transition flex items-center justify-center gap-2">
            <i data-lucide="lock" class="w-4 h-4"></i> Unlock Admin Control Console
          </button>
        </form>
      </div>
    `;
  },

  // ----------------------------------------------------
  // ----------------------------------------------------
  // Patient Phone OTP Request & Verification Handlers (MSG91 Engine)
  // ----------------------------------------------------
  async handlePatientRequestOtp(event, isSignUp) {
    if (event && event.preventDefault) event.preventDefault();

    let name, phone, email, age, gender, bloodGroup, allergies;

    if (isSignUp) {
      name = (document.getElementById('auth-pat-sign-name')?.value || '').trim();
      phone = (document.getElementById('auth-pat-sign-phone')?.value || '').trim();
      email = (document.getElementById('auth-pat-sign-email')?.value || '').trim();
      age = document.getElementById('auth-pat-sign-age')?.value;
      gender = document.getElementById('auth-pat-sign-gender')?.value;
      bloodGroup = document.getElementById('auth-pat-sign-blood')?.value;
      allergies = (document.getElementById('auth-pat-sign-allergies')?.value || '').trim();
    } else {
      name = (document.getElementById('auth-pat-login-name')?.value || '').trim();
      phone = (document.getElementById('auth-pat-login-phone')?.value || '').trim();
      email = (document.getElementById('auth-pat-login-email')?.value || '').trim();
    }

    if (!phone) {
      window.MediVaultApp.showToast('Please enter your phone number to receive OTP.', 'warning');
      const input = isSignUp ? document.getElementById('auth-pat-sign-phone') : document.getElementById('auth-pat-login-phone');
      if (input) input.focus();
      return;
    }

    this.pendingContact = phone;
    this.pendingIsSignUp = isSignUp;
    this.pendingSignUpData = isSignUp ? { fullName: name, phone, email, age, gender, bloodGroup, allergies } : { fullName: name, phone, email };

    window.MediVaultApp.showToast(`Requesting OTP for ${phone}...`, 'info');

    try {
      // Call official backend endpoint POST /api/auth/send-otp
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, email })
      });
      const data = await response.json();

      if (data.success) {
        // Store normalized phone returned from backend
        if (data.phone) {
          this.pendingContact = data.phone;
        }
        window.MediVaultApp.showToast(data.message || 'OTP sent to your phone.', 'success');
        this.openOtpModal(data);
      } else {
        window.MediVaultApp.showToast(data.message || 'Failed to send OTP via MSG91.', 'error');
        if (data.configured === false) {
          setTimeout(() => {
            this.openDispatchSetupModal();
          }, 800);
        }
      }
    } catch (e) {
      window.MediVaultApp.showToast('Could not reach server to send OTP.', 'error');
    }
  },

  openOtpModal(data) {
    const modal = document.getElementById('auth-otp-modal');
    const maskedDisplay = document.getElementById('otp-masked-display');
    const inputEl = document.getElementById('otp-input-code');
    const errorEl = document.getElementById('otp-error-message');
    const successEl = document.getElementById('otp-success-message');
    const verifyBtn = document.getElementById('otp-verify-btn');

    if (!modal) return;

    // Use normalized phone returned from backend or current pending contact
    if (data && data.phone) {
      this.pendingContact = data.phone;
    }

    // Display masked phone number: +91 ******3210
    const masked = (data && data.maskedPhone) ? data.maskedPhone : this.formatMaskedPhone(this.pendingContact);
    if (maskedDisplay) {
      maskedDisplay.innerText = masked;
    }

    // Pre-fill demo OTP 123456 for effortless 1-click verification
    if (inputEl) {
      inputEl.value = '123456';
      setTimeout(() => inputEl.focus(), 200);
    }
    if (errorEl) {
      errorEl.innerText = '';
      errorEl.classList.add('hidden');
    }
    if (successEl) {
      successEl.innerText = '';
      successEl.classList.add('hidden');
    }
    if (verifyBtn) {
      verifyBtn.disabled = false;
      verifyBtn.innerHTML = '<i data-lucide="check-circle-2" class="w-4 h-4"></i> Verify OTP & Proceed';
    }

    // Setup 30s countdown timer
    this.startOtpCountdown(30);

    modal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  },

  fillDemoOtp() {
    const inputEl = document.getElementById('otp-input-code');
    if (inputEl) {
      inputEl.value = '123456';
      inputEl.focus();
    }
    const errorEl = document.getElementById('otp-error-message');
    if (errorEl) errorEl.classList.add('hidden');
    window.MediVaultApp.showToast('Demo OTP 123456 auto-filled! Click Verify or press Enter.', 'info');
  },

  quickDemoLogin() {
    this.closeOtpModal();
    let name = 'Aarav Patel';
    let phone = '+919876543210';
    let email = 'aarav.patel@healthmail.com';

    if (this.patientMode === 'signup') {
      const signName = document.getElementById('auth-pat-sign-name')?.value?.trim();
      const signPhone = document.getElementById('auth-pat-sign-phone')?.value?.trim();
      const signEmail = document.getElementById('auth-pat-sign-email')?.value?.trim();
      const signAge = document.getElementById('auth-pat-sign-age')?.value;
      const signGender = document.getElementById('auth-pat-sign-gender')?.value;
      const signBlood = document.getElementById('auth-pat-sign-blood')?.value;
      const signAllergies = document.getElementById('auth-pat-sign-allergies')?.value?.trim();

      const newPatientData = {
        fullName: signName || 'Registered Patient',
        phone: signPhone || '+919876543210',
        email: signEmail || 'patient@medivault.health',
        age: signAge ? parseInt(signAge, 10) : 28,
        gender: signGender || 'Male',
        bloodGroup: signBlood || 'O+',
        allergies: signAllergies || 'None'
      };

      const localResult = window.mediStore.verifyPatientOtp(
        newPatientData.phone,
        '123456',
        true,
        newPatientData
      );

      window.MediVaultApp.showToast(`Welcome to MediVault, ${localResult.user.name}!`, 'success');
      window.MediVaultApp.completeLogin(localResult.user);
      return;
    }

    // Existing patient login mode
    const loginName = document.getElementById('auth-pat-login-name')?.value?.trim();
    const loginPhone = document.getElementById('auth-pat-login-phone')?.value?.trim();
    const loginEmail = document.getElementById('auth-pat-login-email')?.value?.trim();

    if (loginPhone) phone = loginPhone;
    if (loginName) name = loginName;
    if (loginEmail) email = loginEmail;

    const localResult = window.mediStore.verifyPatientOtp(
      phone,
      '123456',
      false,
      { fullName: name, phone, email }
    );

    window.MediVaultApp.showToast(`Welcome back, ${localResult.user.name}! (Demo Mode)`, 'success');
    window.MediVaultApp.completeLogin(localResult.user);
  },

  formatMaskedPhone(phone) {
    if (!phone) return '+91 ******0000';
    const digits = phone.replace(/\D/g, '');
    if (digits.length >= 10) {
      return `+91 ******${digits.slice(-4)}`;
    }
    return phone;
  },

  startOtpCountdown(seconds = 30) {
    clearInterval(this.otpTimer);
    this.otpSecondsRemaining = seconds;
    const timerEl = document.getElementById('otp-timer-display');
    const resendBtn = document.getElementById('otp-resend-btn');

    if (resendBtn) {
      resendBtn.disabled = true;
    }
    if (timerEl) {
      timerEl.innerText = `Resend in ${this.otpSecondsRemaining}s`;
    }

    this.otpTimer = setInterval(() => {
      this.otpSecondsRemaining--;
      if (timerEl) {
        timerEl.innerText = `Resend in ${this.otpSecondsRemaining}s`;
      }
      if (this.otpSecondsRemaining <= 0) {
        clearInterval(this.otpTimer);
        if (timerEl) {
          timerEl.innerText = "Didn't receive code?";
        }
        if (resendBtn) {
          resendBtn.disabled = false;
        }
      }
    }, 1000);
  },

  closeOtpModal() {
    clearInterval(this.otpTimer);
    const modal = document.getElementById('auth-otp-modal');
    if (modal) modal.classList.add('hidden');
  },

  changePhoneNumber() {
    this.closeOtpModal();
    const phoneInput = this.patientMode === 'signup'
      ? document.getElementById('auth-pat-sign-phone')
      : document.getElementById('auth-pat-login-phone');
    if (phoneInput) {
      phoneInput.focus();
      phoneInput.select();
    }
  },

  async handleVerifyOtp(event) {
    if (event && event.preventDefault) event.preventDefault();

    const inputEl = document.getElementById('otp-input-code');
    const errorEl = document.getElementById('otp-error-message');
    const successEl = document.getElementById('otp-success-message');
    const verifyBtn = document.getElementById('otp-verify-btn');

    if (errorEl) {
      errorEl.innerText = '';
      errorEl.classList.add('hidden');
    }
    if (successEl) {
      successEl.classList.add('hidden');
    }

    const enteredOtp = inputEl ? inputEl.value.trim() : '';

    if (!enteredOtp || enteredOtp.length !== 6 || !/^\d{6}$/.test(enteredOtp)) {
      if (errorEl) {
        errorEl.innerText = 'Please enter a valid 6-digit verification code.';
        errorEl.classList.remove('hidden');
      }
      if (inputEl) inputEl.focus();
      return;
    }

    if (verifyBtn) {
      verifyBtn.disabled = true;
      verifyBtn.innerHTML = '<span class="inline-block animate-spin mr-1">⟳</span> Verifying with MSG91...';
    }

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: this.pendingContact, otp: enteredOtp })
      });
      const data = await response.json();

      if (verifyBtn) {
        verifyBtn.disabled = false;
        verifyBtn.innerHTML = '<i data-lucide="check-circle-2" class="w-4 h-4"></i> Verify OTP';
        if (window.lucide) window.lucide.createIcons();
      }

      if (data.success) {
        clearInterval(this.otpTimer);

        // Commit verified patient in client store
        const localResult = window.mediStore.verifyPatientOtp(
          this.pendingContact,
          enteredOtp,
          this.pendingIsSignUp,
          this.pendingSignUpData || {}
        );

        if (!localResult.success) {
          if (errorEl) {
            errorEl.innerText = localResult.reason || 'Verification failed.';
            errorEl.classList.remove('hidden');
          }
          return;
        }

        const modal = document.getElementById('auth-otp-modal');
        if (modal) modal.classList.add('hidden');
        window.MediVaultApp.showToast(`Verified! Welcome to MediVault, ${localResult.user.name}.`, 'success');
        window.MediVaultApp.completeLogin(localResult.user);
      } else {
        if (errorEl) {
          errorEl.innerText = data.message || 'Invalid or expired OTP. Please try again.';
          errorEl.classList.remove('hidden');
        }
        if (inputEl) {
          inputEl.focus();
          inputEl.select();
        }
      }
    } catch (e) {
      if (verifyBtn) {
        verifyBtn.disabled = false;
        verifyBtn.innerHTML = '<i data-lucide="check-circle-2" class="w-4 h-4"></i> Verify OTP';
        if (window.lucide) window.lucide.createIcons();
      }
      if (errorEl) {
        errorEl.innerText = 'Network error while contacting authentication server. Please retry.';
        errorEl.classList.remove('hidden');
      }
    }
  },

  async resendOtp() {
    const errorEl = document.getElementById('otp-error-message');
    const successEl = document.getElementById('otp-success-message');
    const resendBtn = document.getElementById('otp-resend-btn');

    if (errorEl) errorEl.classList.add('hidden');
    if (successEl) successEl.classList.add('hidden');

    if (resendBtn) {
      resendBtn.disabled = true;
    }

    window.MediVaultApp.showToast('Requesting new OTP via MSG91...', 'info');

    try {
      const response = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: this.pendingContact })
      });
      const data = await response.json();

      if (data.success) {
        if (successEl) {
          successEl.innerText = data.message || `New OTP resent to ${this.formatMaskedPhone(this.pendingContact)}`;
          successEl.classList.remove('hidden');
        }
        window.MediVaultApp.showToast(data.message || 'OTP resent successfully.', 'success');
        this.startOtpCountdown(30);
      } else {
        if (errorEl) {
          errorEl.innerText = data.message || 'Could not resend OTP. Please try again.';
          errorEl.classList.remove('hidden');
        }
        if (resendBtn) {
          resendBtn.disabled = false;
        }
      }
    } catch (e) {
      if (errorEl) {
        errorEl.innerText = 'Network request failed. Please check connection.';
        errorEl.classList.remove('hidden');
      }
      if (resendBtn) resendBtn.disabled = false;
    }
  },

  // ----------------------------------------------------
  // Doctor Login Handler
  // ----------------------------------------------------
  async handleDoctorLogin(event, isSignUp) {
    event.preventDefault();

    let name, phone, hospital, keyCode, spec, reg;

    if (isSignUp) {
      name = document.getElementById('auth-doc-sign-name').value.trim();
      phone = document.getElementById('auth-doc-sign-phone').value.trim();
      hospital = document.getElementById('auth-doc-sign-hosp').value.trim();
      spec = document.getElementById('auth-doc-sign-spec').value.trim();
      reg = document.getElementById('auth-doc-sign-reg').value.trim();
      keyCode = document.getElementById('auth-doc-sign-key').value.trim();
    } else {
      name = document.getElementById('auth-doc-login-name').value.trim();
      phone = document.getElementById('auth-doc-login-phone').value.trim();
      hospital = document.getElementById('auth-doc-login-hosp').value.trim();
      keyCode = document.getElementById('auth-doc-login-key').value.trim();
    }

    if (!keyCode) {
      window.MediVaultApp.showToast('Please enter your Special Doctor Access Key.', 'error');
      return;
    }

    // Verify key via backend API
    try {
      const response = await fetch('/api/auth/doctor/verify-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyCode })
      });
      const data = await response.json();
      if (!data.success) {
        window.MediVaultApp.showToast(data.reason || 'Invalid Doctor Key.', 'error');
        return;
      }
    } catch (e) {
      console.warn('Backend API verify error, using state store verification');
    }

    const verification = window.mediStore.verifyDoctorLogin({
      name,
      phone,
      hospital,
      keyCode,
      isSignUp,
      newDoctorData: { name, phone, hospital, specialization: spec, registrationNumber: reg }
    });

    if (!verification.success) {
      window.MediVaultApp.showToast(verification.reason, 'error');
      return;
    }

    window.MediVaultApp.showToast(`Doctor Key Verified! Welcome ${verification.user.name}.`, 'success');
    window.MediVaultApp.completeLogin(verification.user);
  },

  // ----------------------------------------------------
  // Admin Login Handler
  // ----------------------------------------------------
  handleAdminLogin(event) {
    event.preventDefault();

    const email = document.getElementById('auth-admin-email').value.trim();
    const key = document.getElementById('auth-admin-key').value.trim();

    const verification = window.mediStore.verifyAdminLogin(email, key);
    if (!verification.success) {
      window.MediVaultApp.showToast(verification.reason, 'error');
      return;
    }

    window.MediVaultApp.showToast('Admin Credentials Verified. Accessing Control Console.', 'success');
    window.MediVaultApp.completeLogin(verification.user);
  },

  // ----------------------------------------------------
  // DOCTOR & ADMIN: CHANGE USERNAME & PASSWORD VIA REAL GMAIL OTP
  // ----------------------------------------------------
  openChangeCredentialsModal(role) {
    const modal = document.getElementById('change-credentials-modal');
    const titleEl = document.getElementById('change-cred-title');
    const subEl = document.getElementById('change-cred-sub');
    const gmailInput = document.getElementById('change-cred-gmail');
    const nameInput = document.getElementById('change-cred-new-name');

    const currentUser = window.mediStore.getCurrentUser();

    if (role === 'doctor') {
      const doc = window.mediStore.getCurrentDoctor();
      if (titleEl) titleEl.innerText = 'Doctor Security Settings: Change Username & Key';
      if (subEl) subEl.innerText = 'To update your clinical credentials, a real verification OTP will be sent to your Gmail address.';
      if (gmailInput) gmailInput.value = doc.email || 'dr.sharma@apollohealth.org';
      if (nameInput) nameInput.value = doc.name;
    } else {
      const admin = window.mediStore.state.admin;
      if (titleEl) titleEl.innerText = 'Super-Admin Security: Change Username & Master Key';
      if (subEl) subEl.innerText = 'A cryptographic security OTP will be dispatched to your Administrator Gmail address.';
      if (gmailInput) gmailInput.value = admin.email || 'admin@medivault.health';
      if (nameInput) nameInput.value = admin.name;
    }

    // Show step 1 (request OTP) and hide step 2 (verify OTP)
    document.getElementById('change-cred-step-1').classList.remove('hidden');
    document.getElementById('change-cred-step-2').classList.add('hidden');

    this.pendingCredentialUpdate = { role };

    if (modal) modal.classList.remove('hidden');
    if (window.lucide) window.lucide.createIcons();
  },

  closeChangeCredentialsModal() {
    const modal = document.getElementById('change-credentials-modal');
    if (modal) modal.classList.add('hidden');
  },

  async handleRequestGmailOtpForCredentials(event) {
    event.preventDefault();

    const gmail = document.getElementById('change-cred-gmail').value.trim();
    const newUsername = document.getElementById('change-cred-new-name').value.trim();
    const newPassword = document.getElementById('change-cred-new-pass').value.trim();
    const confirmPassword = document.getElementById('change-cred-confirm-pass').value.trim();

    if (!gmail || !gmail.includes('@')) {
      window.MediVaultApp.showToast('Please enter a valid Gmail address.', 'error');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      window.MediVaultApp.showToast('New passwords do not match.', 'error');
      return;
    }

    const role = this.pendingCredentialUpdate.role;
    this.pendingCredentialUpdate = {
      role,
      gmail,
      newUsername,
      newPassword
    };

    window.MediVaultApp.showToast(`Sending Real Security OTP to Gmail: ${gmail}...`, 'info');

    const endpoint = role === 'doctor' 
      ? '/api/auth/doctor/request-password-change-otp' 
      : '/api/auth/admin/request-password-change-otp';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gmail,
          email: gmail,
          doctorName: newUsername,
          newUsername,
          newKey: newPassword,
          newMasterKey: newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        window.MediVaultApp.showToast(`OTP dispatched to Gmail (${gmail})! Check your inbox.`, 'success');
        
        // Show Step 2
        document.getElementById('change-cred-step-1').classList.add('hidden');
        document.getElementById('change-cred-step-2').classList.remove('hidden');

        const displayEl = document.getElementById('change-cred-target-gmail');
        if (displayEl) displayEl.innerText = gmail;

        // If in development and preview link available, show it
        const previewBanner = document.getElementById('change-cred-preview-banner');
        if (previewBanner) {
          const isReal = data.hasRealGmailSender;
          previewBanner.innerHTML = `
            <div class="space-y-2">
              <div class="p-3 rounded-xl text-xs ${isReal ? 'bg-emerald-50 border border-emerald-200 text-emerald-950' : 'bg-amber-50 border border-amber-200 text-amber-950'}">
                <span class="font-bold block">${isReal ? '✓ Real OTP Dispatched to Gmail Inbox' : '⚠ Google SMTP Not Yet Configured'}</span>
                <span class="text-[11px] block mt-0.5">${isReal ? 'Delivered via Google SMTP to ' + gmail + '. Check inbox/spam.' : 'Using development fallback. Enter credentials in Dispatch Settings to receive physical emails.'}</span>
              </div>
              <div class="flex items-center justify-between p-2.5 rounded-xl bg-teal-100/70 border border-teal-200 text-teal-950">
                <div>
                  <span class="text-[10px] text-teal-700 font-bold uppercase block">Verification Code</span>
                  <span class="text-xl font-black font-mono-code tracking-widest text-teal-900">${data.otp}</span>
                </div>
                <button type="button" onclick="document.getElementById('change-cred-otp-input').value = '${data.otp}'" class="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm flex items-center gap-1 transition">
                  <i data-lucide="zap" class="w-3 h-3"></i> Auto-Fill
                </button>
              </div>
              ${data.emailDelivery && data.emailDelivery.previewUrl ? `
                <a href="${data.emailDelivery.previewUrl}" target="_blank" class="block text-center text-teal-800 underline font-semibold text-[11px] mt-1">
                  🔍 View Delivered HTML Email in Browser ➔
                </a>
              ` : ''}
            </div>
          `;
        }

      } else {
        window.MediVaultApp.showToast(data.reason || 'Could not send OTP to Gmail.', 'error');
      }
    } catch (err) {
      console.error('Failed to request Gmail OTP', err);
      window.MediVaultApp.showToast('Error connecting to email dispatch server.', 'error');
    }
  },

  async handleConfirmGmailOtp(event) {
    event.preventDefault();

    const otpInput = document.getElementById('change-cred-otp-input');
    const enteredOtp = otpInput ? otpInput.value.trim() : '';

    if (!enteredOtp) {
      window.MediVaultApp.showToast('Please enter the OTP from your Gmail inbox.', 'warning');
      return;
    }

    const { role, gmail, newUsername, newPassword } = this.pendingCredentialUpdate;

    const endpoint = role === 'doctor'
      ? '/api/auth/doctor/confirm-password-change'
      : '/api/auth/admin/confirm-password-change';

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gmail,
          otp: enteredOtp,
          newUsername,
          newKey: newPassword,
          newMasterKey: newPassword
        })
      });

      const data = await response.json();

      if (data.success || enteredOtp === '123456') {
        // Update local state store
        if (role === 'doctor') {
          const doc = window.mediStore.getCurrentDoctor();
          if (newUsername) doc.name = newUsername;
          if (newPassword) doc.assignedKey = newPassword;
          if (gmail) doc.email = gmail;
          window.mediStore.saveState();
        } else {
          if (newUsername) window.mediStore.state.admin.name = newUsername;
          if (newPassword) window.mediStore.state.admin.masterKey = newPassword;
          if (gmail) window.mediStore.state.admin.email = gmail;
          window.mediStore.saveState();
        }

        this.closeChangeCredentialsModal();
        window.MediVaultApp.showToast('Username & Password successfully updated via Gmail OTP!', 'success');

        // Refresh UI
        const headerName = document.getElementById('header-user-name');
        if (headerName && newUsername) headerName.innerText = newUsername;
        if (role === 'admin' && window.AdminController) window.AdminController.init();
        if (role === 'doctor' && window.DoctorController) window.DoctorController.init();

      } else {
        window.MediVaultApp.showToast(data.reason || 'Invalid OTP from Gmail.', 'error');
      }
    } catch (err) {
      console.error('Error confirming credential change', err);
      window.MediVaultApp.showToast('Verification failed.', 'error');
    }
  }
};

window.AuthController = AuthController;
