import pandas as pd
from sklearn.datasets import (
    load_iris, load_wine, load_diabetes, load_breast_cancer, 
    fetch_california_housing, make_moons
)
import seaborn as sns

def load_iris_dataset() -> pd.DataFrame:
    """Classification de fleurs (3 classes)"""
    data = load_iris()
    df = pd.DataFrame(data.data, columns=data.feature_names)
    df['target'] = data.target
    return df

def load_titanic_dataset() -> pd.DataFrame:
    """
    Survie sur le Titanic (Données mixtes : texte, nombres, nuls).
    On utilise seaborn car le dataset est plus 'brut' (bon pour le nettoyage).
    """
    df = sns.load_dataset('titanic')
    # On garde les colonnes principales pour simplifier 
    cols = ['survived', 'pclass', 'sex', 'age', 'sibsp', 'parch', 'fare', 'embarked']
    return df[cols]

def load_wine_dataset() -> pd.DataFrame:
    """Classification de vins (3 producteurs différents)"""
    data = load_wine()
    df = pd.DataFrame(data.data, columns=data.feature_names)
    df['target'] = data.target
    return df

def load_diabetes_dataset() -> pd.DataFrame:
    """Régression : Prédire la progression de la maladie"""
    data = load_diabetes()
    df = pd.DataFrame(data.data, columns=data.feature_names)
    df['target'] = data.target
    return df

def load_breast_cancer_dataset() -> pd.DataFrame:
    """Classification Binaire (Malin/Bénin)"""
    data = load_breast_cancer()
    df = pd.DataFrame(data.data, columns=data.feature_names)
    df['target'] = data.target
    return df

def load_housing_dataset() -> pd.DataFrame:
    """
    Régression Grande échelle (Housing).
    Stratégie : Tente la source officielle sklearn, sinon bascule sur un miroir GitHub.
    """
    try:
        print("Tentative de téléchargement officiel California Housing...")
        data = fetch_california_housing()
        df = pd.DataFrame(data.data, columns=data.feature_names)
        df['target_price'] = data.target
        return df
        
    except Exception as e:
        print(f"Erreur source officielle ({e}). Basculement sur le miroir GitHub...")
        
        # URL Alternative stable (Dataset California Housing)
        url = "https://raw.githubusercontent.com/ageron/handson-ml2/master/datasets/housing/housing.csv"
        
        try:
            df = pd.read_csv(url)
            if "ocean_proximity" in df.columns:
                df = df.drop("ocean_proximity", axis=1)
            # On renomme la cible pour être cohérent avec 'target_price'
            if "median_house_value" in df.columns:
                df = df.rename(columns={"median_house_value": "target_price"})
            
            
            return df
        except Exception as e2:
             raise RuntimeError(f"Impossible de télécharger Housing (Source Officielle + Miroir échoués): {e2}")

def load_clustering_dataset() -> pd.DataFrame:
    """
    Clustering (Non-supervisé).
    Génère deux demi-cercles entrelacés (très dur pour K-Means, bien pour DBSCAN).
    """
    # On génère 1000 points
    X, y = make_moons(n_samples=1000, noise=0.05, random_state=42)
    df = pd.DataFrame(X, columns=["feature_x", "feature_y"])
    # On ajoute la vraie classe juste pour vérifier visuellement plus tard, 
    # mais en théorie le clustering ne l'utilise pas.
    df['true_cluster_label'] = y 
    return df

def load_movies_dataset() -> pd.DataFrame:
    """
    🎬 Dataset de Films.
    """
    url = "https://raw.githubusercontent.com/vega/vega-datasets/next/data/movies.json"
    
    try:
        print("Téléchargement du dataset Movies...")
        df = pd.read_json(url)
        
        # --- 1. Nettoyage des noms de colonnes ---
        df.columns = df.columns.str.replace(' ', '_')
        # --- 2. Nettoyage des valeurs ---
        # On remplit les vides par "Unknown" pour éviter les bugs
        if 'Title' in df.columns:
            df['Title'] = df['Title'].fillna("Unknown").astype(str)
            
        # Par sécurité, on force toutes les colonnes "texte" à être bien du string
        # Cela évite l'erreur "Error converting column... to bytes"
        for col in df.select_dtypes(include=['object']).columns:
            df[col] = df[col].astype(str)

        return df
        
    except Exception as e:
        raise RuntimeError(f"Impossible de télécharger les films : {e}")
    
def load_penguins_dataset() -> pd.DataFrame:
    """
     Les Manchots de Palmer. LE meilleur dataset pour débuter.
    Contient :
    - Catégories : species, island, sex
    - Nombres : bill_length_mm, body_mass_g, etc.
    Quelques valeurs manquantes (NaN).
    """
    df = sns.load_dataset('penguins')
    return df

def load_tips_dataset() -> pd.DataFrame:
    """
     Les Pourboires dans un restaurant.
    Contient :
    - Catégories : sex, smoker, day, time
    - Nombres : total_bill, tip, size
    Très propre (pas de NaN), idéal pour Scatter Plot et Boxplot.
    """
    df = sns.load_dataset('tips')
    return df