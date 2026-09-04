/**
 * Wine Quality Classifier - Main Application Logic
 */

window.currentWineType = "red";

const PROPERTY_GROUPS = [
  {
    title: "1. Acidity & pH Balance",
    icon: "🧪",
    keys: ["fixed_acidity", "volatile_acidity", "citric_acid", "pH"]
  },
  {
    title: "2. Alcohol & Body Structure",
    icon: "🍇",
    keys: ["alcohol", "residual_sugar", "density"]
  },
  {
    title: "3. Preservation & Minerals",
    icon: "🛡️",
    keys: ["sulphates", "chlorides", "free_sulfur_dioxide", "total_sulfur_dioxide"]
  }
];

document.addEventListener("DOMContentLoaded", () => {
  renderSliders();
  setupEventListeners();
  loadPreset("red-bordeaux");
  initBatchUpload();
});

/**
 * Dynamically render the 11 slider input cards
 */
function renderSliders() {
  const container = document.getElementById("slidersContainer");
  if (!container) return;
  container.innerHTML = "";

  PROPERTY_GROUPS.forEach(group => {
    const groupDiv = document.createElement("div");
    groupDiv.className = "property-group";

    const titleEl = document.createElement("h3");
    titleEl.className = "group-title";
    titleEl.innerHTML = `<span>${group.icon}</span> ${group.title}`;
    groupDiv.appendChild(titleEl);

    group.keys.forEach(key => {
      const cfg = WINE_MODELS.features[key];
      const defaultVal = window.currentWineType === "red" ? cfg.defaultRed : cfg.defaultWhite;

      const card = document.createElement("div");
      card.className = "slider-card";
      card.innerHTML = `
        <div class="slider-header">
          <label class="slider-label" for="slider-${key}">
            ${cfg.label}
            <span class="info-icon" title="${cfg.desc}">?</span>
          </label>
          <div class="slider-value-box">
            <input type="number" 
                   id="num-${key}" 
                   class="slider-input-num" 
                   min="${cfg.min}" 
                   max="${cfg.max}" 
                   step="${cfg.step}" 
                   value="${defaultVal}" />
            <span class="slider-unit">${cfg.unit.split(' ')[0]}</span>
          </div>
        </div>
        <input type="range" 
               id="slider-${key}" 
               class="custom-range" 
               min="${cfg.min}" 
               max="${cfg.max}" 
               step="${cfg.step}" 
               value="${defaultVal}" />
        <div class="slider-footer">
          <span>Min: ${cfg.min}</span>
          <span style="color: #c9d1d9;">${cfg.desc.slice(0, 38)}...</span>
          <span>Max: ${cfg.max}</span>
        </div>
      `;

      // Event listeners for two-way binding
      const rangeInput = card.querySelector(`#slider-${key}`);
      const numberInput = card.querySelector(`#num-${key}`);

      rangeInput.addEventListener("input", (e) => {
        numberInput.value = e.target.value;
        onValuesChanged();
      });

      numberInput.addEventListener("input", (e) => {
        let val = parseFloat(e.target.value);
        if (!isNaN(val)) {
          rangeInput.value = val;
          onValuesChanged();
        }
      });

      groupDiv.appendChild(card);
    });

    container.appendChild(groupDiv);
  });
}

/**
 * Setup Tab Switches, Wine Type Toggle, Presets, and Modal
 */
function setupEventListeners() {
  // Wine Type Switcher (Red vs White)
  const redBtn = document.getElementById("wineTypeRed");
  const whiteBtn = document.getElementById("wineTypeWhite");

  if (redBtn && whiteBtn) {
    redBtn.addEventListener("click", () => {
      window.currentWineType = "red";
      redBtn.classList.add("active");
      whiteBtn.classList.remove("active");
      updateSliderDefaults();
      onValuesChanged();
    });

    whiteBtn.addEventListener("click", () => {
      window.currentWineType = "white";
      whiteBtn.classList.add("active");
      redBtn.classList.remove("active");
      updateSliderDefaults();
      onValuesChanged();
    });
  }

  // Presets Selector
  const presetSelect = document.getElementById("presetSelector");
  if (presetSelect) {
    presetSelect.addEventListener("change", (e) => {
      if (e.target.value) {
        loadPreset(e.target.value);
      }
    });
  }

  // Navigation Tabs
  const tabLab = document.getElementById("tabLab");
  const tabBatch = document.getElementById("tabBatch");
  const tabGuide = document.getElementById("tabGuide");
  const labSection = document.getElementById("labSection");
  const batchSection = document.getElementById("batchSection");
  const guideModal = document.getElementById("guideModal");
  const closeGuideModal = document.getElementById("closeGuideModal");

  if (tabLab && tabBatch) {
    tabLab.addEventListener("click", () => {
      tabLab.classList.add("active");
      tabBatch.classList.remove("active");
      labSection.style.display = "grid";
      batchSection.classList.remove("active");
    });

    tabBatch.addEventListener("click", () => {
      tabBatch.classList.add("active");
      tabLab.classList.remove("active");
      labSection.style.display = "none";
      batchSection.classList.add("active");
    });
  }

  if (tabGuide && guideModal) {
    tabGuide.addEventListener("click", () => {
      guideModal.classList.add("active");
    });
    closeGuideModal.addEventListener("click", () => {
      guideModal.classList.remove("active");
    });
    guideModal.addEventListener("click", (e) => {
      if (e.target === guideModal) {
        guideModal.classList.remove("active");
      }
    });
  }

  // Reset Button
  const resetBtn = document.getElementById("resetDefaultsBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      loadPreset(window.currentWineType === "red" ? "red-bordeaux" : "white-sauvignon");
    });
  }
}

