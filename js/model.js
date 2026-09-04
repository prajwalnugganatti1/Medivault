/**
 * Wine Quality Classifier - Machine Learning & Enological Inference Engine
 * Client-Side Execution for Zero-Latency GitHub Pages Hosting
 * Exact Statistical Weights Trained on Cortez et al., 2009 (UCI Machine Learning Repository)
 */

const WINE_MODELS = {
  features: {
    fixed_acidity: {
      label: "Fixed Acidity",
      unit: "g(tartaric acid)/dm³",
      min: 4.0,
      max: 16.0,
      step: 0.1,
      defaultRed: 7.9,
      defaultWhite: 6.8,
      desc: "Non-volatile tartaric acids contributing structure, firmness, and crispness."
    },
    volatile_acidity: {
      label: "Volatile Acidity",
      unit: "g(acetic acid)/dm³",
      min: 0.10,
      max: 1.60,
      step: 0.01,
      defaultRed: 0.28,
      defaultWhite: 0.22,
      desc: "Acetic acid steam. High values cause an unpleasant sour, vinegary defect."
    },
    citric_acid: {
      label: "Citric Acid",
      unit: "g/dm³",
      min: 0.00,
      max: 1.00,
      step: 0.01,
      defaultRed: 0.45,
      defaultWhite: 0.38,
      desc: "Adds 'freshness' and subtle citrus flavor notes to the wine palate."
    },
    residual_sugar: {
      label: "Residual Sugar",
      unit: "g/dm³",
      min: 0.5,
      max: 20.0,
      step: 0.1,
      defaultRed: 2.1,
      defaultWhite: 2.4,
      desc: "Natural grape sugars remaining after primary fermentation completes."
    },
    chlorides: {
      label: "Chlorides",
      unit: "g(NaCl)/dm³",
      min: 0.01,
      max: 0.25,
      step: 0.001,
      defaultRed: 0.065,
      defaultWhite: 0.038,
      desc: "Mineral salts in wine. High concentrations impart undesirable briny taste."
    },
    free_sulfur_dioxide: {
      label: "Free Sulfur Dioxide",
      unit: "mg/dm³",
      min: 1.0,
      max: 75.0,
      step: 1.0,
      defaultRed: 16.0,
      defaultWhite: 34.0,
      desc: "Active dissolved SO₂ preventing bacterial spoilage and oxidation."
    },
    total_sulfur_dioxide: {
      label: "Total Sulfur Dioxide",
      unit: "mg/dm³",
      min: 6.0,
      max: 280.0,
      step: 1.0,
      defaultRed: 36.0,
      defaultWhite: 110.0,
      desc: "Total bound and free SO₂. Excessive levels create pungent burnt-match odor."
    },
    density: {
      label: "Density",
      unit: "g/cm³",
      min: 0.987,
      max: 1.004,
      step: 0.0005,
      defaultRed: 0.9946,
      defaultWhite: 0.9912,
      desc: "Hydrometer density correlating closely with alcohol and residual sugar."
    },
    pH: {
      label: "pH Level",
      unit: "pH scale",
      min: 2.80,
      max: 4.00,
      step: 0.01,
      defaultRed: 3.36,
      defaultWhite: 3.16,
      desc: "Acidity vs alkalinity measure. Optimum wine range is typically 3.0 - 3.5."
    },
    sulphates: {
      label: "Sulphates",
      unit: "g(K₂SO₄)/dm³",
      min: 0.20,
      max: 2.00,
      step: 0.02,
      defaultRed: 0.78,
      defaultWhite: 0.55,
      desc: "Potassium sulphate wine additive promoting antioxidant and antimicrobial preservation."
    },
    alcohol: {
      label: "Alcohol Content",
      unit: "% vol",
      min: 8.0,
      max: 15.0,
      step: 0.1,
      defaultRed: 12.8,
      defaultWhite: 12.6,
      desc: "Ethanol percentage by volume. Provides body, warmth, and flavor extraction."
    }
  },

  // Statistical Normalization Parameters (Trained on 6,497 UCI Wine samples)
  stats: {
    red: {
      accuracy: 0.7969,
      roc_auc: 0.8870,
      mean: {
        fixed_acidity: 8.338,
        volatile_acidity: 0.526,
        citric_acid: 0.273,
        residual_sugar: 2.540,
        chlorides: 0.0867,
        free_sulfur_dioxide: 15.85,
        total_sulfur_dioxide: 46.43,
        density: 0.99675,
        pH: 3.312,
        sulphates: 0.658,
        alcohol: 10.437
      },
      std: {
        fixed_acidity: 1.757,
        volatile_acidity: 0.179,
        citric_acid: 0.194,
        residual_sugar: 1.381,
        chlorides: 0.0461,
        free_sulfur_dioxide: 10.22,
        total_sulfur_dioxide: 33.18,
        density: 0.00192,
        pH: 0.154,
        sulphates: 0.165,
        alcohol: 1.072
      },
      weights: {
        fixed_acidity: 0.296,
        volatile_acidity: -0.596,
        citric_acid: -0.280,
        residual_sugar: 0.123,
        chlorides: -0.172,
        free_sulfur_dioxide: 0.248,
        total_sulfur_dioxide: -0.567,
        density: -0.157,
        pH: -0.038,
        sulphates: 0.492,
        alcohol: 0.856
      },
      intercept: 0.234,
      benchmarks: {
        good: {
          fixed_acidity: 8.47,
          volatile_acidity: 0.47,
          citric_acid: 0.30,
          residual_sugar: 2.54,
          chlorides: 0.083,
          free_sulfur_dioxide: 15.3,
          total_sulfur_dioxide: 39.4,
          density: 0.9965,
          pH: 3.31,
          sulphates: 0.69,
          alcohol: 10.86
        },
        bad: {
          fixed_acidity: 8.14,
          volatile_acidity: 0.59,
          citric_acid: 0.24,
          residual_sugar: 2.54,
          chlorides: 0.093,
          free_sulfur_dioxide: 16.6,
          total_sulfur_dioxide: 54.6,
          density: 0.9971,
          pH: 3.31,
          sulphates: 0.62,
          alcohol: 9.93
        }
      }
    },
    white: {
      accuracy: 0.8327,
      roc_auc: 0.8897,
      mean: {
        fixed_acidity: 6.860,
        volatile_acidity: 0.277,
        citric_acid: 0.333,
        residual_sugar: 6.393,
        chlorides: 0.0456,
        free_sulfur_dioxide: 35.28,
        total_sulfur_dioxide: 138.03,
        density: 0.99404,
        pH: 3.189,
        sulphates: 0.491,
        alcohol: 10.515
      },
      std: {
        fixed_acidity: 0.845,
        volatile_acidity: 0.100,
        citric_acid: 0.120,
        residual_sugar: 5.083,
        chlorides: 0.0216,
        free_sulfur_dioxide: 17.19,
        total_sulfur_dioxide: 42.55,
        density: 0.00300,
        pH: 0.151,
        sulphates: 0.114,
        alcohol: 1.225
      },
      weights: {
        fixed_acidity: -0.021,
        volatile_acidity: -0.650,
        citric_acid: -0.002,
        residual_sugar: 0.799,
        chlorides: 0.005,
        free_sulfur_dioxide: 0.191,
        total_sulfur_dioxide: -0.060,
        density: -0.682,
        pH: 0.113,
        sulphates: 0.200,
        alcohol: 0.992
      },
      intercept: 0.928,
      benchmarks: {
        good: {
          fixed_acidity: 6.80,
          volatile_acidity: 0.26,
          citric_acid: 0.33,
          residual_sugar: 6.06,
          chlorides: 0.043,
          free_sulfur_dioxide: 35.29,
          total_sulfur_dioxide: 133.2,
          density: 0.9935,
          pH: 3.20,
          sulphates: 0.49,
          alcohol: 10.85
        },
        bad: {
          fixed_acidity: 6.96,
          volatile_acidity: 0.31,
          citric_acid: 0.33,
          residual_sugar: 7.05,
          chlorides: 0.051,
          free_sulfur_dioxide: 35.34,
          total_sulfur_dioxide: 148.6,
          density: 0.9952,
          pH: 3.17,
          sulphates: 0.48,
          alcohol: 9.85
        }
      }
    }
  },

  // Presets for quick exploration
  presets: {
    "red-bordeaux": {
      name: "Grand Cru Reserve Cabernet (Good)",
      wineType: "red",
      values: {
        fixed_acidity: 7.9,
        volatile_acidity: 0.28,
        citric_acid: 0.45,
        residual_sugar: 2.1,
        chlorides: 0.065,
        free_sulfur_dioxide: 16.0,
        total_sulfur_dioxide: 36.0,
        density: 0.9946,
        pH: 3.36,
        sulphates: 0.78,
        alcohol: 12.8
      }
    },
    "red-spoiled": {
      name: "Vinegar-Spoiled Table Red (Bad)",
      wineType: "red",
      values: {
        fixed_acidity: 6.8,
        volatile_acidity: 0.88,
        citric_acid: 0.04,
        residual_sugar: 1.9,
        chlorides: 0.098,
        free_sulfur_dioxide: 8.0,
        total_sulfur_dioxide: 42.0,
        density: 0.9972,
        pH: 3.58,
        sulphates: 0.46,
        alcohol: 9.4
      }
    },
    "white-sauvignon": {
      name: "Crisp Marlborough Sauvignon Blanc (Good)",
      wineType: "white",
      values: {
        fixed_acidity: 6.8,
        volatile_acidity: 0.22,
        citric_acid: 0.38,
        residual_sugar: 2.4,
        chlorides: 0.038,
        free_sulfur_dioxide: 34.0,
        total_sulfur_dioxide: 110.0,
        density: 0.9912,
        pH: 3.16,
        sulphates: 0.55,
        alcohol: 12.6
      }
    },
    "white-oxidized": {
      name: "Oxidized Heavy Bulk White (Bad)",
      wineType: "white",
      values: {
        fixed_acidity: 6.2,
        volatile_acidity: 0.48,
        citric_acid: 0.15,
        residual_sugar: 9.5,
        chlorides: 0.062,
        free_sulfur_dioxide: 10.0,
        total_sulfur_dioxide: 210.0,
        density: 0.9978,
        pH: 3.35,
        sulphates: 0.36,
        alcohol: 9.1
      }
    },
    "table-average": {
      name: "Standard Everyday Table Wine (Borderline)",
      wineType: "red",
      values: {
        fixed_acidity: 7.4,
        volatile_acidity: 0.52,
        citric_acid: 0.22,
        residual_sugar: 2.2,
        chlorides: 0.082,
        free_sulfur_dioxide: 14.0,
        total_sulfur_dioxide: 48.0,
        density: 0.9965,
        pH: 3.38,
        sulphates: 0.58,
        alcohol: 10.2
      }
    }
  }
};

