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
            return

        df = pd.DataFrame(data_points)
        # Multi-feature detection: RSSI, packet_count, mac_change_flag
        features = []
        for col in ['rssi', 'packet_count', 'mac_change_flag']:
            if col not in df.columns:
                df[col] = 0
        X = df[['rssi', 'packet_count', 'mac_change_flag']]
        self.model.fit(X)
        self.is_fitted = True

        with open('model_iforest.pkl', 'wb') as f:
            pickle.dump(self.model, f)

    def predict(self, rssi, packet_count=0, mac_change_flag=0):
        if not self.is_fitted:
            if os.path.exists('model_iforest.pkl'):
                with open('model_iforest.pkl', 'rb') as f:
                    self.model = pickle.load(f)
                    self.is_fitted = True
            else:
                return 0.0

        X = pd.DataFrame(
            [[rssi, packet_count, mac_change_flag]],
            columns=['rssi', 'packet_count', 'mac_change_flag']
        )
        score = self.model.decision_function(X)[0]
        return float(score)

    def score_to_threat(self, score):
        # Isolation Forest scores: ~0.5 = normal, ~-0.5 = anomalous
        # Map to 0-100 where 100 = most threatening
        normalized = (score + 0.5) / 1.0   # 0.0 = anomalous, 1.0 = normal
        threat = (1 - normalized) * 100
        return max(0, min(100, int(threat)))

# Global detector instance
detector = AnomalyDetector()
