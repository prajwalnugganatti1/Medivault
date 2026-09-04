/**
 * Wine Quality Classifier - Batch CSV Processing & Analysis
 */

function initBatchUpload() {
  const dropZone = document.getElementById("dropZone");
  const fileInput = document.getElementById("batchFileInput");
  const batchTableBody = document.getElementById("batchTableBody");
  const batchResultsCard = document.getElementById("batchResultsCard");
  const downloadBtn = document.getElementById("downloadResultsBtn");
  const summaryText = document.getElementById("batchSummaryText");

  if (!dropZone || !fileInput) return;

  dropZone.addEventListener("click", () => fileInput.click());

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
  });

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    if (e.dataTransfer.files.length > 0) {
      processCsvFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      processCsvFile(e.target.files[0]);
    }
  });

  let processedRows = [];

  function processCsvFile(file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      parseAndClassify(text);
    };
    reader.readAsText(file);
  }

  function parseAndClassify(csvText) {
    const lines = csvText.trim().split(/\r\n|\n/);
    if (lines.length < 2) {
      alert("Invalid CSV format: File must contain headers and at least one row.");
      return;
    }

    // Determine delimiter (comma or semicolon)
    const firstLine = lines[0];
    const delimiter = firstLine.includes(";") ? ";" : ",";
    const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase().replace(/"/g, "").replace(/ /g, "_"));

    const currentWineType = window.currentWineType || "red";
    processedRows = [];
    batchTableBody.innerHTML = "";

    let goodCount = 0;
    let badCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const values = line.split(delimiter).map(v => v.trim().replace(/"/g, ""));
      const rowData = {};
      headers.forEach((h, idx) => {
        rowData[h] = values[idx];
      });

      // Map row to standard features
      const sample = {
        fixed_acidity: parseFloat(rowData.fixed_acidity || rowData.fixedacidity || 7.5),
        volatile_acidity: parseFloat(rowData.volatile_acidity || rowData.volatileacidity || 0.4),
        citric_acid: parseFloat(rowData.citric_acid || rowData.citricacid || 0.3),
        residual_sugar: parseFloat(rowData.residual_sugar || rowData.residualsugar || 2.5),
        chlorides: parseFloat(rowData.chlorides || 0.08),
        free_sulfur_dioxide: parseFloat(rowData.free_sulfur_dioxide || rowData.freesulfurdioxide || 15),
        total_sulfur_dioxide: parseFloat(rowData.total_sulfur_dioxide || rowData.totalsulfurdioxide || 45),
        density: parseFloat(rowData.density || 0.996),
        pH: parseFloat(rowData.ph || 3.3),
        sulphates: parseFloat(rowData.sulphates || 0.65),
        alcohol: parseFloat(rowData.alcohol || 11.0)
      };

      const result = classifyWine(sample, currentWineType);
      if (result.isGood) goodCount++; else badCount++;

      const wineName = rowData.name || rowData.wine_name || `Sample #${i}`;
      processedRows.push({
        id: i,
        name: wineName,
        alcohol: sample.alcohol,
        va: sample.volatile_acidity,
        ph: sample.pH,
        prediction: result.prediction,
        probability: `${result.probability}%`,
        qualityScore: result.qualityScore,
        raw: rowData
      });

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td style="font-weight: 600;">${wineName}</td>
        <td>${sample.alcohol.toFixed(1)}%</td>
        <td>${sample.volatile_acidity.toFixed(2)}</td>
        <td>${sample.pH.toFixed(2)}</td>
        <td>
          <span class="verdict-badge ${result.isGood ? 'good' : 'bad'}" style="font-size: 0.75rem; padding: 0.2rem 0.6rem;">
            ${result.prediction.toUpperCase()}
          </span>
        </td>
        <td style="font-weight: 700; color: ${result.isGood ? '#3fb950' : '#f85149'}">${result.probability}%</td>
        <td>${result.qualityScore} / 10</td>
      `;
      batchTableBody.appendChild(tr);
    }

    if (summaryText) {
      summaryText.innerHTML = `Processed <strong>${processedRows.length}</strong> samples: 
        <span style="color:#3fb950; font-weight:700;">${goodCount} Good</span>, 
        <span style="color:#f85149; font-weight:700;">${badCount} Defective</span> 
        (${Math.round((goodCount / processedRows.length) * 100)}% Good Ratio)`;
    }

    if (batchResultsCard) {
      batchResultsCard.style.display = "block";
    }
  }

  if (downloadBtn) {
    downloadBtn.addEventListener("click", () => {
      if (processedRows.length === 0) return;
      const csvHeader = "ID,Name,Alcohol,Volatile_Acidity,pH,Prediction,Confidence,Quality_Score\n";
      const csvContent = processedRows.map(r => 
        `"${r.id}","${r.name}",${r.alcohol},${r.va},${r.ph},"${r.prediction}","${r.probability}",${r.qualityScore}`
      ).join("\n");

      const blob = new Blob([csvHeader + csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `wine_quality_predictions_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }
}
