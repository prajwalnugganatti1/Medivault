/**
 * MediVault - Main Application Orchestrator
 * Navigation, Multi-Role Authentication, Admin Console, AI Chat, Notifications, and Toast System
 */

const MediVaultApp = {
  currentView: 'patient-dashboard',
  currentRole: 'patient', // 'patient', 'doctor', 'admin'

  init() {
    console.log('MediVault Orchestrator Initializing...');

    // Initialize sub-controllers
    if (window.AuthController) window.AuthController.init();
    if (window.PatientController) window.PatientController.init();
    if (window.DoctorController) window.DoctorController.init();
    if (window.PrescriptionEngine) window.PrescriptionEngine.init();
    if (window.AdminController) window.AdminController.init();
    if (window.AIChatController) window.AIChatController.init();

    // Check user session
    const currentUser = window.mediStore.getCurrentUser();
    if (!currentUser) {
      this.enterPortal('patient');
    } else {
      this.completeLogin(currentUser);
    }

    this.setupEventListeners();
    this.renderNotifications();

    if (window.lucide) window.lucide.createIcons();
    console.log('MediVault Ready.');
  },

  setupEventListeners() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
        if (window.AIChatController && window.AIChatController.isOpen) {
          window.AIChatController.toggleChat();
        }
      }
    });

    document.addEventListener('click', (e) => {
      const dropdown = document.getElementById('notifications-dropdown');
      const btn = document.getElementById('notif-bell-btn');
      if (dropdown && !dropdown.classList.contains('hidden')) {
        if (!dropdown.contains(e.target) && !btn.contains(e.target)) {
          dropdown.classList.add('hidden');
        }
      }
    });
  },

  // ----------------------------------------------------
  // Authentication & Session Management
  // ----------------------------------------------------
  showAuthScreen() {
    const authScreen = document.getElementById('auth-screen-container');
    const mainApp = document.getElementById('main-app-container');
    if (authScreen) authScreen.classList.remove('hidden');
    if (mainApp) mainApp.classList.add('hidden');

    if (window.AuthController) window.AuthController.renderAuthPortal();
  },

  completeLogin(user) {
    const authScreen = document.getElementById('auth-screen-container');
    const mainApp = document.getElementById('main-app-container');
    if (authScreen) authScreen.classList.add('hidden');
    if (mainApp) mainApp.classList.remove('hidden');

    this.currentRole = user.role;
    this.applyRole(user.role);

    const portalSwitcher = document.getElementById('portal-switcher');
    if (portalSwitcher) portalSwitcher.value = user.role;

    // Update Header demographics
    const headerName = document.getElementById('header-user-name');
    const headerSub = document.getElementById('header-user-sub');
    const headerAvatar = document.getElementById('header-avatar');

    if (headerName) headerName.innerText = user.name;
    if (headerSub) {
      if (user.role === 'patient') headerSub.innerText = `ID: ${user.id || 'MV-88219'}`;
      else if (user.role === 'doctor') headerSub.innerText = `${user.hospital || 'Hospital Care'}`;
      else headerSub.innerText = 'Platform Master Control';
    }

    if (headerAvatar) {
      if (user.role === 'doctor') {
        headerAvatar.src = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=100&q=80';
      } else if (user.role === 'admin') {
        headerAvatar.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80';
      } else {
        headerAvatar.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80';
      }
    }

    // Refresh sub controllers
    if (user.role === 'patient' && window.PatientController) window.PatientController.init();
    if (user.role === 'doctor' && window.DoctorController) window.DoctorController.init();
    if (user.role === 'admin' && window.AdminController) window.AdminController.init();

    if (window.lucide) window.lucide.createIcons();
  },

  enterPortal(role) {
    const state = window.mediStore.state;
    let sessionUser;

    if (role === 'doctor') {
      const doctor = state.registeredDoctors[0];
      sessionUser = {
        role: 'doctor',
        id: doctor.id,
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone,
        hospital: doctor.hospital,
        specialization: doctor.specialization,
        data: doctor
      };
    } else if (role === 'admin') {
      sessionUser = {
        role: 'admin',
        id: state.admin.id,
        name: state.admin.name,
        email: state.admin.email,
        data: state.admin
      };
    } else {
      const patient = state.registeredPatients[0];
      sessionUser = {
        role: 'patient',
        id: patient.id,
        name: patient.fullName,
        email: patient.email,
        phone: patient.phone,
        data: patient
      };
    }

    window.mediStore.setCurrentUser(sessionUser);
    this.completeLogin(sessionUser);
  },

  logout() {
    this.enterPortal('patient');
  },

  // ----------------------------------------------------
  // Role Switching & Views
  // ----------------------------------------------------
  switchRole(role) {
    this.currentRole = role;
    this.applyRole(role);
    this.showToast(`Switched active portal to ${role.toUpperCase()}`, 'info');
  },

  applyRole(role) {
    const patientNav = document.getElementById('nav-patient');
    const doctorNav = document.getElementById('nav-doctor');
    const adminNav = document.getElementById('nav-admin');

    const patientContainer = document.getElementById('patient-views-container');
    const doctorContainer = document.getElementById('doctor-views-container');
    const adminContainer = document.getElementById('admin-views-container');

    const roleBadge = document.getElementById('role-badge');

    // Hide all view containers
    if (patientContainer) patientContainer.classList.add('hidden');
    if (doctorContainer) doctorContainer.classList.add('hidden');
    if (adminContainer) adminContainer.classList.add('hidden');

    // Hide all navbars
    if (patientNav) patientNav.classList.add('hidden');
    if (doctorNav) doctorNav.classList.add('hidden');
    if (adminNav) adminNav.classList.add('hidden');

    if (role === 'patient') {
      if (patientNav) patientNav.classList.remove('hidden');
      if (patientContainer) patientContainer.classList.remove('hidden');
      if (roleBadge) {
        roleBadge.innerText = 'Patient Portal';
        roleBadge.className = 'text-xs px-2.5 py-0.5 rounded-full font-bold bg-teal-50 text-teal-700 border border-teal-200';
      }
      this.navigateTo('patient-dashboard');
    } else if (role === 'doctor') {
      if (doctorNav) doctorNav.classList.remove('hidden');
      if (doctorContainer) doctorContainer.classList.remove('hidden');
      if (roleBadge) {
        roleBadge.innerText = 'Doctor Portal (Verified)';
        roleBadge.className = 'text-xs px-2.5 py-0.5 rounded-full font-bold bg-cyan-50 text-cyan-700 border border-cyan-200';
      }
      this.navigateTo('doctor-dashboard');
    } else if (role === 'admin') {
      if (adminNav) adminNav.classList.remove('hidden');
      if (adminContainer) adminContainer.classList.remove('hidden');
      if (roleBadge) {
        roleBadge.innerText = 'Admin Console';
        roleBadge.className = 'text-xs px-2.5 py-0.5 rounded-full font-bold bg-purple-50 text-purple-700 border border-purple-200';
      }
      if (window.AdminController) window.AdminController.init();
    }

    if (window.lucide) window.lucide.createIcons();
  },

  // ----------------------------------------------------
  // Navigation / View Switching
  // ----------------------------------------------------
  navigateTo(viewId) {
    this.currentView = viewId;

    // Patient Views
    const pViews = ['patient-dashboard', 'patient-records', 'patient-prescriptions', 'patient-access', 'patient-profile', 'patient-timeline', 'patient-appointments'];
    pViews.forEach(v => {
      const el = document.getElementById(`view-${v}`);
      const navBtn = document.getElementById(`nav-link-${v}`);
      if (el) {
        if (v === viewId) el.classList.remove('hidden');
        else el.classList.add('hidden');
      }
      if (navBtn) {
        if (v === viewId) {
          navBtn.classList.add('bg-teal-600', 'text-white', 'shadow-sm');
          navBtn.classList.remove('text-slate-600', 'hover:bg-slate-100');
        } else {
          navBtn.classList.remove('bg-teal-600', 'text-white', 'shadow-sm');
          navBtn.classList.add('text-slate-600', 'hover:bg-slate-100');
        }
      }
    });

    // Doctor Views
    const dViews = ['doctor-dashboard'];
    dViews.forEach(v => {
      const el = document.getElementById(`view-${v}`);
      const navBtn = document.getElementById(`nav-link-${v}`);
      if (el) {
        if (v === viewId) el.classList.remove('hidden');
        else el.classList.add('hidden');
      }
      if (navBtn) {
        if (v === viewId) {
          navBtn.classList.add('bg-cyan-600', 'text-white', 'shadow-sm');
          navBtn.classList.remove('text-slate-600', 'hover:bg-slate-100');
        } else {
          navBtn.classList.remove('bg-cyan-600', 'text-white', 'shadow-sm');
          navBtn.classList.add('text-slate-600', 'hover:bg-slate-100');
        }
      }
    });

    if (viewId === 'patient-dashboard' && window.PatientController) window.PatientController.renderDashboard();
    if (viewId === 'patient-records' && window.PatientController) window.PatientController.renderRecords();
    if (viewId === 'patient-access' && window.PatientController) window.PatientController.renderAccessHistory();
    if (viewId === 'patient-timeline' && window.PatientController) window.PatientController.renderTimeline();
    if (viewId === 'patient-appointments' && window.AppointmentController) window.AppointmentController.render();
    if (viewId === 'doctor-dashboard' && window.DoctorController) window.DoctorController.renderDashboard();

    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.lucide) window.lucide.createIcons();
  },

  switchDoctorSubView(subViewId) {
    const dashboardSubView = document.getElementById('doc-dashboard-view');
    const patientChartSubView = document.getElementById('doc-patient-view');

    if (subViewId === 'doc-dashboard-view') {
      if (dashboardSubView) dashboardSubView.classList.remove('hidden');
      if (patientChartSubView) patientChartSubView.classList.add('hidden');
    } else {
      if (dashboardSubView) dashboardSubView.classList.add('hidden');
      if (patientChartSubView) patientChartSubView.classList.remove('hidden');
    }
  },

  // ----------------------------------------------------
  // Notifications
  // ----------------------------------------------------
  toggleNotifications() {
    const dropdown = document.getElementById('notifications-dropdown');
    if (dropdown) {
      dropdown.classList.toggle('hidden');
      if (!dropdown.classList.contains('hidden')) {
        this.renderNotifications();
      }
    }
  },

  renderNotifications() {
    const notifs = window.mediStore.getNotifications();
    const container = document.getElementById('notifications-list');
    const badge = document.getElementById('notif-unread-badge');

    const unreadCount = notifs.filter(n => !n.read).length;
    if (badge) {
      if (unreadCount > 0) {
        badge.innerText = unreadCount;
        badge.classList.remove('hidden');
      } else {
        badge.classList.add('hidden');
      }
    }

    if (!container) return;

    if (notifs.length === 0) {
      container.innerHTML = `<p class="p-4 text-center text-xs text-slate-400">No new notifications</p>`;
      return;
    }

    container.innerHTML = notifs.slice(0, 6).map(n => `
      <div class="p-3 border-b border-slate-100 hover:bg-slate-50 transition flex items-start gap-2.5 ${!n.read ? 'bg-teal-50/40' : ''}">
        <div class="w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.read ? 'bg-teal-500' : 'bg-transparent'}"></div>
        <div>
          <h5 class="text-xs font-bold text-slate-800">${n.title}</h5>
          <p class="text-[11px] text-slate-600 mt-0.5 leading-tight">${n.message}</p>
          <span class="text-[10px] text-slate-400 font-mono-code block mt-1">${n.time}</span>
        </div>
      </div>
    `).join('');
  },

  markAllNotificationsRead() {
    window.mediStore.markAllNotificationsRead();
    this.renderNotifications();
    this.showToast('All notifications marked as read', 'info');
  },

  // ----------------------------------------------------
  // Toast Notification System
  // ----------------------------------------------------
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold transform transition-all duration-300 translate-y-4 opacity-0 border ${
      type === 'success' ? 'bg-slate-900 text-white border-emerald-500/50' :
      type === 'error' ? 'bg-red-950 text-white border-red-500/50' :
      type === 'warning' ? 'bg-amber-950 text-white border-amber-500/50' :
      'bg-slate-900 text-white border-teal-500/50'
    }`;

    const iconColor = type === 'success' ? 'text-emerald-400' :
                      type === 'error' ? 'text-red-400' :
                      type === 'warning' ? 'text-amber-400' : 'text-teal-400';

    toast.innerHTML = `
      <span class="${iconColor} flex items-center">
        <i data-lucide="${type === 'success' ? 'check-circle-2' : type === 'error' ? 'alert-octagon' : type === 'warning' ? 'alert-triangle' : 'info'}" class="w-4 h-4"></i>
      </span>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    if (window.lucide) window.lucide.createIcons();

    requestAnimationFrame(() => {
      toast.classList.remove('translate-y-4', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');
    });

    setTimeout(() => {
      toast.classList.add('translate-y-4', 'opacity-0');
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  },

  // ----------------------------------------------------
  // Modal Utilities
  // ----------------------------------------------------
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('hidden');
      if (window.lucide) window.lucide.createIcons();
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
  },

  closeAllModals() {
    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.classList.add('hidden');
    });
  },

  resetDemoData() {
    if (confirm('Reset MediVault to clean initial demo data? All temporary tests will be reset.')) {
      window.mediStore.resetDemoData();
      window.location.reload();
    }
  }
};

window.MediVaultApp = MediVaultApp;

document.addEventListener('DOMContentLoaded', () => {
  window.MediVaultApp.init();
});
