import os
import zipfile 
import pandas as pd
from kaggle.api.kaggle_api_extended import KaggleApi

def get_authenticated_api():
    """
    Authentification via le fichier local 'kaggle.json' uniquement.
    (Situé généralement dans C:/Users/VotreNom/.kaggle/kaggle.json)
    """
    api = KaggleApi()
    try:
        api.authenticate()
        return api
    except Exception as e:
        raise ValueError(f"Impossible de trouver 'kaggle.json'. Assurez-vous qu'il est bien dans le dossier .kaggle. Erreur: {e}")

def search_kaggle_datasets(query: str, user=None, max_results: int = 15):
    """
    Cherche des datasets sur Kaggle.
    (L'argument 'user' est gardé pour compatibilité avec le routeur, mais n'est pas utilisé pour l'auth)
    """
    try:
        api = get_authenticated_api()

        # Recherche des datasets (CSV)
        datasets = api.dataset_list(search=query, sort_by='votes', file_type='csv')
        
        results = []
        for d in datasets[:max_results]:
            results.append({
                "ref": d.ref,       
                "title": d.title,   
                "size": getattr(d, 'size', 'N/A'),
                "url": d.url
            })
            
        return results
    except Exception as e:
        print(f"❌ Erreur recherche Kaggle: {e}")
        return []

def load_dataset(dataset: str, user=None):
    """
    Télécharge un dataset CSV depuis Kaggle.
    (L'argument 'user' est gardé pour compatibilité avec le routeur)
    """
    try:
        api = get_authenticated_api()

        # Chemin de stockage
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        temp_dir = os.path.join(base_dir, "temp_data")
        os.makedirs(temp_dir, exist_ok=True)

        print(f"⬇️ Téléchargement de {dataset} via kaggle.json local...")

        # Téléchargement
        api.dataset_download_files(dataset, path=temp_dir, unzip=True)
        
        # Trouver le fichier CSV extrait
        extracted_files = os.listdir(temp_dir)
        csv_files = [f for f in extracted_files if f.endswith(".csv")]
        
        if not csv_files:
            raise ValueError("Aucun fichier CSV trouvé dans ce dataset Kaggle.")
        
        # On prend le premier CSV trouvé
        target_file = csv_files[0]
        full_path = os.path.join(temp_dir, target_file)

        print(f"✅ Fichier chargé : {full_path}")

        # Lecture Pandas
        df = pd.read_csv(full_path)
        
        # Nettoyage NaN pour éviter les erreurs JSON dans le frontend
        df = df.where(pd.notnull(df), None)

        return df

    except Exception as e:
        print(f"❌ Erreur load_dataset: {e}")
        raise RuntimeError(f"Erreur Kaggle Load: {str(e)}")