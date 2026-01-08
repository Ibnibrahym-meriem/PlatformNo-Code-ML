# app/utils/ml_config.py

ML_ALGO_PARAMS = {
    # --- SUPERVISED (CLASSIFICATION & REGRESSION) ---
    "Random Forest": [
        {"name": "n_estimators", "type": "int", "default": 100, "min": 10, "max": 500, "step": 10},
        {"name": "max_depth", "type": "int", "default": 10, "min": 1, "max": 50, "step": 1},
        {"name": "min_samples_split", "type": "int", "default": 2, "min": 2, "max": 10, "step": 1}
    ],
    "Logistic Regression": [
        {"name": "max_iter", "type": "int", "default": 1000, "min": 100, "max": 5000, "step": 100},
        {"name": "C", "type": "float", "default": 1.0, "min": 0.01, "max": 10.0, "step": 0.01}
    ],
    "Linear Regression": [
        # Pas d'hyperparamètres majeurs pour la version simple de sklearn
    ],
    "Decision Tree": [
        {"name": "max_depth", "type": "int", "default": 10, "min": 1, "max": 50, "step": 1},
        {"name": "min_samples_split", "type": "int", "default": 2, "min": 2, "max": 20, "step": 1}
    ],
    "Support Vector Machine (SVM)": [
        {"name": "C", "type": "float", "default": 1.0, "min": 0.1, "max": 10.0, "step": 0.1},
        {"name": "degree", "type": "int", "default": 3, "min": 2, "max": 5, "step": 1} # Only for poly kernel
    ],
    "K-Nearest Neighbors (KNN)": [
        {"name": "n_neighbors", "type": "int", "default": 5, "min": 1, "max": 20, "step": 1}
    ],
    "Gradient Boosting": [
        {"name": "n_estimators", "type": "int", "default": 100, "min": 50, "max": 500, "step": 50},
        {"name": "learning_rate", "type": "float", "default": 0.1, "min": 0.01, "max": 1.0, "step": 0.01},
        {"name": "max_depth", "type": "int", "default": 3, "min": 1, "max": 10, "step": 1}
    ],
    "Neural Network": [
        {"name": "max_iter", "type": "int", "default": 500, "min": 200, "max": 2000, "step": 100},
        {"name": "alpha", "type": "float", "default": 0.0001, "min": 0.0001, "max": 0.1, "step": 0.0001}
    ],
    "Naive Bayes": [
        # GaussianNB a peu de paramètres tunables via sliders simples
    ],
    "Polynomial Regression": [
        {"name": "degree", "type": "int", "default": 2, "min": 2, "max": 5, "step": 1}
    ],

    # --- UNSUPERVISED (CLUSTERING) ---
    "K-Means": [
        {
            "name": "n_clusters",
            "type": "int",
            "default": 3,
            "min": 2,
            "max": 20,
            "step": 1
        }
    ]
}