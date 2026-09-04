# 🍷 Wine Quality Classifier

[![GitHub Pages](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-success?style=for-the-badge&logo=github)](https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue?style=for-the-badge&logo=python)](https://www.python.org/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.4%2B-orange?style=for-the-badge&logo=scikit-learn)](https://scikit-learn.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-yellow?style=for-the-badge&logo=javascript)](https://developer.mozilla.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-purple?style=for-the-badge)](LICENSE)

An intelligent, interactive machine learning web application that predicts wine quality ("Good" vs "Defective/Bad") from 11 objective physicochemical properties (pH, alcohol, volatile acidity, sulphates, sulfur dioxide, etc.).

Designed to run **100% in the browser on GitHub Pages** with zero hosting costs, accompanied by a full Python Data Science & ML pipeline and an optional REST API.

---

## 📸 Overview & Key Features

- 🧪 **Interactive Enology Lab**: Adjust 11 chemical compounds using real-time sliders and numeric inputs to see instant quality predictions.
- ⚡ **Zero-Latency Client-Side Inference**: Pre-trained statistical decision ensemble embedded directly in JavaScript; no backend server required for hosting on **GitHub Pages**!
- 🍷 **Red & White Varietal Support**: Separate trained models tailored to the distinct chemical profiles of Red and White wines.
- 🕸️ **Chemical Fingerprint Radar Chart**: Real-time Chart.js radar visualization comparing the active sample against the benchmark "Good Wine" profile.
- 📜 **AI Sommelier Sensory Notes**: Context-aware tasting notes explaining *why* a wine was classified as Good or Defective based on enological thresholds (e.g. vinegar defects, alcohol warmth, oxidation risk).
- 📁 **Batch CSV Predictor**: Drag-and-drop CSV files with multiple wine samples to classify entire batches and export labeled results.
- 🚀 **GitHub Pages CI/CD**: Automated `.github/workflows/deploy.yml` workflow to deploy on git push.
- 🐍 **Full Python Machine Learning Pipeline**: Includes automated dataset fetching, Random Forest & Logistic Regression training, metric evaluation, and JSON weight export.

---

## 🔬 The Science: 11 Chemical Properties

Based on the landmark enological study by **Cortez et al. (2009)**:

| Chemical Property | Unit | Typical Range | Enological Impact |
| :--- | :--- | :--- | :--- |
| **Volatile Acidity** | $g(acetic)/dm^3$ | 0.12 – 1.58 | **Primary defect indicator**. High levels ($>0.65$ in reds, $>0.45$ in whites) signal bacterial spoilage (*Acetobacter*) causing vinegar odor. |
| **Alcohol** | $\%$ vol | 8.4 – 14.9 | **Strongest positive predictor**. Higher alcohol ($>11.5\%$) correlates with full body, flavor extraction, and perceived warmth. |
| **Sulphates** | $g(K_2SO_4)/dm^3$ | 0.33 – 2.00 | Potassium sulphate acts as an antioxidant and antimicrobial preservative. |
| **pH Level** | pH scale | 2.8 – 4.0 | Measures acidity equilibrium. Optimum wine range is 3.0 – 3.5. Above 3.7 wines taste flabby and spoil easily. |
| **Citric Acid** | $g/dm^3$ | 0.0 – 1.0 | Imparts crispness and subtle citrus freshness to the palate. |
| **Fixed Acidity** | $g(tartaric)/dm^3$ | 4.6 – 15.9 | Non-volatile acids that form the fundamental backbone and tartness of the wine. |
| **Free $SO_2$** | $mg/dm^3$ | 1 – 72 | Active dissolved sulfur dioxide preventing oxidation and microbial growth. |
| **Total $SO_2$** | $mg/dm^3$ | 6 – 289 | Total bound and free $SO_2$. Excessive amounts create pungent burnt-match odors. |
| **Residual Sugar**| $g/dm^3$ | 0.6 – 15.5 | Natural grape sugars remaining after fermentation. |
| **Density** | $g/cm^3$ | 0.990 – 1.003 | Correlates inversely with alcohol and directly with sugar concentration. |
| **Chlorides** | $g(NaCl)/dm^3$ | 0.012 – 0.611 | Mineral salts; excessive concentrations impart an unpleasant briny taste. |

---

## 📊 Model Performance & Benchmarks

Models trained on **6,497** wine samples from the UCI Cortez et al. dataset:

| Model | Varietal | Accuracy | ROC-AUC | F1-Score |
| :--- | :--- | :---: | :---: | :---: |
| **Random Forest** | Red Wine | **79.7%** | **0.887** | **0.96** |
| **Random Forest** | White Wine | **83.3%** | **0.890** | **0.95** |
| **Logistic Regression** | Red Wine | 74.1% | 0.824 | 0.76 |
| **Logistic Regression** | White Wine | 74.1% | 0.791 | 0.75 |

### Top Feature Importances (Random Forest):
1. 🍇 **Alcohol**: ~18.5%
2. 🛡️ **Sulphates**: ~14.1%
3. 🧪 **Volatile Acidity**: ~11.5%
4. 💨 **Total Sulfur Dioxide**: ~10.0%
5. ⚖️ **Density**: ~9.1%

---

## 🗂️ Project Structure

```
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions auto-deploy to GitHub Pages
├── css/
│   └── styles.css              # Winery / Sommelier UI theme & animations
├── js/
│   ├── app.js                  # Main UI controller & two-way slider bindings
│   ├── model.js                # Client-side ML inference engine (exact weights)
│   ├── charts.js               # Chart.js radar & SVG circular gauge controller
│   └── batch.js                # Batch CSV drag-and-drop parser & exporter
├── model/
│   ├── train.py                # Dataset download, training & JSON weight export
│   ├── evaluate.py             # Metrics, confusion matrix, ROC-AUC validation
│   ├── wine_model.json         # Exported model weights & benchmarks
│   ├── wine_red_rf.joblib      # Serialized Red wine Random Forest
│   ├── wine_white_rf.joblib    # Serialized White wine Random Forest
│   └── data/
│       ├── winequality-red.csv
│       └── winequality-white.csv
├── app.py                      # Optional Python REST API & local web server
├── index.html                  # Interactive Single-Page Application
├── sample_wines.csv            # Demo CSV with mixed wines for batch testing
├── requirements.txt            # Python dependencies
├── .gitignore                  # Git ignore rules
├── LICENSE                     # MIT License
└── README.md                   # Project documentation
```

---

## 🚀 Getting Started

### Option 1: Quick Run in Browser (No Installation)
Simply double-click `index.html` in any web browser, or launch a simple local server:
```bash
python -m http.server 8000
```
Open `http://localhost:8000` to interact with the classifier.

---

### Option 2: Run Python REST API & Server
1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/wine-quality-classifier.git
   cd wine-quality-classifier
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Start the server:
   ```bash
   python app.py
   ```
   Navigate to `http://localhost:8000` to access the web UI or test the endpoints:
   - **Health Check**: `GET /api/health`
   - **Predict**: `POST /api/predict`
   - **Batch**: `POST /api/batch`

---

### Option 3: Retrain the Machine Learning Models
To fetch fresh data from UCI and re-train the models:
```bash
python model/train.py
```
To view detailed confusion matrices and classification reports:
```bash
python model/evaluate.py
```

---

## 🌐 Deploying to GitHub Pages (1-Click)

1. Push this repository to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Wine Quality Classifier web application"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

2. On your GitHub repository page:
   - Go to **Settings** > **Pages**.
   - Under **Build and deployment**, select **GitHub Actions** as the source.
   - The included `.github/workflows/deploy.yml` will automatically build and publish the website to `https://<YOUR_USERNAME>.github.io/<YOUR_REPO_NAME>/`!

---

## 📜 Academic Citation

If you use this work or dataset, please cite the original authors:

```bibtex
@article{cortez2009modeling,
  title={Modeling wine preferences by data mining from physicochemical properties},
  author={Cortez, Paulo and Cerdeira, Ant{\'o}nio and Almeida, Fernando and Matos, Telmo and Reis, Jos{\'e}},
  journal={Decision Support Systems},
  volume={47},
  number={4},
  pages={547--553},
  year={2009},
  publisher={Elsevier}
}
```

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.
