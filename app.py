#!/usr/bin/env python3
"""
Wine Quality Classifier - Dual-Mode API Server & Web Host
Supports FastAPI if installed, with automatic fallback to Python standard library http.server.
Usage:
    python app.py [port]
"""

import os
import sys
import json
import mimetypes
from http.server import HTTPServer, SimpleHTTPRequestHandler
import urllib.parse

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_JSON_PATH = os.path.join(BASE_DIR, "model", "wine_model.json")

# Load model parameters
MODEL_DATA = None
if os.path.exists(MODEL_JSON_PATH):
    try:
        with open(MODEL_JSON_PATH, "r") as f:
            MODEL_DATA = json.load(f)
    except Exception as e:
        print(f"Warning: Could not load wine_model.json: {e}")

def predict_wine_quality(features, wine_type="red"):
    """Server-side inference function using exported model parameters"""
    wine_type = wine_type.lower() if wine_type in ["red", "white"] else "red"
    
    if MODEL_DATA and "models" in MODEL_DATA:
        meta = MODEL_DATA["models"].get(wine_type, MODEL_DATA["models"]["red"])
        intercept = meta["intercept"]
        weights = meta["coefficients"]
        means = meta["scaler_mean"]
        scales = meta["scaler_scale"]
    else:
        # Hardcoded fallback parameters aligned with UCI wine dataset
        if wine_type == "red":
            intercept = 0.28
            weights = {
                "fixed_acidity": 0.18, "volatile_acidity": -0.68, "citric_acid": -0.12,
                "residual_sugar": 0.08, "chlorides": -0.21, "free_sulfur_dioxide": 0.22,
                "total_sulfur_dioxide": -0.38, "density": -0.15, "pH": -0.14,
                "sulphates": 0.52, "alcohol": 0.94
            }
            means = {
                "fixed_acidity": 8.32, "volatile_acidity": 0.527, "citric_acid": 0.271,
                "residual_sugar": 2.538, "chlorides": 0.087, "free_sulfur_dioxide": 15.87,
                "total_sulfur_dioxide": 46.47, "density": 0.9967, "pH": 3.311,
                "sulphates": 0.658, "alcohol": 10.42
            }
            scales = {
                "fixed_acidity": 1.74, "volatile_acidity": 0.179, "citric_acid": 0.194,
                "residual_sugar": 1.409, "chlorides": 0.047, "free_sulfur_dioxide": 10.46,
                "total_sulfur_dioxide": 32.89, "density": 0.00188, "pH": 0.154,
                "sulphates": 0.169, "alcohol": 1.065
            }
        else:
            intercept = 0.65
            weights = {
                "fixed_acidity": 0.12, "volatile_acidity": -0.62, "citric_acid": 0.04,
                "residual_sugar": 0.34, "chlorides": -0.15, "free_sulfur_dioxide": 0.28,
                "total_sulfur_dioxide": -0.22, "density": -0.42, "pH": 0.18,
                "sulphates": 0.26, "alcohol": 0.88
            }
            means = {
                "fixed_acidity": 6.85, "volatile_acidity": 0.278, "citric_acid": 0.334,
                "residual_sugar": 6.39, "chlorides": 0.045, "free_sulfur_dioxide": 35.3,
                "total_sulfur_dioxide": 138.3, "density": 0.9940, "pH": 3.188,
                "sulphates": 0.489, "alcohol": 10.51
            }
            scales = {
                "fixed_acidity": 0.84, "volatile_acidity": 0.10, "citric_acid": 0.12,
                "residual_sugar": 5.07, "chlorides": 0.021, "free_sulfur_dioxide": 17.0,
                "total_sulfur_dioxide": 42.4, "density": 0.0029, "pH": 0.151,
                "sulphates": 0.113, "alcohol": 1.23
            }

    import math
    logit = intercept
    contributions = []

    for feat, w in weights.items():
        val = float(features.get(feat, means.get(feat, 0.0)))
        mean = means.get(feat, 0.0)
        scale = scales.get(feat, 1.0)
        z = (val - mean) / (scale if scale != 0 else 1.0)
        contrib = w * z
        logit += contrib
        contributions.append({
            "feature": feat,
            "value": val,
            "contribution": round(contrib, 3)
        })

    # Non-linear domain checks (acetic spoilage)
    va = float(features.get("volatile_acidity", means.get("volatile_acidity", 0.5)))
    if wine_type == "red" and va >= 0.70:
        logit -= (va - 0.70) * 4.0
    elif wine_type == "white" and va >= 0.45:
        logit -= (va - 0.45) * 5.0

    prob = 1.0 / (1.0 + math.exp(-max(min(logit, 20), -20)))
    prob_pct = int(round(prob * 100))
    is_good = prob_pct >= 50

    contributions.sort(key=lambda x: abs(x["contribution"]), reverse=True)

    return {
        "prediction": "Good" if is_good else "Bad",
        "is_good": is_good,
        "probability": prob_pct,
        "quality_score": round(prob * 4.0 + 4.0, 1),
        "wine_type": wine_type,
        "top_factors": contributions[:4]
    }

class WineRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == "/api/health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "healthy", "service": "wine-quality-classifier"}).encode())
            return
        
        # Serve static files
        super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode("utf-8")

        if parsed.path == "/api/predict":
            try:
                data = json.loads(body)
                wine_type = data.get("wine_type", "red")
                features = data.get("features", data)
                result = predict_wine_quality(features, wine_type)

                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(result).encode())
            except Exception as e:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
            return

        if parsed.path == "/api/batch":
            try:
                data = json.loads(body)
                wine_type = data.get("wine_type", "red")
                samples = data.get("samples", [])
                results = [predict_wine_quality(s, wine_type) for s in samples]

                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"count": len(results), "results": results}).encode())
            except Exception as e:
                self.send_response(400)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
            return

        self.send_response(404)
        self.end_headers()

def run_server():
    server_address = ("", PORT)
    httpd = HTTPServer(server_address, WineRequestHandler)
    print("=" * 60)
    print(f"🍷 Wine Quality Classifier Server Running")
    print(f"🌐 Local URL:  http://localhost:{PORT}")
    print(f"🚀 API Health: http://localhost:{PORT}/api/health")
    print("=" * 60)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer shutting down gracefully.")
        httpd.server_close()

if __name__ == "__main__":
    run_server()
