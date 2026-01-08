import pandas as pd
import numpy as np
import time
import os
from fpdf import FPDF
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import (
    accuracy_score, f1_score, precision_score, recall_score, confusion_matrix, 
    mean_squared_error, r2_score, mean_absolute_error, silhouette_score,
    roc_auc_score, log_loss, matthews_corrcoef, roc_curve
)
from app.utils.file_manager import load_data_session, TEMP_FOLDER 
import matplotlib
matplotlib.use('Agg') # Essential: Prevents server errors when plotting
import matplotlib.pyplot as plt
import seaborn as sns
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
        # ✅ Logic: If no target provided, it's Unsupervised
        if not target_column or target_column.strip() == "":
            return {"problem_type": "Unsupervised"}
        
        if target_column not in df.columns: raise ValueError(f"Column '{target_column}' not found.")
        
        target_data = df[target_column]
        if pd.api.types.is_numeric_dtype(target_data) and target_data.nunique() > 20: 
            return {"problem_type": "Regression"}
        else:
            return {"problem_type": "Classification"}

    # ✅  Main Entry Point for Multiple Models
    def train_models(self, session_id: str, target_column: str, problem_type: str, algorithm_names: list, split_ratio: float = 0.2, k_folds: int = 5, hyperparameters: dict = None):
        
        results = []
        hyperparameters = hyperparameters or {}
        
        # Load data ONCE to save time
        df = load_data_session(session_id)
        
        # Loop through every selected algorithm
        for algo_name in algorithm_names:
            try:
                # Extract params specifically for this algorithm
                algo_params = hyperparameters.get(algo_name, {})
                
                print(f"Training {algo_name}...") # Debug log
                
                # Call the helper function
                result = self._train_single_model(
                    df, session_id, target_column, problem_type, algo_name, 
                    split_ratio, k_folds, algo_params
                )
                results.append(result)
                
            except Exception as e:
                print(f"Error training {algo_name}: {e}")
                results.append({
                    "algorithm": algo_name,
                    "status": "Error",
                    "error_message": str(e)
                })

        # ✅ Sort results to find "Best Model"
        if problem_type.title() == "Classification":
            results.sort(key=lambda x: x.get("metrics", {}).get("accuracy", 0), reverse=True)
        elif problem_type.title() == "Regression":
            results.sort(key=lambda x: x.get("metrics", {}).get("rmse", float('inf')), reverse=False)
        elif problem_type.title() == "Unsupervised":
            # Sort by Silhouette Score (Higher is better)
            results.sort(key=lambda x: x.get("metrics", {}).get("silhouette_score", -1), reverse=True)
            
        # Tag the winner
        if results and results[0].get("status") == "Success":
            results[0]["is_best_model"] = True
            
        report_filename = self._generate_comparison_report(results, session_id, df, target_column)    
        return {
            "models": results,
            "report_filename": report_filename
        }
                
    # ✅  This contains the actual training code
    def _train_single_model(self, df, session_id, target_column, problem_type, algorithm_name, split_ratio, k_folds, hyperparameters):
        
        start_time = time.time()
        p_type = problem_type.title()

        # --- A. UNSUPERVISED ---
        if p_type == "Unsupervised":
            X = df.select_dtypes(include=[np.number])
            if X.empty: raise ValueError("No numeric columns found for clustering.")
            
            # Scale data for clustering usually
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X)
            
            # ✅ PASS HYPERPARAMETERS TO CLUSTERING
            model = self._get_unsupervised_algorithm(algorithm_name, hyperparameters)
            model.fit(X_scaled)
            
            # Silhouette requires at least 2 clusters and valid labels
            if len(np.unique(model.labels_)) > 1:
                score = silhouette_score(X_scaled, model.labels_)
            else:
                score = 0
                
            return {
                "algorithm": algorithm_name, "problem_type": "Unsupervised",
                "metrics": {
                    "silhouette_score": round(score, 4),
                    "training_time_sec": round(time.time() - start_time, 4)
                }, 
                "status": "Success"
            }

        # --- B. SUPERVISED ---
        X = df.drop(columns=[target_column]).select_dtypes(include=[np.number])
        y = df[target_column]
        feature_names = X.columns.tolist()
        
        if algorithm_name in ["Support Vector Machine (SVM)", "K-Nearest Neighbors (KNN)", "Neural Network"]:
            scaler = StandardScaler()
            X = scaler.fit_transform(X)

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=split_ratio, random_state=42)
        
        model = self._get_supervised_algorithm(algorithm_name, p_type, hyperparameters)
        
        cv_scores_list = []

        # Cross-Validation
        cv_metric = 'accuracy' if p_type == "Classification" else 'r2'
        try:
            cv_scores = cross_val_score(model, X_train, y_train, cv=k_folds, scoring=cv_metric)
            cv_scores_list = cv_scores.tolist()
            avg_cv_score = float(np.mean(cv_scores))
        except:
            avg_cv_score = 0.0

        model.fit(X_train, y_train)

        predictions = model.predict(X_test)
        
        # Metrics
        metrics = {}
        metrics["cv_score_mean"] = round(avg_cv_score, 4)
        metrics["cv_scores_folds"] = [round(s, 4) for s in cv_scores_list]
        metrics["training_time_sec"] = round(time.time() - start_time, 4)
        
        if p_type == "Classification":
            metrics["accuracy"] = round(accuracy_score(y_test, predictions), 4)
            metrics["f1_score"] = round(f1_score(y_test, predictions, average='weighted'), 4)
            metrics["precision"] = round(precision_score(y_test, predictions, average='weighted', zero_division=0), 4)
            metrics["recall"] = round(recall_score(y_test, predictions, average='weighted', zero_division=0), 4)
            metrics["mcc"] = round(matthews_corrcoef(y_test, predictions), 4)
      
            # Confusion Matrix
            cm = confusion_matrix(y_test, predictions)
            labels = [str(c) for c in model.classes_] if hasattr(model, 'classes_') else [str(c) for c in np.unique(y)]
            metrics["confusion_matrix"] = {"matrix": cm.tolist(), "labels": labels}
            
            # Probabilities    
            y_prob = None
            if hasattr(model, "predict_proba"):
             if hasattr(model, "classes_") and len(model.classes_) == 2:
                 y_prob = model.predict_proba(X_test)[:, 1]
             else:
                 y_prob = model.predict_proba(X_test)
            
            if y_prob is not None and hasattr(model, "classes_") and len(model.classes_) == 2:
                 try:
                    metrics["roc_auc"] = round(roc_auc_score(y_test, y_prob), 4)
                    metrics["log_loss"] = round(log_loss(y_test, y_prob), 4)
                    fpr, tpr, _ = roc_curve(y_test, y_prob)
                    metrics["roc_curve_data"] = {"fpr": fpr.tolist(), "tpr": tpr.tolist()}
                 except: pass

        else:
            metrics["rmse"] = round(np.sqrt(mean_squared_error(y_test, predictions)), 4)
            metrics["mae"] = round(mean_absolute_error(y_test, predictions), 4)
            metrics["r2_score"] = round(r2_score(y_test, predictions), 4)

        # Feature Importance
        feature_importance_dict = {}
        if hasattr(model, "feature_importances_"):
             feature_importance_dict = dict(zip(feature_names, model.feature_importances_))
        elif hasattr(model, "coef_"):
             coeffs = model.coef_
             if coeffs.ndim > 1: coeffs = coeffs[0]
             importances = np.abs(coeffs)
             if len(feature_names) == len(importances):
                feature_importance_dict = dict(zip(feature_names, importances))

        if feature_importance_dict:
             sorted_features = sorted(feature_importance_dict.items(), key=lambda x: x[1], reverse=True)
             metrics["feature_importance"] = [{"feature": name, "importance": round(val, 4)} for name, val in sorted_features[:20]]
        else:
             metrics["feature_importance"] = []

        return {
            "algorithm": algorithm_name,
            "problem_type": p_type,
            "metrics": metrics,
            "params": {"k_folds": k_folds, "split_ratio": split_ratio, "hyperparameters": hyperparameters},
            "status": "Success"
        }
  

    # Generates the PDF Report 
    def _generate_comparison_report(self, results, session_id, df, target_col):
        """
        Generates a PDF report with Summary, Stats, Visuals and Comparison Table.
        """
        filename = f"report_{session_id}_{int(time.time())}.pdf"
        file_path = os.path.join(TEMP_FOLDER, filename)
        
        pdf = FPDF()
        pdf.set_auto_page_break(auto=True, margin=15)
        
        # --- 1. TITLE & ENHANCED DATA SUMMARY ---
        pdf.add_page()
        pdf.set_font("Arial", 'B', 20)
        pdf.cell(0, 15, "Model Training & Analysis Report", ln=True, align='C')
        pdf.set_font("Arial", 'I', 10)
        pdf.cell(0, 10, f"Session ID: {session_id}", ln=True, align='C')
        pdf.ln(5)
        
        # Calculate summary stats
        num_cols = len(df.select_dtypes(include=[np.number]).columns)
        cat_cols = len(df.select_dtypes(exclude=[np.number]).columns)
        missing_vals = df.isnull().sum().sum()
        
        pdf.set_font("Arial", 'B', 14)
        pdf.cell(0, 10, "1. Data Summary", ln=True)
        pdf.set_font("Arial", '', 11)
        
        # Adjust display for Unsupervised
        display_target = target_col if target_col else "None (Clustering/Unsupervised)"
        pdf.cell(0, 7, f"- Target Variable: {display_target}", ln=True)
        pdf.cell(0, 7, f"- Total Rows: {df.shape[0]} | Total Columns: {df.shape[1]}", ln=True)
        pdf.cell(0, 7, f"- Numeric Columns: {num_cols}", ln=True)
        pdf.cell(0, 7, f"- Categorical Columns: {cat_cols}", ln=True)
        pdf.cell(0, 7, f"- Total Missing Values: {missing_vals}", ln=True)
        pdf.ln(5)

        # --- 2. STATISTICS TABLE ---
        pdf.set_font("Arial", 'B', 14)
        pdf.cell(0, 10, "2. Statistical Overview", ln=True)
        
        desc = df.describe().transpose().reset_index().head(8).round(2)
        
        # Header
        pdf.set_font("Courier", 'B', 9)
        pdf.cell(45, 8, "Column", border=1)
        pdf.cell(25, 8, "Mean", border=1, align='C')
        pdf.cell(25, 8, "Std", border=1, align='C')
        pdf.cell(25, 8, "Min", border=1, align='C')
        pdf.cell(25, 8, "Max", border=1, align='C')
        pdf.ln()
        
        # Rows
        pdf.set_font("Courier", '', 9)
        for _, row in desc.iterrows():
            pdf.cell(45, 8, str(row['index'])[:22], border=1)
            pdf.cell(25, 8, str(row['mean']), border=1, align='C')
            pdf.cell(25, 8, str(row['std']), border=1, align='C')
            pdf.cell(25, 8, str(row['min']), border=1, align='C')
            pdf.cell(25, 8, str(row['max']), border=1, align='C')
            pdf.ln()
        
        # --- 3. BEST MODEL VISUALS ---
        best_model = results[0] if results else None
        
        if best_model and best_model.get("status") == "Success":
            pdf.add_page()
            pdf.set_font("Arial", 'B', 14)
            pdf.cell(0, 10, f"3. Best Model Analysis ({best_model['algorithm']})", ln=True)
            metrics = best_model.get("metrics", {})
            
            def add_plot(name, h=100):
                img_path = os.path.join(TEMP_FOLDER, f"{session_id}_{name}.png")
                plt.tight_layout()
                plt.savefig(img_path, dpi=100)
                plt.close()
                if pdf.get_y() + h > 270: 
                    pdf.add_page()
                pdf.image(img_path, w=130, h=h)
                pdf.ln(5)
                if os.path.exists(img_path): os.remove(img_path)

            # Visuals only for Supervised for now
            if "confusion_matrix" in metrics:
                cm_data = metrics["confusion_matrix"]
                matrix = np.array(cm_data["matrix"])
                plt.figure(figsize=(6, 4))
                sns.heatmap(matrix, annot=True, fmt='d', cmap='Blues')
                plt.title("Confusion Matrix")
                add_plot("cm", h=75)

            if "roc_curve_data" in metrics:
                pdf.set_font("Arial", 'B', 12)
                pdf.cell(0, 10, "ROC Curve", ln=True)
                roc = metrics["roc_curve_data"]
                plt.figure(figsize=(6, 4))
                plt.plot(roc["fpr"], roc["tpr"], color='darkorange', lw=2, label=f"AUC = {metrics.get('roc_auc', 0)}")
                plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--')
                plt.xlabel('False Positive Rate')
                plt.ylabel('True Positive Rate')
                plt.title('Receiver Operating Characteristic')
                plt.legend(loc="lower right")
                add_plot("roc")

            if "feature_importance" in metrics and metrics["feature_importance"]:
                fi = metrics["feature_importance"][:10]
                f_names = [x['feature'] for x in fi]
                f_vals = [x['importance'] for x in fi]
                plt.figure(figsize=(8, 4))
                sns.barplot(x=f_vals, y=f_names, palette="viridis")
                plt.title("Feature Importance")
                plt.xlabel("Score")
                add_plot("feat_imp", h=75)

        # --- 4. MODEL COMPARISON TABLE ---
        pdf.ln(5) 
        pdf.set_font("Arial", 'B', 14)
        pdf.cell(0, 10, "4. Model Results Comparison", ln=True)
        
        # Check problem type for dynamic headers
        p_type = results[0].get("problem_type", "") if results else ""

        if p_type == "Unsupervised":
            headers = ["Algorithm", "Time (s)", "Silhouette Score", "", "", "", "", ""]
            widths  = [60,          30,         50,                 0,  0,  0,  0,  0]
        else:
            headers = ["Algorithm", "Time (s)", "CV Mean", "Accuracy", "F1", "Precision", "Recall", "ROC AUC"]
            widths  = [45,          20,         20,        20,         20,   20,          20,       20]
        
        # Header Row
        pdf.set_font("Arial", 'B', 8)
        for i, h in enumerate(headers):
            if h: pdf.cell(widths[i], 8, h, border=1, align='C')
        pdf.ln()
        
        # Data Rows
        pdf.set_font("Arial", '', 8)
        for res in results:
            if res.get("status") == "Success":
                m = res.get("metrics", {})
                
                if p_type == "Unsupervised":
                    row_vals = [
                        res["algorithm"][:25],
                        str(m.get("training_time_sec", "-")),
                        str(m.get("silhouette_score", "-"))
                    ]
                else:
                    row_vals = [
                        res["algorithm"][:22],
                        str(m.get("training_time_sec", "-")),
                        str(m.get("cv_score_mean", "-")),
                        str(m.get("accuracy", "-")),
                        str(m.get("f1_score", "-")),
                        str(m.get("precision", "-")),
                        str(m.get("recall", "-")),
                        str(m.get("roc_auc", "-"))
                    ]
                
                for i, val in enumerate(row_vals):
                    pdf.cell(widths[i], 8, str(val), border=1, align='C')
                pdf.ln()

        pdf.output(file_path)
        return filename


    def _get_supervised_algorithm(self, name: str, problem_type: str, params: dict):
        # Special handling for Polynomial Regression (Pipeline)
        if name == "Polynomial Regression":
            degree = params.get("degree", 2)
            return make_pipeline(PolynomialFeatures(degree=degree), LinearRegression())

        if name == "Neural Network" and "hidden_layer_sizes" in params:
             if isinstance(params["hidden_layer_sizes"], list):
                 params["hidden_layer_sizes"] = tuple(params["hidden_layer_sizes"])

        if problem_type == "Regression":
            models = {
                "Linear Regression": LinearRegression,
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
             raise ValueError(f"Algorithm '{name}' not found.")

        model_class = models[name]
        
        if name == "Neural Network":
             if "max_iter" not in params: params["max_iter"] = 500
        if name == "Logistic Regression":
             if "max_iter" not in params: params["max_iter"] = 1000

        return model_class(**params)
       

    def _get_unsupervised_algorithm(self, name: str, params: dict):
        # ✅ Handle K-Means parameters
        if name == "K-Means":
            # Safety cast to int for n_clusters
            if "n_clusters" in params:
                params["n_clusters"] = int(params["n_clusters"])
            return KMeans(**params)
            
        # Default fallback
        return KMeans(n_clusters=3)