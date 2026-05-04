from sklearn.ensemble import IsolationForest
import numpy as np
import pandas as pd
import pickle
import os

class AnomalyDetector:
    def __init__(self):
        self.model = IsolationForest(contamination=0.1, random_state=42)
        self.is_fitted = False
        self.history = []

    def train(self, data_points: list):
        if len(data_points) < 10:
            return # Not enough data to train

        df = pd.DataFrame(data_points)
        # Features: RSSI, Channel, Data Rate (depending on what we capture)
        # For simplicity, we use RSSI
        X = df[['rssi']]
        self.model.fit(X)
        self.is_fitted = True
        
        # Save the model as requested in the deliverables
        with open('model_iforest.pkl', 'wb') as f:
            pickle.dump(self.model, f)

    def predict(self, rssi):
        if not self.is_fitted:
            # Try to load existing model
            if os.path.exists('model_iforest.pkl'):
                with open('model_iforest.pkl', 'rb') as f:
                    self.model = pickle.load(f)
                    self.is_fitted = True
            else:
                return 0.0 # Unknown

        X = pd.DataFrame([[rssi]], columns=['rssi'])
        score = self.model.decision_function(X)[0]
        # Invert score: lower is more anomalous
        return float(score)

# Global detector instance
detector = AnomalyDetector()
