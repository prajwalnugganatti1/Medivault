/**
 * Wine Quality Classifier - Visualization & Radar Chart Controller
 */

let radarChartInstance = null;

/**
 * Initialize or update the Chemical Fingerprint Radar Chart
 */
function updateRadarChart(currentVals, wineType, isGood) {
  const ctx = document.getElementById("radarCanvas");
  if (!ctx || typeof Chart === "undefined") return;

  const benchmarks = WINE_MODELS.stats[wineType].benchmarks;
  const goodBm = benchmarks.good;

  // Normalized (0-100 scale) axes for balanced radar comparison
  // Invert volatile acidity so higher = better/cleaner
  const radarLabels = [
    "Alcohol & Body",
    "Purity (Low Volatile Acid)",
    "Sulphates (Preservation)",
    "Citric Freshness",
    "Acid Structure",
    "pH Harmony"
  ];

  // Helper normalizer
  const norm = (val, min, max) => Math.max(0, Math.min(100, Math.round(((val - min) / (max - min)) * 100)));

  // Current Sample values
  const currentData = [
    norm(currentVals.alcohol, 8.0, 14.5),
    norm(1.6 - currentVals.volatile_acidity, 0.0, 1.5), // Inverted: 1.6 - va
    norm(currentVals.sulphates, 0.3, 1.2),
    norm(currentVals.citric_acid, 0.0, 0.8),
    norm(currentVals.fixed_acidity, 4.0, 12.0),
    norm(currentVals.pH, 2.8, 3.8)
  ];

  // Target Benchmark Good Wine values
  const benchmarkData = [
    norm(goodBm.alcohol, 8.0, 14.5),
    norm(1.6 - goodBm.volatile_acidity, 0.0, 1.5),
    norm(goodBm.sulphates, 0.3, 1.2),
    norm(goodBm.citric_acid, 0.0, 0.8),
    norm(goodBm.fixed_acidity, 4.0, 12.0),
    norm(goodBm.pH, 2.8, 3.8)
  ];

  const currentStrokeColor = isGood ? "#3fb950" : "#f85149";
  const currentFillColor = isGood ? "rgba(63, 185, 80, 0.2)" : "rgba(248, 81, 73, 0.2)";

  if (radarChartInstance) {
    radarChartInstance.data.datasets[0].data = currentData;
    radarChartInstance.data.datasets[0].borderColor = currentStrokeColor;
    radarChartInstance.data.datasets[0].backgroundColor = currentFillColor;
    radarChartInstance.data.datasets[0].pointBorderColor = currentStrokeColor;
    radarChartInstance.data.datasets[1].data = benchmarkData;
    radarChartInstance.update();
  } else {
    radarChartInstance = new Chart(ctx, {
      type: "radar",
      data: {
        labels: radarLabels,
        datasets: [
          {
            label: "Current Sample",
            data: currentData,
            borderColor: currentStrokeColor,
            backgroundColor: currentFillColor,
            borderWidth: 2,
            pointBackgroundColor: currentStrokeColor,
            pointBorderColor: "#fff",
            pointRadius: 3
          },
          {
            label: "Target Standard (Good)",
            data: benchmarkData,
            borderColor: "rgba(212, 175, 55, 0.7)",
            backgroundColor: "rgba(212, 175, 55, 0.05)",
            borderWidth: 1.5,
            borderDash: [4, 4],
            pointBackgroundColor: "rgba(212, 175, 55, 0.7)",
            pointRadius: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: {
              color: "rgba(255, 255, 255, 0.1)"
            },
            grid: {
              color: "rgba(255, 255, 255, 0.08)"
            },
            pointLabels: {
              color: "#8b949e",
              font: {
                size: 10.5,
                family: "'Outfit', sans-serif"
              }
            },
            ticks: {
              display: false,
              backdropColor: "transparent",
              max: 100,
              min: 0
            }
          }
        },
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "#c9d1d9",
              boxWidth: 12,
              font: {
                size: 11
              }
            }
          }
        }
      }
    });
  }
}

/**
 * Update the Circular Probability Gauge
 */
function updateGaugeMeter(probability, isGood) {
  const circle = document.getElementById("gaugeFillCircle");
  const textVal = document.getElementById("gaugeScoreText");
  const verdictBadge = document.getElementById("verdictBadge");
  const resultCard = document.getElementById("resultCard");

  if (!circle || !textVal || !verdictBadge || !resultCard) return;

  // Max stroke-dashoffset = 440 (circumference of 2 * pi * r ~ 440)
  const circumference = 440;
  const offset = circumference - (circumference * probability) / 100;
  circle.style.strokeDashoffset = offset;

  if (isGood) {
    circle.style.stroke = "#3fb950";
    verdictBadge.textContent = "GOOD QUALITY";
    verdictBadge.className = "verdict-badge good";
    resultCard.className = "result-card is-good";
  } else {
    circle.style.stroke = "#f85149";
    verdictBadge.textContent = "POOR / DEFECTIVE";
    verdictBadge.className = "verdict-badge bad";
    resultCard.className = "result-card is-bad";
  }

  // Animate count up number
  animateNumber(textVal, parseInt(textVal.textContent) || 0, probability, 400);
}

function animateNumber(element, start, end, duration) {
  const range = end - start;
  const startTime = performance.now();

  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const value = Math.round(start + range * progress);
    element.textContent = `${value}%`;
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}
