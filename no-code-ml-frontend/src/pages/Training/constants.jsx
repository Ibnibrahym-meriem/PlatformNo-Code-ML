import { 
    Layers, GitBranch, Activity, Target, Network, Zap, BrainCircuit, Gauge, 
    Component // Icône pour le Clustering
} from 'lucide-react';

export const ALGO_META = {
    // --- CLASSIFICATION & REGRESSION ---
    "Random Forest": { 
        desc: "Ensemble de méthodes robuste", tag: "Robuste", 
        color: "text-green-600", bg: "bg-green-50", border: "border-green-200", icon: Layers 
    },
    "Decision Tree": { 
        desc: "Arbre de décision simple", tag: "Rapide", 
        color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", icon: GitBranch 
    },
    "Logistic Regression": { 
        desc: "Classifieur linéaire de base", tag: "Base", 
        color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", icon: Activity 
    },
    "Linear Regression": { 
        desc: "Régression linéaire simple", tag: "Base", 
        color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", icon: Activity 
    },
    "Support Vector Machine (SVM)": { 
        desc: "Marges maximales", tag: "Complexe", 
        color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200", icon: Target 
    },
    "K-Nearest Neighbors (KNN)": { 
        desc: "Basé sur la proximité", tag: "Simple", 
        color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200", icon: Network 
    },
    "Gradient Boosting": { 
        desc: "Boosting séquentiel", tag: "Précis", 
        color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-200", icon: Zap 
    },
    "Neural Network": { 
        desc: "Perceptron multicouche", tag: "Lent", 
        color: "text-red-600", bg: "bg-red-50", border: "border-red-200", icon: BrainCircuit 
    },
    "Naive Bayes": { 
        desc: "Probabiliste", tag: "Rapide", 
        color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-200", icon: Gauge 
    },
    "Polynomial Regression": {
        desc: "Relation non-linéaire", tag: "Moyen",
        color: "text-pink-600", bg: "bg-pink-50", border: "border-pink-200", icon: Activity
    },
    // --- UNSUPERVISED ---
    "K-Means": {
        desc: "Clustering par partition", tag: "Non-supervisé",
        color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200", icon: Component
    }
};

export const PROBLEM_TYPES = {
    Classification: [
        "Random Forest", "Logistic Regression", "Decision Tree", 
        "Support Vector Machine (SVM)", "Gradient Boosting", 
        "K-Nearest Neighbors (KNN)", "Naive Bayes", "Neural Network"
    ],
    Regression: [
        "Linear Regression", "Random Forest", "Decision Tree", 
        "Support Vector Machine (SVM)", "Gradient Boosting", 
        "K-Nearest Neighbors (KNN)", "Neural Network", "Polynomial Regression"
    ],
    Unsupervised: [
        "K-Means"
    ]
};