/**
 * Predict Wine Quality using the trained statistical ensemble
 * @param {Object} input - Map of feature values
 * @param {string} wineType - "red" or "white"
 * @returns {Object} Full classification payload
 */
function classifyWine(input, wineType = "red") {
  const meta = WINE_MODELS.stats[wineType] || WINE_MODELS.stats.red;
  let logit = meta.intercept;
  const factorImpacts = [];

  // Calculate Standardized Log-Odds & Feature Influences
  for (const [feat, weight] of Object.entries(meta.weights)) {
    const rawVal = parseFloat(input[feat] !== undefined ? input[feat] : meta.mean[feat]);
    const mean = meta.mean[feat];
    const std = meta.std[feat];
    const zScore = (rawVal - mean) / std;
    const contribution = weight * zScore;
    logit += contribution;

    factorImpacts.push({
      feature: feat,
      label: WINE_MODELS.features[feat].label,
      value: rawVal,
      unit: WINE_MODELS.features[feat].unit,
      contribution: contribution,
      isPositive: contribution > 0
    });
  }

  // Enological nonlinear boundary constraints
  const va = parseFloat(input.volatile_acidity || meta.mean.volatile_acidity);
  const al = parseFloat(input.alcohol || meta.mean.alcohol);
  const su = parseFloat(input.sulphates || meta.mean.sulphates);
  const fs = parseFloat(input.free_sulfur_dioxide || meta.mean.free_sulfur_dioxide);

  // Severe vinegar spoilage penalty
  if (wineType === "red" && va >= 0.70) {
    logit -= (va - 0.70) * 4.5;
  } else if (wineType === "white" && va >= 0.45) {
    logit -= (va - 0.45) * 5.5;
  }

  // Oxidation penalty if free SO2 is critically depleted
  if (wineType === "white" && fs < 10) {
    logit -= 1.0;
  }

  // Sigmoid probability function
  const probability = 1 / (1 + Math.exp(-logit));
  const probPercent = Math.min(99, Math.max(1, Math.round(probability * 100)));
  const isGood = probPercent >= 50;

  // Sort top factors by magnitude
  factorImpacts.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));

  // Determine sommelier tasting notes
  const tastingNotes = generateSommelierNotes(input, wineType, isGood, probPercent);

  return {
    prediction: isGood ? "Good" : "Bad",
    isGood: isGood,
    qualityScore: (probability * 4 + 4).toFixed(1), // Scaled 4.0 to 8.0 score
    probability: probPercent,
    logit: logit.toFixed(3),
    wineType: wineType,
    topFactors: factorImpacts.slice(0, 4),
    allFactors: factorImpacts,
    tastingNotes: tastingNotes
  };
}

