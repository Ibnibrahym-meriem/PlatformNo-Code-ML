import os
import uuid
import json  
import pandas as pd
import numpy as np
from fastapi import HTTPException

# Configuration des chemins
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TEMP_DATA_DIR = os.path.join(BASE_DIR, "temp_data")
os.makedirs(TEMP_DATA_DIR, exist_ok=True)

def save_data_session(df: pd.DataFrame, session_id: str = None) -> dict:
    """
    Sauvegarde le DataFrame et retourne un aperçu sécurisé pour le JSON.
    """
    
    # 1. Si pas d'ID, on en crée un nouveau
    if session_id is None:
        session_id = str(uuid.uuid4())
    
    file_path = os.path.join(TEMP_DATA_DIR, f"{session_id}.parquet")
    
    try:
        # On sauvegarde en Parquet (rapide et garde les types)
        # On force les noms de colonnes en string pour éviter les erreurs Parquet
        df.columns = df.columns.astype(str)
        df.to_parquet(file_path, index=False)
    except Exception as e:
        print(f"Erreur Parquet: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur écriture Parquet: {str(e)}")
    
    # 2. PRÉPARATION DE L'APERÇU SÉCURISÉ 
    try:
        # On prend les 5 premières lignes
        preview_df = df.head(5)
        
        # to_json convertit automatiquement NaN et Inf en 'null' valide
        json_str = preview_df.to_json(orient="records")
        
        # On le re-transforme en liste Python pour FastAPI 
        preview_data = json.loads(json_str)
        
    except Exception as e:
        print(f"Erreur lors de la création de l'aperçu : {e}")
        preview_data = [] 

    # 3. RETOUR DES INFOS COMPLETES
    return {
        "session_id": session_id,
        "filename": f"{session_id}.parquet",
        "rows": df.shape[0],          # Nombre de lignes
        "cols": df.shape[1],          # Nombre de colonnes (Entier)
        "columns": df.columns.tolist(), # Liste des noms de colonnes (utile pour la suite)
        "preview": preview_data
    }

TEMP_FOLDER = "temp_files"
os.makedirs(TEMP_FOLDER, exist_ok=True)

def load_data_session(session_id: str) -> pd.DataFrame:
    """
    Charge le DataFrame depuis le disque.
    """
    file_path = os.path.join(TEMP_DATA_DIR, f"{session_id}.parquet")
    
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Session expirée ou introuvable.")
    
    try:
        return pd.read_parquet(file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lecture Parquet: {str(e)}")