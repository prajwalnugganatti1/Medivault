import pandas as pd
import app

def test_pipeline():
    df = pd.read_csv("sample_wines.csv")
    print(f"[TEST] Successfully loaded {len(df)} sample wines from sample_wines.csv")
    
    correct = 0
    for idx, row in df.iterrows():
        sample = row.to_dict()
        res = app.predict_wine_quality(sample, "red" if "Sauvignon" not in row["name"] and "White" not in row["name"] else "white")
        expected = row["expected_quality"]
        actual = res["prediction"]
        is_match = (expected.lower() == actual.lower())
        if is_match:
            correct += 1
        print(f"  Sample {row['wine_id']}: {row['name'][:30]:30s} | Exp: {expected:4s} | Pred: {actual:4s} ({res['probability']:2d}%) | {'PASS' if is_match else 'FAIL'}")

    accuracy = (correct / len(df)) * 100
    print(f"\n[SUMMARY] Batch Prediction Test: {correct}/{len(df)} passed ({accuracy:.1f}%)")

if __name__ == "__main__":
    test_pipeline()
