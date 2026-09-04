#!/usr/bin/env python3
"""
Wine Quality Classifier - Model Evaluation & Metrics
Generates classification report, confusion matrix, and feature analysis.
"""

import os
import joblib
import pandas as pd
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
from train import FEATURES, load_and_preprocess, DATA_DIR

def evaluate(wine_type="red"):
    csv_path = os.path.join(DATA_DIR, f"winequality-{wine_type}.csv")
    model_path = os.path.join(os.path.dirname(__file__), f"wine_{wine_type}_rf.joblib")

    if not os.path.exists(csv_path) or not os.path.exists(model_path):
        print("Model or dataset missing. Please run `python model/train.py` first.")
        return

    df = load_and_preprocess(csv_path)
    X = df[FEATURES]
    y = df["target"]

    model = joblib.load(model_path)
    preds = model.predict(X)
    probs = model.predict_proba(X)[:, 1]

    print(f"\n================ Evaluation Report: {wine_type.upper()} WINE ================")
    print("Confusion Matrix:")
    cm = confusion_matrix(y, preds)
    print(f"  True Bad:  {cm[0][0]:5d} | False Good: {cm[0][1]:5d}")
    print(f"  False Bad: {cm[1][0]:5d} | True Good:  {cm[1][1]:5d}")

    print("\nClassification Metrics:")
    print(classification_report(y, preds, target_names=["Bad/Average (<6)", "Good (>=6)"]))
    print(f"ROC-AUC Score: {roc_auc_score(y, probs):.4f}")

if __name__ == "__main__":
    evaluate("red")
    evaluate("white")
