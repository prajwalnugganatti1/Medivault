/**
 * MediVault - MediBot AI Healthcare Assistant
 * Role-aware clinical co-pilot for doctors and digital health advisor for patients.
 */

const AIChatController = {
  isOpen: false,
  messages: [],

  init() {
    this.renderFloatingTrigger();
  },

  toggleChat() {
    this.isOpen = !this.isOpen;
    const chatDrawer = document.getElementById('ai-chat-drawer');
    if (!chatDrawer) return;

    if (this.isOpen) {
      chatDrawer.classList.remove('hidden');
      if (this.messages.length === 0) {
        this.sendWelcomeMessage();
      }
      this.renderMessages();
    } else {
      chatDrawer.classList.add('hidden');
    }

    if (window.lucide) window.lucide.createIcons();
  },

  renderFloatingTrigger() {
    // Check if trigger button exists
    if (document.getElementById('ai-chat-trigger-btn')) return;

    const trigger = document.createElement('div');
    trigger.id = 'ai-chat-trigger-btn';
    trigger.className = 'fixed bottom-6 right-6 z-50 no-print';
    trigger.innerHTML = `
      <button onclick="AIChatController.toggleChat()" class="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-teal-600 via-teal-700 to-cyan-700 text-white shadow-xl shadow-teal-700/30 hover:scale-105 active:scale-95 transition-all">
        <div class="relative">
          <i data-lucide="sparkles" class="w-5 h-5 text-amber-300"></i>
          <span class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-900 animate-pulse"></span>
        </div>
        <span class="text-xs font-extrabold tracking-wide hidden sm:inline">MediBot AI Assistant</span>
      </button>
    `;
    document.body.appendChild(trigger);
    if (window.lucide) window.lucide.createIcons();
  },

  sendWelcomeMessage() {
    const user = window.mediStore.getCurrentUser();
    const role = user ? user.role : 'patient';

    let welcomeText = '';
    let quickPrompts = [];

    if (role === 'doctor') {
      welcomeText = `**Dr. ${user ? user.name : 'Doctor'}**, MediBot Clinical Co-Pilot is active. I can assist with **patient allergy contraindications**, drug dosages, ICD-10 guidelines, and clinical history summaries.`;
      quickPrompts = [
        "Check drug interaction for patient with Penicillin allergy",
        "Summarize Aarav Patel's lab results & vitals",
        "Recommended dosage schedule for Azithromycin",
        "Clinical guidelines for Acute Viral Pharyngitis"
      ];
    } else if (role === 'admin') {
      welcomeText = `**Administrator**, MediBot Platform Assistant is ready. Ask me about system metrics, doctor license keys, or compliance audits.`;
      quickPrompts = [
        "How many doctor access keys are active?",
        "Summarize today's patient consent activity",
        "Check platform compliance with ABDM standards"
      ];
    } else {
      const patient = window.mediStore.getPatient();
      welcomeText = `Hello **${patient.fullName}**! I'm **MediBot**, your personal health assistant. I can help explain your diagnostic reports, clarify medication instructions, or guide you on sharing records.`;
      quickPrompts = [
        "What does elevated WBC in my CBC report mean?",
        "When should I take Metformin and Pantoprazole?",
        "How do I share my records with Dr. Rahul Sharma?",
        "What diet should I follow for Gastritis?"
      ];
    }

    this.messages.push({
      sender: 'bot',
      text: welcomeText,
      quickPrompts
    });
  },

  sendMessage(text) {
    if (!text || !text.trim()) return;

    this.messages.push({ sender: 'user', text: text.trim() });
    this.renderMessages();

    // Clear input
    const input = document.getElementById('ai-chat-input');
    if (input) input.value = '';

    // Show typing indicator
    this.showTypingIndicator();

    setTimeout(() => {
      this.removeTypingIndicator();
      const botResponse = this.generateAIResponse(text.trim());
      this.messages.push({ sender: 'bot', text: botResponse });
      this.renderMessages();
    }, 700);
  },

  showTypingIndicator() {
    const container = document.getElementById('ai-chat-messages');
    if (!container) return;
    const typingEl = document.createElement('div');
    typingEl.id = 'ai-typing-indicator';
    typingEl.className = 'flex items-center gap-2 p-3 bg-slate-100 rounded-2xl w-24 text-slate-500 mb-3';
    typingEl.innerHTML = `
      <span class="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
      <span class="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style="animation-delay: 0.2s"></span>
      <span class="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style="animation-delay: 0.4s"></span>
    `;
    container.appendChild(typingEl);
    container.scrollTop = container.scrollHeight;
  },

  removeTypingIndicator() {
    const el = document.getElementById('ai-typing-indicator');
    if (el) el.remove();
  },

  generateAIResponse(query) {
    const q = query.toLowerCase();
    const patient = window.mediStore.getPatient();
    const records = window.mediStore.getRecords();
    const prescriptions = window.mediStore.getPrescriptions();

    // 1. Critical Allergy Checks (Doctor & Patient)
    if (q.includes('allergy') || q.includes('penicillin') || q.includes('amoxicillin') || q.includes('contraindication')) {
      return `⚠️ **CRITICAL ALLERGY ALERT**:
Patient **${patient.fullName}** has documented severe allergies to **${patient.allergies.join(', ')}**.

* **Contraindicated Medications:** Amoxicillin, Ampicillin, Augmentin, Penicillin V/G, Piperacillin.
* **Safe Alternatives for Bacterial Infections:** Macrolides (e.g., Azithromycin, Clarithromycin) or Fluoroquinolones (with caution).
* **Clinical Advice:** Always verify with the patient and ensure digital prescriptions do not include beta-lactam antibiotics.`;
    }

    // 2. CBC / Lab Report Explanation
    if (q.includes('wbc') || q.includes('cbc') || q.includes('blood test') || q.includes('hemoglobin')) {
      const cbc = records.find(r => r.title.includes('CBC') || r.type.includes('Blood'));
      return `📊 **CBC Panel Clinical Summary**:
According to your **Complete Blood Count Report (${cbc ? cbc.date : 'Recent'})**:
* **Hemoglobin (Hb):** 14.8 g/dL — *Normal & Healthy* (biological reference: 13.5 - 17.5 g/dL).
* **Total Leukocyte Count (WBC):** 11,400 /mcL — *Mildly Elevated* (Normal: 4,000 - 11,000).
* **Clinical Meaning:** Mildly elevated WBC with normal platelets is common during recovery from a viral upper respiratory infection (such as viral fever/pharyngitis). It indicates the body's immune system actively responding. Continue hydration and rest.`;
    }

    // 3. Medication Timing & Instructions
    if (q.includes('metformin') || q.includes('pantoprazole') || q.includes('medication') || q.includes('when should i take')) {
      return `💊 **Patient Medication Schedule**:
Here is your recommended medication routine:
1. **Pantoprazole (Pan-D):** Take **1 capsule 30 minutes BEFORE breakfast** on an empty stomach with a full glass of water.
2. **Telmisartan 40mg:** Take once daily in the morning for hypertension.
3. **Metformin 500mg:** Take **twice daily immediately AFTER meals** (breakfast and dinner) to reduce gastric upset and maintain glycemic balance.
4. **Paracetamol 650mg:** As needed (SOS) for fever > 99.5°F, always **after food**.`;
    }

    // 4. Record Sharing & Consent Guidance
    if (q.includes('share') || q.includes('code') || q.includes('qr') || q.includes('dr. rahul')) {
      return `🔐 **How to Share Records with Dr. Rahul Sharma**:
1. Click **"Share Records"** on your dashboard navigation.
2. MediVault will generate a **6-digit Access Code (e.g. MV-9482)** and a **live QR Code**.
3. Show the QR code or tell the 6-digit code to the doctor.
4. Once verified, the doctor can view your history. You can **revoke access at any second** from the *Consent & Access* tab.`;
    }

    // 5. Diet Advice for Gastritis / GERD
    if (q.includes('diet') || q.includes('gastritis') || q.includes('tea') || q.includes('food')) {
      return `🥗 **Dietary Guidelines for Gastritis & Acid Reflux**:
* **Recommended:** Warm soups, oats, steamed vegetables, bananas, and coconut water.
* **Avoid:** Black tea, coffee, carbonated sodas, spicy deep-fried foods, and citrus fruits.
* **Lifestyle Tip:** Avoid lying down for at least 2 hours after meals and elevate your head pillow slightly at night.`;
    }

    // 6. Generic Clinical / Health query
    return `🩺 **MediBot Clinical Guidance**:
Thank you for your question: *"${query}"*.

* **Key Clinical Context:** Patient ${patient.fullName} (${patient.age}Y, ${patient.bloodGroup}) with known ${patient.allergies[0]} allergy and mild asthma/diabetes.
* **Recommendation:** All documented lab results and digital prescriptions in your MediVault profile are current. For personalized treatment adjustments, please consult your primary physician or generate a temporary access code for Dr. Rahul Sharma.

*(Disclaimer: MediVault AI is an informative digital assistant and does not substitute professional medical diagnosis in an emergency).*`;
  },

  renderMessages() {
    const container = document.getElementById('ai-chat-messages');
    if (!container) return;

    container.innerHTML = this.messages.map(m => {
      const isBot = m.sender === 'bot';
      return `
        <div class="flex items-start gap-2.5 mb-3.5 ${isBot ? '' : 'flex-row-reverse'}">
          <div class="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${isBot ? 'bg-gradient-to-tr from-teal-600 to-cyan-600 text-white shadow-sm' : 'bg-slate-800 text-white'}">
            <i data-lucide="${isBot ? 'bot' : 'user'}" class="w-4 h-4"></i>
          </div>
          <div class="max-w-[85%] text-xs">
            <div class="p-3.5 rounded-2xl ${isBot ? 'bg-white border border-slate-200 text-slate-800 shadow-xs' : 'bg-teal-600 text-white shadow-sm'} leading-relaxed">
              ${m.text.replace(/\n/g, '<br/>')}
            </div>

            <!-- Suggested Quick Prompts if any -->
            ${m.quickPrompts && m.quickPrompts.length > 0 ? `
              <div class="mt-2.5 flex flex-wrap gap-1.5">
                ${m.quickPrompts.map(p => `
                  <button onclick="AIChatController.sendMessage('${p.replace(/'/g, "\\'")}')" class="text-[11px] px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-lg border border-teal-200 font-medium transition text-left">
                    💬 ${p}
                  </button>
                `).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    container.scrollTop = container.scrollHeight;
    if (window.lucide) window.lucide.createIcons();
  }
};

window.AIChatController = AIChatController;