/**
 * Load Preset values
 */
function loadPreset(presetKey) {
  const preset = WINE_MODELS.presets[presetKey];
  if (!preset) return;

  // Set wine type
  if (preset.wineType !== window.currentWineType) {
    window.currentWineType = preset.wineType;
    document.getElementById("wineTypeRed").classList.toggle("active", preset.wineType === "red");
    document.getElementById("wineTypeWhite").classList.toggle("active", preset.wineType === "white");
  }

  // Apply values
  for (const [key, val] of Object.entries(preset.values)) {
    const range = document.getElementById(`slider-${key}`);
    const num = document.getElementById(`num-${key}`);
    if (range && num) {
      range.value = val;
      num.value = val;
    }
  }

  const selector = document.getElementById("presetSelector");
  if (selector) selector.value = presetKey;

  onValuesChanged();
}

/**
 * Update slider defaults when wine type changes without a preset
 */
function updateSliderDefaults() {
  Object.keys(WINE_MODELS.features).forEach(key => {
    const cfg = WINE_MODELS.features[key];
    const def = window.currentWineType === "red" ? cfg.defaultRed : cfg.defaultWhite;
    const range = document.getElementById(`slider-${key}`);
    const num = document.getElementById(`num-${key}`);
    if (range && num) {
      range.value = def;
      num.value = def;
    }
  });
}

/**
 * Collect current inputs from sliders
 */
function getCurrentInputs() {
  const values = {};
  Object.keys(WINE_MODELS.features).forEach(key => {
    const num = document.getElementById(`num-${key}`);
    values[key] = num ? parseFloat(num.value) : 0;
  });
  return values;
}

/**
 * Trigger classification & update all UI components
 */
function onValuesChanged() {
  const inputs = getCurrentInputs();
  const result = classifyWine(inputs, window.currentWineType);

  // 1. Update Gauge & Verdict Badge
  updateGaugeMeter(result.probability, result.isGood);

  // 2. Update Sommelier Tasting Note Box
  const sommelierBox = document.getElementById("sommelierNoteBox");
  if (sommelierBox) {
    sommelierBox.innerHTML = `
      <div class="sommelier-notes-title">
        <span>🍷</span> Sommelier Sensory Critique (${result.tastingNotes.verdict})
      </div>
      <p style="font-weight: 600; color: ${result.isGood ? '#3fb950' : '#f85149'}; margin-bottom: 0.3rem;">
        ${result.tastingNotes.headline}
      </p>
      <p>${result.tastingNotes.summary}</p>
    `;
  }

  // 3. Update Radar Chart
  updateRadarChart(inputs, window.currentWineType, result.isGood);

  // 4. Update Top Factor Influences List
  const impactList = document.getElementById("impactFactorsList");
  if (impactList) {
    impactList.innerHTML = "";
    result.topFactors.forEach(factor => {
      const item = document.createElement("div");
      item.className = "impact-item";
      const badgeClass = factor.isPositive ? "impact-badge-pos" : "impact-badge-neg";
      const sign = factor.isPositive ? "+" : "";
      const directionDesc = factor.isPositive ? "Boosts Quality" : "Detracts Quality";
      item.innerHTML = `
        <div>
          <span style="font-weight: 600;">${factor.label}</span>
          <span style="color: #8b949e; font-size: 0.78rem;"> (${factor.value} ${factor.unit})</span>
        </div>
        <span class="${badgeClass}">
          ${sign}${factor.contribution.toFixed(2)} (${directionDesc})
        </span>
      `;
      impactList.appendChild(item);
    });
  }
}
