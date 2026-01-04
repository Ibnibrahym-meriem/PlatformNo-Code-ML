
ML_ALGO_PARAMS = {
    # --- COMMON ALGORITHMS ---
    "Random Forest": [
        {"name": "n_estimators", "type": "int", "default": 100, "min": 10, "max": 500, "step": 10, "label": "Number of Trees"},
        {"name": "max_depth", "type": "int", "default": 10, "min": 1, "max": 50, "step": 1, "label": "Max Depth"},
        {"name": "min_samples_split", "type": "int", "default": 2, "min": 2, "max": 10, "step": 1, "label": "Min Samples Split"}
    ],
    "Decision Tree": [
        {"name": "max_depth", "type": "int", "default": 10, "min": 1, "max": 50, "step": 1, "label": "Max Depth"},
        {"name": "min_samples_split", "type": "int", "default": 2, "min": 2, "max": 10, "step": 1, "label": "Min Samples Split"}
    ],
    "Support Vector Machine (SVM)": [
        {"name": "C", "type": "float", "default": 1.0, "min": 0.1, "max": 10.0, "step": 0.1, "label": "Regularization (C)"},
        {"name": "kernel", "type": "categorical", "default": "rbf", "options": ["linear", "poly", "rbf", "sigmoid"], "label": "Kernel"}
    ],
    "K-Nearest Neighbors (KNN)": [
        {"name": "n_neighbors", "type": "int", "default": 5, "min": 1, "max": 20, "step": 1, "label": "Number of Neighbors"},
        {"name": "weights", "type": "categorical", "default": "uniform", "options": ["uniform", "distance"], "label": "Weights"}
    ],
    "Gradient Boosting": [
        {"name": "n_estimators", "type": "int", "default": 100, "min": 50, "max": 500, "step": 10, "label": "Number of Estimators"},
        {"name": "learning_rate", "type": "float", "default": 0.1, "min": 0.01, "max": 1.0, "step": 0.01, "label": "Learning Rate"},
        {"name": "max_depth", "type": "int", "default": 3, "min": 1, "max": 10, "step": 1, "label": "Max Depth"}
    ],
    "Neural Network": [
        {"name": "hidden_layer_sizes", "type": "categorical", "default": (100,), "options": [(50,), (100,), (100, 50)], "label": "Hidden Layers"},
        {"name": "activation", "type": "categorical", "default": "relu", "options": ["relu", "tanh", "logistic"], "label": "Activation Function"},
        {"name": "alpha", "type": "float", "default": 0.0001, "min": 0.0001, "max": 0.01, "step": 0.0001, "label": "Alpha (Regularization)"}
    ],
    # --- CLASSIFICATION SPECIFIC ---
    "Logistic Regression": [
        {"name": "C", "type": "float", "default": 1.0, "min": 0.1, "max": 10.0, "step": 0.1, "label": "Inverse Regularization"},
        {"name": "solver", "type": "categorical", "default": "lbfgs", "options": ["lbfgs", "liblinear"], "label": "Solver"}
    ],
    "Naive Bayes": [], # GaussianNB has no major tunable hyperparameters for this level
    
    # --- REGRESSION SPECIFIC ---
    "Linear Regression": [], # No major hyperparameters
    "Polynomial Regression": [
         {"name": "degree", "type": "int", "default": 2, "min": 2, "max": 4, "step": 1, "label": "Polynomial Degree"}
    ]
}