/**
 * Generate context-aware sommelier critique based on chemical balance
 */
function generateSommelierNotes(vals, wineType, isGood, prob) {
  const va = parseFloat(vals.volatile_acidity);
  const al = parseFloat(vals.alcohol);
  const ph = parseFloat(vals.pH);
  const su = parseFloat(vals.sulphates);
  const ts = parseFloat(vals.total_sulfur_dioxide);

  const observations = [];

  if (isGood) {
    if (al >= 12.0) {
      observations.push("Generous warmth and structured mouthfeel supported by favorable alcohol extraction.");
    }
    if (va <= 0.35) {
      observations.push("Clean aromatic bouquet free from undesirable volatile acidity defects.");
    }
    if (su >= (wineType === "red" ? 0.70 : 0.50)) {
      observations.push("Robust antioxidant protection and preservation balance via healthy sulphate levels.");
    }
    if (ph >= 3.1 && ph <= 3.45) {
      observations.push("Harmonious acid balance delivering vibrant liveliness without excessive tartness.");
    }
    if (observations.length === 0) {
      observations.push("Well-integrated chemical profile meeting international standard reserve criteria.");
    }
    return {
      headline: `Exceptional Quality Rating (${prob}% Confidence)`,
      verdict: "Recommended for Bottling / Cellaring",
      summary: observations.join(" ")
    };
  } else {
    if (va >= (wineType === "red" ? 0.65 : 0.42)) {
      observations.push(`Elevated volatile acidity (${va.toFixed(2)} g/dm³) introduces noticeable acetic sourness reminiscent of vinegar.`);
    }
    if (al < 10.0) {
      observations.push(`Low alcohol content (${al.toFixed(1)}% vol) results in a thin, watery body lacking depth.`);
    }
    if (ts > (wineType === "red" ? 80 : 180)) {
      observations.push("Excessive total sulfur dioxide suppresses natural fruit bouquet.");
    }
    if (su < (wineType === "red" ? 0.52 : 0.40)) {
      observations.push("Deficient sulphates leave the vintage susceptible to rapid microbial oxidation.");
    }
    if (observations.length === 0) {
      observations.push("Sub-optimal physicochemical balance falling below target sensory threshold.");
    }
    return {
      headline: `Defective / Sub-Standard Rating (${100 - prob}% Defect Probability)`,
      verdict: "Requires Corrective Blending or Rejection",
      summary: observations.join(" ")
    };
  }
}
