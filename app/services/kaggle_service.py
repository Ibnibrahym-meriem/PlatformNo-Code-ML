import os
import zipfile 
import pandas as pd
from kaggle.api.kaggle_api_extended import KaggleApi


def get_authenticated_api(user):
    """
    Configure l'API Kaggle avec les clés de l'utilisateur spécifique.
    """
    if not user.kaggle_username or not user.kaggle_key:
        raise ValueError(" Clés Kaggle manquantes. Veuillez les configurer dans les paramètres.")

    # On définit les variables d'environnement temporairement pour cet appel
    os.environ['KAGGLE_USERNAME'] = user.kaggle_username
    os.environ['KAGGLE_KEY'] = user.kaggle_key

    api = KaggleApi()
    api.authenticate()
    return api

def search_kaggle_datasets(query: str, user, max_results: int = 15):
    """
    Cherche des datasets sur Kaggle (Authentifié via User).
    """
    try:
        # 1. On récupère l'API authentifiée pour cet utilisateur
        api = get_authenticated_api(user)

        datasets = api.dataset_list(search=query, sort_by='votes', file_type='csv')
        
        results = []
        for d in datasets[:max_results]:
            results.append({
                "id": d.ref,
                "title": d.title,
                "size": getattr(d, 'size', 'N/A'),
                "voteCount": getattr(d, 'voteCount', 0),
                "url": d.url
            })
            
        return results
    except Exception as e:
        print(f" Error searching Kaggle: {e}")
        return []

def load_dataset(dataset: str, user):
    """
    Download a CSV dataset from Kaggle (Authentifié via User).
    """
    try:
        # 1. On récupère l'API authentifiée pour cet utilisateur
        api = get_authenticated_api(user)

        # 2. Define storage path
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        temp_dir = os.path.join(base_dir, "temp_data")
        os.makedirs(temp_dir, exist_ok=True)

        print(f" Downloading {dataset} for user {user.kaggle_username}...")

        # 3. Get file list
        files = api.dataset_list_files(dataset).files
        csv_files = [f.name for f in files if f.name.endswith(".csv")]
        
        if not csv_files:
            raise ValueError("No CSV files found")
        
        target_file = csv_files[0]

        # 4. Download
        api.dataset_download_file(dataset, target_file, path=temp_dir, force=True)
        
        # 5. Handle ZIP
        full_path = os.path.join(temp_dir, target_file)
        zip_path = full_path + ".zip"

        if not os.path.exists(full_path) and os.path.exists(zip_path):
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(temp_dir)

        # 6. Read file
        if not os.path.exists(full_path):
            raise FileNotFoundError(f"Could not find file: {full_path}")

        df = pd.read_csv(full_path)
        df = df.where(pd.notnull(df), None)

        return df

    except Exception as e:
        print(f" Error in load_dataset: {e}")
        raise RuntimeError(f"Kaggle Error: {str(e)}")