/**
 * MediVault - Doctor Appointment Controller
 * Lets patients book, view, and cancel consultations with registered doctors.
 */

const AppointmentController = {
  TIME_SLOTS: ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
  selectedSlot: null,
  activeFilter: 'upcoming',
  bound: false,

  escape(str) {
    const div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  },

  todayISO() {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  },

  formatTime(time) {
    const [h, m] = time.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${suffix}`;
  },

  formatDate(date) {
    return new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
    });
  },

  bindEvents() {
    if (this.bound) return;
    this.bound = true;

    document.getElementById('appointment-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.book();
    });
    document.getElementById('appt-doctor')?.addEventListener('change', () => {
      this.renderDoctorInfo();
      this.renderSlots();
    });
    document.getElementById('appt-date')?.addEventListener('change', () => {
      this.selectedSlot = null;
      this.renderSlots();
    });
    document.querySelectorAll('.appt-filter').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeFilter = btn.dataset.apptFilter;
        this.renderList();
      });
    });
  },

  render() {
    this.bindEvents();

    const doctorSelect = document.getElementById('appt-doctor');
    if (doctorSelect && !doctorSelect.options.length) {
      doctorSelect.innerHTML = window.mediStore.getDoctors()
        .map(d => `<option value="${this.escape(d.id)}">${this.escape(d.name)} — ${this.escape(d.specialization)}</option>`)
        .join('');
    }

    const dateInput = document.getElementById('appt-date');
    if (dateInput) {
      dateInput.min = this.todayISO();
      if (!dateInput.value) dateInput.value = this.todayISO();
    }

    this.renderDoctorInfo();
    this.renderSlots();
    this.renderList();
    if (window.lucide) window.lucide.createIcons();
  },

  renderDoctorInfo() {
    const id = document.getElementById('appt-doctor')?.value;
    const doctor = window.mediStore.getDoctors().find(d => d.id === id);
    const info = document.getElementById('appt-doctor-info');
    if (info) info.textContent = doctor ? `${doctor.qualification} • ${doctor.hospital}` : '';
  },

  isSlotTaken(doctorId, date, time) {
    return window.mediStore.getAppointments().some(
      a => a.doctorId === doctorId && a.date === date && a.time === time && a.status !== 'Cancelled'
    );
  },

  isSlotPast(date, time) {
    return new Date(`${date}T${time}`) <= new Date();
  },

  renderSlots() {
    const container = document.getElementById('appt-slots');
    if (!container) return;
    const doctorId = document.getElementById('appt-doctor')?.value;
    const date = document.getElementById('appt-date')?.value;

    container.innerHTML = this.TIME_SLOTS.map(time => {
      const disabled = !date || this.isSlotTaken(doctorId, date, time) || this.isSlotPast(date, time);
      if (disabled && this.selectedSlot === time) this.selectedSlot = null;
      const selected = this.selectedSlot === time;
      const cls = disabled
        ? 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed line-through'
        : selected
          ? 'border-teal-600 bg-teal-600 text-white'
          : 'border-slate-200 text-slate-700 hover:border-teal-500 hover:bg-teal-50';
      return `<button type="button" data-slot="${time}" ${disabled ? 'disabled' : ''} aria-pressed="${selected}"
        class="py-2 rounded-lg border text-xs font-semibold transition ${cls}">${this.formatTime(time)}</button>`;
    }).join('');

    container.querySelectorAll('button[data-slot]:not([disabled])').forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectedSlot = btn.dataset.slot;
        this.renderSlots();
      });
    });
  },

  book() {
    const doctorId = document.getElementById('appt-doctor').value;
    const date = document.getElementById('appt-date').value;
    const mode = document.getElementById('appt-mode').value;
    const reason = document.getElementById('appt-reason').value.trim();
    const doctor = window.mediStore.getDoctors().find(d => d.id === doctorId);
    const toast = (msg, type) => window.MediVaultApp.showToast(msg, type);

    if (!doctor) return toast('Please select a doctor.', 'error');
    if (!date || date < this.todayISO()) return toast('Please choose a valid date.', 'error');
    if (!this.selectedSlot) return toast('Please pick an available time slot.', 'error');
    if (reason.length < 3) return toast('Please describe the reason for your visit.', 'error');
    if (this.isSlotTaken(doctorId, date, this.selectedSlot)) {
      this.renderSlots();
      return toast('That slot was just booked. Please choose another.', 'warning');
    }

    const patient = window.mediStore.getPatient();
    const appt = window.mediStore.addAppointment({
      doctorId: doctor.id,
      doctorName: doctor.name,
      specialization: doctor.specialization,
      hospital: doctor.hospital,
      patientId: patient?.id,
      patientName: patient?.fullName,
      date,
      time: this.selectedSlot,
      mode,
      reason
    });

    window.mediStore.addNotification({
      title: 'Appointment Confirmed',
      message: `${doctor.name} on ${this.formatDate(date)} at ${this.formatTime(appt.time)}.`,
      type: 'appointment'
    });
    if (window.MediVaultApp.renderNotifications) window.MediVaultApp.renderNotifications();

    toast(`Appointment booked with ${doctor.name}`, 'success');
    this.selectedSlot = null;
    document.getElementById('appt-reason').value = '';
    this.activeFilter = 'upcoming';
    this.renderSlots();
    this.renderList();
  },

  cancel(id) {
    if (!confirm('Cancel this appointment?')) return;
    if (window.mediStore.cancelAppointment(id)) {
      window.MediVaultApp.showToast('Appointment cancelled.', 'info');
      this.renderSlots();
      this.renderList();
    }
  },

  renderList() {
    const list = document.getElementById('appointments-list');
    if (!list) return;

    document.querySelectorAll('.appt-filter').forEach(btn => {
      const active = btn.dataset.apptFilter === this.activeFilter;
      btn.classList.toggle('bg-white', active);
      btn.classList.toggle('text-slate-900', active);
      btn.classList.toggle('shadow-sm', active);
      btn.classList.toggle('text-slate-500', !active);
      btn.setAttribute('aria-selected', active);
    });

    const all = window.mediStore.getAppointments();
    const isUpcoming = a => a.status !== 'Cancelled' && !this.isSlotPast(a.date, a.time);
    const items = this.activeFilter === 'upcoming'
      ? all.filter(isUpcoming)
      : all.filter(a => !isUpcoming(a)).reverse();

    if (!items.length) {
      list.innerHTML = `
        <li class="flex flex-col items-center justify-center text-center py-12 text-slate-400">
          <i data-lucide="calendar-x-2" class="w-10 h-10 mb-2"></i>
          <p class="text-sm font-semibold text-slate-600">No ${this.activeFilter === 'upcoming' ? 'upcoming' : 'past'} appointments</p>
          <p class="text-xs mt-0.5">${this.activeFilter === 'upcoming' ? 'Book a consultation using the form.' : 'Completed and cancelled visits appear here.'}</p>
        </li>`;
      if (window.lucide) window.lucide.createIcons();
      return;
    }

    list.innerHTML = items.map(a => {
      const cancelled = a.status === 'Cancelled';
      const upcoming = isUpcoming(a);
      const badge = cancelled
        ? 'bg-red-50 text-red-600 border-red-100'
        : upcoming ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-600 border-slate-200';
      const label = cancelled ? 'Cancelled' : upcoming ? 'Confirmed' : 'Completed';
      const [, month, day] = a.date.split('-');
      const monthName = new Date(`${a.date}T00:00:00`).toLocaleString('en-IN', { month: 'short' });

      return `
        <li class="flex items-start gap-4 p-4 rounded-2xl border border-slate-200/80 ${cancelled ? 'opacity-60' : ''}">
          <div class="shrink-0 w-14 text-center rounded-xl bg-teal-50 text-teal-700 py-2" aria-hidden="true">
            <div class="text-[10px] font-bold uppercase">${monthName}</div>
            <div class="text-xl font-extrabold leading-none">${Number(day)}</div>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <p class="text-sm font-bold text-slate-900">${this.escape(a.doctorName)}</p>
              <span class="px-2 py-0.5 rounded-full border text-[10px] font-bold ${badge}">${label}</span>
            </div>
            <p class="text-xs text-slate-500">${this.escape(a.specialization)} • ${this.escape(a.hospital)}</p>
            <p class="text-xs text-slate-700 mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span class="flex items-center gap-1"><i data-lucide="clock" class="w-3.5 h-3.5"></i>${this.formatDate(a.date)}, ${this.formatTime(a.time)}</span>
              <span class="flex items-center gap-1"><i data-lucide="${a.mode === 'Video Consult' ? 'video' : 'map-pin'}" class="w-3.5 h-3.5"></i>${this.escape(a.mode)}</span>
            </p>
            <p class="text-xs text-slate-500 mt-1 truncate">Reason: ${this.escape(a.reason)}</p>
          </div>
          ${upcoming ? `<button type="button" onclick="AppointmentController.cancel('${a.id}')" class="shrink-0 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:border-red-300 hover:text-red-600 transition">Cancel</button>` : ''}
        </li>`;
    }).join('');

    if (window.lucide) window.lucide.createIcons();
  }
};

window.AppointmentController = AppointmentController;
