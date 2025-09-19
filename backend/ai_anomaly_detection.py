import tensorflow as tf
import numpy as np
from datetime import datetime, timedelta
import json
from typing import List, Dict, Tuple
from geopy.distance import geodesic
import pandas as pd
from sklearn.preprocessing import StandardScaler
import joblib
import os

class AnomalyDetectionModel:
    def __init__(self, model_path: str = None):
        self.model = None
        self.scaler = StandardScaler()
        self.model_path = model_path or "anomaly_model.keras"
        self.scaler_path = "scaler.pkl"
        self.deviation_threshold_km = 2.0  # Default threshold for deviation
        self.inactivity_threshold_minutes = 30
        self.load_or_create_model()
    
    def load_or_create_model(self):
        """Load existing model or create a new one"""
        if os.path.exists(self.model_path) and os.path.exists(self.scaler_path):
            try:
                self.model = tf.keras.models.load_model(self.model_path)
                self.scaler = joblib.load(self.scaler_path)
                print("Loaded existing anomaly detection model")
            except Exception as e:
                print(f"Error loading model: {e}")
                self.create_new_model()
        else:
            self.create_new_model()
    
    def create_new_model(self):
        """Create a new anomaly detection model"""
        # Define model architecture
        self.model = tf.keras.Sequential([
            tf.keras.layers.Dense(64, activation='relu', input_shape=(8,)),
            tf.keras.layers.Dropout(0.3),
            tf.keras.layers.Dense(32, activation='relu'),
            tf.keras.layers.Dropout(0.2),
            tf.keras.layers.Dense(16, activation='relu'),
            tf.keras.layers.Dense(1, activation='sigmoid')  # Binary classification
        ])
        
        self.model.compile(
            optimizer='adam',
            loss='binary_crossentropy',
            metrics=['accuracy', 'precision', 'recall']
        )
        
        # Generate synthetic training data for initial model
        self.train_with_synthetic_data()
        print("Created new anomaly detection model with synthetic data")
    
    def generate_synthetic_data(self, n_samples: int = 10000) -> Tuple[np.ndarray, np.ndarray]:
        """Generate synthetic training data"""
        np.random.seed(42)
        
        # Features: [lat_deviation, lng_deviation, time_since_last_update, 
        #           distance_from_itinerary, speed, hour_of_day, day_of_week, is_weekend]
        
        # Normal behavior (80% of data)
        normal_samples = int(n_samples * 0.8)
        normal_data = []
        
        for _ in range(normal_samples):
            # Normal tourist behavior
            lat_deviation = np.random.normal(0, 0.001)  # Small deviation
            lng_deviation = np.random.normal(0, 0.001)
            time_since_update = np.random.exponential(5)  # Minutes, mostly frequent updates
            distance_from_itinerary = np.random.exponential(0.5)  # KM, mostly close to plan
            speed = np.random.normal(4, 2)  # KM/h, walking speed
            speed = max(0, min(speed, 50))  # Reasonable bounds
            hour_of_day = np.random.uniform(6, 22)  # Active hours
            day_of_week = np.random.randint(0, 7)
            is_weekend = 1 if day_of_week >= 5 else 0
            
            normal_data.append([
                lat_deviation, lng_deviation, time_since_update,
                distance_from_itinerary, speed, hour_of_day, day_of_week, is_weekend
            ])
        
        # Anomalous behavior (20% of data)
        anomaly_samples = n_samples - normal_samples
        anomaly_data = []
        
        for _ in range(anomaly_samples):
            # Anomalous tourist behavior
            if np.random.random() < 0.4:  # Large deviation from itinerary
                lat_deviation = np.random.uniform(-0.05, 0.05)
                lng_deviation = np.random.uniform(-0.05, 0.05)
                distance_from_itinerary = np.random.uniform(2, 20)  # Far from plan
                time_since_update = np.random.exponential(10)
                speed = np.random.normal(4, 3)
            elif np.random.random() < 0.6:  # Long inactivity
                lat_deviation = np.random.normal(0, 0.0001)
                lng_deviation = np.random.normal(0, 0.0001)
                time_since_update = np.random.uniform(30, 180)  # Long gap
                distance_from_itinerary = np.random.exponential(1)
                speed = np.random.uniform(0, 1)  # Very slow/stationary
            else:  # Unusual speed/movement patterns
                lat_deviation = np.random.normal(0, 0.01)
                lng_deviation = np.random.normal(0, 0.01)
                time_since_update = np.random.exponential(8)
                distance_from_itinerary = np.random.exponential(2)
                speed = np.random.uniform(30, 100)  # Unusually fast
            
            hour_of_day = np.random.uniform(0, 24)
            day_of_week = np.random.randint(0, 7)
            is_weekend = 1 if day_of_week >= 5 else 0
            
            anomaly_data.append([
                lat_deviation, lng_deviation, time_since_update,
                distance_from_itinerary, speed, hour_of_day, day_of_week, is_weekend
            ])
        
        # Combine data
        X = np.array(normal_data + anomaly_data)
        y = np.array([0] * normal_samples + [1] * anomaly_samples)
        
        # Shuffle data
        indices = np.random.permutation(len(X))
        X = X[indices]
        y = y[indices]
        
        return X, y
    
    def train_with_synthetic_data(self):
        """Train the model with synthetic data"""
        X, y = self.generate_synthetic_data()
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Split data
        split_idx = int(len(X) * 0.8)
        X_train, X_val = X_scaled[:split_idx], X_scaled[split_idx:]
        y_train, y_val = y[:split_idx], y[split_idx:]
        
        # Train model
        history = self.model.fit(
            X_train, y_train,
            epochs=50,
            batch_size=32,
            validation_data=(X_val, y_val),
            verbose=0
        )
        
        # Save model and scaler
        self.save_model()
        
        return history
    
    def save_model(self):
        """Save the model and scaler"""
        try:
            self.model.save(self.model_path)
            joblib.dump(self.scaler, self.scaler_path)
            print("Model and scaler saved successfully")
        except Exception as e:
            print(f"Error saving model: {e}")
    
    def extract_features(self, tourist_data: Dict) -> np.ndarray:
        """Extract features from tourist data"""
        current_lat = tourist_data.get('latitude')
        current_lng = tourist_data.get('longitude')
        timestamp = tourist_data.get('timestamp')
        planned_itinerary = tourist_data.get('planned_itinerary', [])
        last_update = tourist_data.get('last_location_update')
        
        # Calculate features
        lat_deviation = 0
        lng_deviation = 0
        distance_from_itinerary = 0
        
        if planned_itinerary:
            # Find closest planned location
            min_distance = float('inf')
            for location in planned_itinerary:
                if 'lat' in location and 'lng' in location:
                    distance = geodesic(
                        (current_lat, current_lng),
                        (location['lat'], location['lng'])
                    ).kilometers
                    if distance < min_distance:
                        min_distance = distance
                        lat_deviation = abs(current_lat - location['lat'])
                        lng_deviation = abs(current_lng - location['lng'])
            
            distance_from_itinerary = min_distance if min_distance != float('inf') else 0
        
        # Time since last update
        time_since_update = 0
        if last_update:
            if isinstance(last_update, str):
                last_update = datetime.fromisoformat(last_update.replace('Z', '+00:00'))
            if isinstance(timestamp, str):
                timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            
            time_diff = timestamp - last_update
            time_since_update = time_diff.total_seconds() / 60  # Convert to minutes
        
        # Calculate speed (simplified)
        speed = tourist_data.get('speed', 0)
        
        # Time-based features
        if isinstance(timestamp, str):
            timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        
        hour_of_day = timestamp.hour
        day_of_week = timestamp.weekday()
        is_weekend = 1 if day_of_week >= 5 else 0
        
        features = np.array([
            lat_deviation, lng_deviation, time_since_update,
            distance_from_itinerary, speed, hour_of_day, day_of_week, is_weekend
        ]).reshape(1, -1)
        
        return features
    
    def predict_anomaly(self, tourist_data: Dict) -> Dict:
        """Predict if the tourist data indicates an anomaly"""
        try:
            # Extract features
            features = self.extract_features(tourist_data)
            
            # Scale features
            features_scaled = self.scaler.transform(features)
            
            # Make prediction
            prediction = self.model.predict(features_scaled, verbose=0)[0][0]
            
            # Determine anomaly flag and reason
            anomaly_flag = prediction > 0.5
            risk_score = float(prediction)
            
            # Determine specific reason for anomaly
            reason = self.determine_anomaly_reason(tourist_data, features[0])
            
            return {
                "tourist_id": tourist_data.get('tourist_id'),
                "anomaly_flag": bool(anomaly_flag),
                "reason": reason if anomaly_flag else None,
                "risk_score": risk_score,
                "timestamp": tourist_data.get('timestamp')
            }
        
        except Exception as e:
            return {
                "tourist_id": tourist_data.get('tourist_id'),
                "anomaly_flag": False,
                "reason": f"Error in prediction: {str(e)}",
                "risk_score": 0.0,
                "timestamp": tourist_data.get('timestamp')
            }
    
    def determine_anomaly_reason(self, tourist_data: Dict, features: np.ndarray) -> str:
        """Determine the specific reason for anomaly detection"""
        reasons = []
        
        # Check deviation from itinerary
        distance_from_itinerary = features[3]
        if distance_from_itinerary > self.deviation_threshold_km:
            reasons.append(f"Deviation from planned itinerary: {distance_from_itinerary:.2f} km")
        
        # Check inactivity
        time_since_update = features[2]
        if time_since_update > self.inactivity_threshold_minutes:
            reasons.append(f"Prolonged inactivity: {time_since_update:.1f} minutes")
        
        # Check unusual speed
        speed = features[4]
        if speed > 50:  # Unusually fast
            reasons.append(f"Unusual speed detected: {speed:.1f} km/h")
        elif speed == 0 and time_since_update > 15:  # Stationary for too long
            reasons.append("Stationary for extended period")
        
        # Check time patterns
        hour_of_day = features[5]
        if hour_of_day < 6 or hour_of_day > 23:
            reasons.append("Activity during unusual hours")
        
        return "; ".join(reasons) if reasons else "General anomaly detected"
    
    def retrain_with_new_data(self, new_data: List[Dict], labels: List[int]):
        """Retrain the model with new labeled data"""
        if len(new_data) < 10:
            print("Not enough new data for retraining")
            return
        
        # Extract features from new data
        new_features = []
        for data in new_data:
            features = self.extract_features(data)
            new_features.append(features[0])
        
        new_X = np.array(new_features)
        new_y = np.array(labels)
        
        # Scale new features
        new_X_scaled = self.scaler.transform(new_X)
        
        # Retrain model
        self.model.fit(new_X_scaled, new_y, epochs=10, verbose=0)
        
        # Save updated model
        self.save_model()
        print(f"Model retrained with {len(new_data)} new samples")


# Global model instance
anomaly_model = AnomalyDetectionModel()