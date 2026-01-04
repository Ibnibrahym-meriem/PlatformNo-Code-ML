import pandas as pd
import numpy as np
import time
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import (
    accuracy_score, f1_score, precision_score, recall_score, confusion_matrix, 
    mean_squared_error, r2_score, mean_absolute_error, silhouette_score
)
from app.utils.file_manager import load_data_session

# --- ALGORITHMS IMPORTS ---
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor, GradientBoostingClassifier, GradientBoostingRegressor
from sklearn.svm import SVC, SVR
from sklearn.neighbors import KNeighborsClassifier, KNeighborsRegressor
from sklearn.naive_bayes import GaussianNB
from sklearn.neural_network import MLPClassifier, MLPRegressor
from sklearn.cluster import KMeans
from sklearn.preprocessing import PolynomialFeatures, StandardScaler
from sklearn.pipeline import make_pipeline

class ModelTrainingService:
    
    def detect_problem_type(self, session_id: str, target_column: str = None):
        """ Detects if the problem is Regression, Classification, or Unsupervised. """
        df = load_data_session(session_id)
        if not target_column or target_column.strip() == "":
            return {"problem_type": "Unsupervised"}
        if target_column not in df.columns: raise ValueError(f"Column '{target_column}' not found.")
        
        target_data = df[target_column]
        if pd.api.types.is_numeric_dtype(target_data) and target_data.nunique() > 20: 
            return {"problem_type": "Regression"}
        else:
            return {"problem_type": "Classification"}

    def train_model(self, session_id: str, target_column: str, problem_type: str, algorithm_name: str, split_ratio: float = 0.2, k_folds: int = 5, hyperparameters: dict = None):
        
        # Ensure hyperparameters is a dictionary if None passed
        hyperparameters = hyperparameters or {}

        start_time = time.time() # Start timer
        df = load_data_session(session_id)
        
        # 1. Normalize Problem Type 
        # This ensures "classification" and "Classification" are treated the same.
        p_type = problem_type.title()  # Converts to "Classification" or "Regression"

        # --- A. UNSUPERVISED ---
        if p_type == "Unsupervised":
            X = df.select_dtypes(include=[np.number])
            model = self._get_unsupervised_algorithm(algorithm_name)
            model.fit(X)
            score = silhouette_score(X, model.labels_) if len(np.unique(model.labels_)) > 1 else 0
            
            return {
                "algorithm": algorithm_name,
                "problem_type": "Unsupervised",
                "metrics": {"silhouette_score": round(score, 4)},
                "status": "Success"
            }

        # --- B. SUPERVISED ---
        # Select only numeric features for training
        X = df.drop(columns=[target_column]).select_dtypes(include=[np.number])
        y = df[target_column]
        
        # Handle scaling for specific algorithms
        if algorithm_name in ["Support Vector Machine (SVM)", "K-Nearest Neighbors (KNN)", "Neural Network"]:
            scaler = StandardScaler()
            X = scaler.fit_transform(X)

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=split_ratio, random_state=42)
        # PASS HYPERPARAMETERS 
        model = self._get_supervised_algorithm(algorithm_name, p_type, hyperparameters)

        # 2. Cross-Validation (Stability Check)
        cv_metric = 'accuracy' if p_type == "Classification" else 'r2'
        try:
            cv_scores = cross_val_score(model, X_train, y_train, cv=k_folds, scoring=cv_metric)
            avg_cv_score = float(np.mean(cv_scores))
        except:
            avg_cv_score = 0.0

        # 3. Train Final Model
        model.fit(X_train, y_train)
        
        # 4. Predict
        predictions = model.predict(X_test)
        
        # 5. Calculate Detailed Metrics
        metrics = {}
        metrics["cv_score_mean"] = round(avg_cv_score, 4)
        metrics["training_time_sec"] = round(time.time() - start_time, 4)
        
        if p_type == "Classification":
            # Classification Metrics
            metrics["accuracy"] = round(accuracy_score(y_test, predictions), 4)
            metrics["f1_score"] = round(f1_score(y_test, predictions, average='weighted'), 4)
            metrics["precision"] = round(precision_score(y_test, predictions, average='weighted', zero_division=0), 4)
            metrics["recall"] = round(recall_score(y_test, predictions, average='weighted', zero_division=0), 4)
            
            # Confusion Matrix (Converted to list for JSON compatibility)
            # This is crucial for the "Results" widget grid
            cm = confusion_matrix(y_test, predictions)
            metrics["confusion_matrix"] = cm.tolist() 
            
        else:
            # Regression Metrics
            metrics["rmse"] = round(np.sqrt(mean_squared_error(y_test, predictions)), 4)
            metrics["mae"] = round(mean_absolute_error(y_test, predictions), 4) # Mean Absolute Error (Real units)
            metrics["r2_score"] = round(r2_score(y_test, predictions), 4)

        return {
            "algorithm": algorithm_name,
            "problem_type": p_type,
            "metrics": metrics,
            "params": {"k_folds": k_folds, "split_ratio": split_ratio},
            "status": "Success"
        }

    def _get_supervised_algorithm(self, name: str, problem_type: str, params: dict):
        
        # Special handling for Polynomial Regression (Pipeline)
        if name == "Polynomial Regression":
            degree = params.get("degree", 2)
            return make_pipeline(PolynomialFeatures(degree=degree), LinearRegression())

        # For Neural Networks, tuple conversion is often needed from JSON lists
        if name == "Neural Network" and "hidden_layer_sizes" in params:
             # Ensure it's a tuple if it came in as a list [100, 50]
             if isinstance(params["hidden_layer_sizes"], list):
                 params["hidden_layer_sizes"] = tuple(params["hidden_layer_sizes"])

        # Define the classes
        if problem_type == "Regression":
            models = {
                "Linear Regression": LinearRegression, # Note: storing class, not instance yet
                "Decision Tree": DecisionTreeRegressor,
                "Random Forest": RandomForestRegressor,
                "Support Vector Machine (SVM)": SVR,
                "K-Nearest Neighbors (KNN)": KNeighborsRegressor,
                "Neural Network": MLPRegressor,
                "Gradient Boosting": GradientBoostingRegressor
            }
        else: 
            models = {
                "Logistic Regression": LogisticRegression,
                "Decision Tree": DecisionTreeClassifier,
                "Random Forest": RandomForestClassifier,
                "Support Vector Machine (SVM)": SVC,
                "K-Nearest Neighbors (KNN)": KNeighborsClassifier,
                "Naive Bayes": GaussianNB,
                "Neural Network": MLPClassifier,
                "Gradient Boosting": GradientBoostingClassifier
            }
        
        if name not in models:
             # Fallback for Polynomial (already handled) or error
             if name == "Polynomial Regression": return make_pipeline(PolynomialFeatures(2), LinearRegression())
             raise ValueError(f"Algorithm '{name}' not found.")

        # INSTANTIATE WITH PARAMETERS
        # This takes the Class (e.g., RandomForest) and initializes it with **params
        # Example: RandomForestRegressor(n_estimators=100, max_depth=10)
        
        # Note: We must ensure specific defaults if params are empty
        model_class = models[name]
        
        # Some models require specific defaults if not provided in params
        if name == "Neural Network":
             if "max_iter" not in params: params["max_iter"] = 500
        if name == "Logistic Regression":
             if "max_iter" not in params: params["max_iter"] = 1000

        return model_class(**params)
        # ... (Keep your existing _get_supervised_algorithm code here) ...
        # Ensure the keys match exactly what the frontend sends
        if problem_type == "Regression":
            models = {
                "Linear Regression": LinearRegression(),
                "Polynomial Regression": make_pipeline(PolynomialFeatures(degree=2), LinearRegression()),
                "Decision Tree": DecisionTreeRegressor(),
                "Random Forest": RandomForestRegressor(),
                "Support Vector Machine (SVM)": SVR(),
                "K-Nearest Neighbors (KNN)": KNeighborsRegressor(),
                "Neural Network": MLPRegressor(max_iter=500),
                "Gradient Boosting": GradientBoostingRegressor()
            }
        else: 
            models = {
                "Logistic Regression": LogisticRegression(max_iter=1000),
                "Decision Tree": DecisionTreeClassifier(),
                "Random Forest": RandomForestClassifier(),
                "Support Vector Machine (SVM)": SVC(),
                "K-Nearest Neighbors (KNN)": KNeighborsClassifier(),
                "Naive Bayes": GaussianNB(),
                "Neural Network": MLPClassifier(max_iter=500),
                "Gradient Boosting": GradientBoostingClassifier()
            }
        
        # We need a fallback or partial match if names slightly differ
        if name not in models:
            raise ValueError(f"Algorithm '{name}' not found for {problem_type}. Available: {list(models.keys())}")
        return models[name]

    def _get_unsupervised_algorithm(self, name: str):
        return KMeans(n_clusters=3)