import os
import zipfile 
import pandas as pd
from kaggle.api.kaggle_api_extended import KaggleApi

# --- AUTHENTICATION ---
api = KaggleApi()
api.authenticate()
print(" Kaggle API Authenticated")


def search_kaggle_datasets(query: str, max_results: int = 15):
    """
    Cherche des datasets sur Kaggle via un mot-clé.
    Retourne une liste simplifiée pour le frontend.
    """
    try:
        # Recherche via l'API (trié par votes pour avoir les plus pertinents)
        datasets = api.dataset_list(search=query, sort_by='votes', file_type='csv')
        
        results = []
        for d in datasets[:max_results]:
            results.append({
                "id": d.ref,                  # L'ID crucial (ex: "zillow/zecon")
                "title": d.title,             # Titre affiché
                "size": getattr(d, 'size', 'N/A'), # Taille
                "voteCount": getattr(d, 'voteCount', 0), # Popularité
                "url": d.url                  # Lien vers la page Kaggle
            })
            
        return results
    except Exception as e:
        print(f" Error searching Kaggle: {e}")
        # On renvoie une liste vide en cas d'erreur pour ne pas faire planter le front
        return []
    

def load_dataset(dataset: str):
    """
    Download a CSV dataset from Kaggle.
    """
    try:
        # 1. Define storage path (backend/temp_data)
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        temp_dir = os.path.join(base_dir, "temp_data")
        os.makedirs(temp_dir, exist_ok=True)

        print(f" Downloading {dataset}...")

        # 2. Get file list
        files = api.dataset_list_files(dataset).files
        csv_files = [f.name for f in files if f.name.endswith(".csv")]
        
        if not csv_files:
            raise ValueError("No CSV files found")
        
        target_file = csv_files[0]

        # 3. Download the specific file
        api.dataset_download_file(dataset, target_file, path=temp_dir, force=True)
        
        # 4. Handle potential ZIP files
        full_path = os.path.join(temp_dir, target_file)
        zip_path = full_path + ".zip"

        # If the CSV is missing but a ZIP exists, unzip it
        if not os.path.exists(full_path) and os.path.exists(zip_path):
            print(f" Unzipping {zip_path}...")
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(temp_dir)

        # 5. Read file
        if not os.path.exists(full_path):
            raise FileNotFoundError(f"Could not find file: {full_path}")

        df = pd.read_csv(full_path)
        df = df.where(pd.notnull(df), None) # JSON safe

        return df

    except Exception as e:
        print(f" Error in load_dataset: {e}")
        raise RuntimeError(f"Kaggle Error: {str(e)}")