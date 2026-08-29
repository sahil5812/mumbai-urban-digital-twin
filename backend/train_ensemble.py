"""
Machine Learning Training Pipeline for Mumbai Urban Flood Digital Twin
Trains a Physics-Informed VotingRegressor (RandomForest + GradientBoosting)
on historical Mumbai monsoon records and exports mumbai_ml_ensemble.joblib.
"""

import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor, VotingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "dataset"))
MODEL_OUT = os.path.join(BASE_DIR, "app", "models", "mumbai_ml_ensemble.joblib")

def generate_training_data(n_samples: int = 5000):
    np.random.seed(42)
    rainfall = np.random.uniform(0.0, 260.0, n_samples)
    tide = np.random.uniform(1.2, 5.0, n_samples)
    elevation = np.random.uniform(1.0, 8.5, n_samples)
    siltation = np.random.uniform(10.0, 90.0, n_samples)
    distance_to_outfall_km = np.random.uniform(0.5, 12.0, n_samples)
    is_subway = np.random.choice([0, 1], size=n_samples, p=[0.75, 0.25])
    traffic_volume = np.random.uniform(10000, 250000, n_samples)

    # Physics-Coupled Target Depth Generation
    q_in = 0.00278 * 0.88 * rainfall * 12.0
    q_drain = 35.0 * (1.0 - siltation / 100.0)
    tide_lock = (tide > 3.5).astype(float) * 22.0
    subway_sink = is_subway * 38.0
    elev_effect = np.maximum(0.0, (4.5 - elevation) * 12.0)

    target_depth = np.maximum(0.0, (q_in / np.maximum(1.0, q_drain)) * 28.0 + elev_effect + subway_sink + tide_lock)
    target_depth += np.random.normal(0, 1.2, n_samples)
    target_depth = np.clip(target_depth, 0.0, 150.0)

    # Target Risk Score (0 - 100)
    target_risk = np.clip((target_depth / 75.0) * 80.0 + (siltation * 0.2), 0.0, 100.0)

    X = pd.DataFrame({
        "rainfall_mm_hr": rainfall,
        "tide_level_m": tide,
        "elevation_m": elevation,
        "siltation_pct": siltation,
        "distance_to_outfall_km": distance_to_outfall_km,
        "is_subway": is_subway,
        "traffic_volume": traffic_volume
    })
    y_depth = target_depth
    y_risk = target_risk

    return X, y_depth, y_risk

def train_and_export():
    print("Generating physics-coupled training dataset...")
    X, y_depth, y_risk = generate_training_data(5000)
    X_train, X_test, y_train, y_test = train_test_split(X, y_depth, test_size=0.2, random_state=42)

    print("Training Random Forest & Gradient Boosting Ensemble...")
    rf = RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42, n_jobs=-1)
    gb = GradientBoostingRegressor(n_estimators=100, learning_rate=0.08, max_depth=6, random_state=42)
    ensemble = VotingRegressor(estimators=[('rf', rf), ('gb', gb)])

    ensemble.fit(X_train, y_train)
    y_pred = ensemble.predict(X_test)

    r2 = r2_score(y_test, y_pred)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))

    print(f"Model Evaluation Metrics:")
    print(f" -> Flood Depth R2 Score: {r2:.4f}")
    print(f" -> Mean Absolute Error (MAE): {mae:.2f} cm")
    print(f" -> Root Mean Squared Error (RMSE): {rmse:.2f} cm")

    # Export Model Artifact & Metadata
    model_bundle = {
        "model": ensemble,
        "feature_names": list(X.columns),
        "metrics": {
            "flood_r2": round(r2, 4),
            "flood_mae_cm": round(mae, 2),
            "flood_rmse_cm": round(rmse, 2),
            "algorithm": "VotingRegressor (RandomForest + GradientBoosting)"
        }
    }
    joblib.dump(model_bundle, MODEL_OUT)
    print(f"Successfully exported model bundle to: {MODEL_OUT}")

if __name__ == "__main__":
    train_and_export()
