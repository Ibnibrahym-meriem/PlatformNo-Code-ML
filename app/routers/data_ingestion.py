from fastapi import APIRouter, UploadFile, File, HTTPException, Query, Depends
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import pandas as pd
from io import BytesIO
import uuid
from app.db import User
from app.users import current_active_user

from app.services.scraping_service import scrape_all_tables

# --- IMPORTS DES SERVICES ---
from app.services.kaggle_service import load_dataset as load_kaggle, search_kaggle_datasets
from app.services.demo_datasets import (
    load_iris_dataset, 
    load_titanic_dataset, 
    load_wine_dataset,          
    load_diabetes_dataset,      
    load_breast_cancer_dataset,  
    load_housing_dataset,   
    load_clustering_dataset,
    load_movies_dataset,
    load_penguins_dataset,   
    load_tips_dataset
)

from app.services.generation_service import generate_simple_data, generate_custom_data
from app.utils.file_manager import save_data_session



# --- CONFIGURATION DU ROUTEUR ---
router = APIRouter(
    prefix="/data",
    tags=["Data Ingestion"],
    dependencies=[Depends(current_active_user)]
)

TEMP_SCRAPED_DATA = {}

DEMO_TARGETS = {
    "titanic": "survived",
    "iris": "species",
    "wine": "target",
    "diabetes": "target",
    "cancer": "target",
    "housing": "MedHouseVal", 
    "moons": "label", 
    "movies": "rating",
    "penguins": "species",
    "tips": "tip"
}

# ==============================================================================
# 1. MODÈLES DE DONNÉES (PYDANTIC)
# ==============================================================================

class ScrapePreviewRequest(BaseModel):
    url: str

class ScrapeSelectRequest(BaseModel):
    session_id: str
    selected_indices: List[int] 
    merge: bool = False

class SimpleGenerateRequest(BaseModel):
    n_rows: int = 100
    n_cols: int = 5
    task: str = "classification"

class DistributionRule(BaseModel):
    min_val: float
    max_val: float
    percentage: float 

class ColumnDefinition(BaseModel):
    name: str
    type: str = "float" 
    rules: List[DistributionRule]

class CustomGenerateRequest(BaseModel):
    n_rows: int
    columns: List[ColumnDefinition]

class ManualRequest(BaseModel):
    data: List[Dict[str, Any]]

# ==============================================================================
# 2. ENDPOINTS D'INGESTION
# ==============================================================================

# ---  RECHERCHE KAGGLE ---
@router.get("/kaggle/search")
def search_kaggle_route(
    query: str = Query(..., min_length=2, description="Mot clé de recherche"),
    user: User = Depends(current_active_user) 
):
    """
    Recherche des datasets sur Kaggle et retourne une liste de candidats.
    """
    try:
        results = search_kaggle_datasets(query, user) 
        return {"results": results, "count": len(results)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

# --- OPTION 1 : UPLOAD FICHIER (CSV / EXCEL) ---
@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    Charge un fichier CSV ou Excel envoyé par l'utilisateur.
    """
    if not (file.filename.endswith(".csv") or file.filename.endswith((".xls", ".xlsx"))):
        raise HTTPException(status_code=400, detail="Format non supporté. Utilisez CSV ou Excel.")

    try:
        contents = await file.read()
        if file.filename.endswith(".csv"):
            df = pd.read_csv(BytesIO(contents))
        else:
            df = pd.read_excel(BytesIO(contents))
        
        response = save_data_session(df)
        response["suggested_target"] = None 
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erreur de lecture : {str(e)}")


# --- OPTION 2 : KAGGLE API ---
@router.get("/kaggle")
def ingest_kaggle(
    dataset: str = Query(..., description="ID Kaggle (ex: 'titanic')"),
    user: User = Depends(current_active_user) 
):
    """
    Télécharge un dataset depuis Kaggle via l'API.
    """
    try:
        df = load_kaggle(dataset, user)
        
        response = save_data_session(df)
        response["suggested_target"] = None
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur Kaggle : {str(e)}")
    

# --- OPTION 3 : QUICK START (DEMO) ---
@router.get("/quick-start")
def ingest_quick_start(dataset: str = Query(..., description="Choix: iris, titanic, wine, diabetes, cancer, housing, moons")):
    """
    Charge des datasets de démo.
    - Classiques : iris, titanic, wine, cancer, movies
    - Régression : diabetes, housing (plus gros)
    - Clustering : moons (forme géométrique)
    """
    try:
        if dataset == "iris": df = load_iris_dataset()
        elif dataset == "titanic": df = load_titanic_dataset()
        elif dataset == "wine": df = load_wine_dataset()
        elif dataset == "diabetes": df = load_diabetes_dataset()
        elif dataset == "cancer": df = load_breast_cancer_dataset()
        elif dataset == "housing": df = load_housing_dataset()
        elif dataset == "movies": df = load_movies_dataset()
        elif dataset == "moons": df = load_clustering_dataset()
        elif dataset == "penguins": df = load_penguins_dataset()
        elif dataset == "tips": df = load_tips_dataset()    
        else:
            raise HTTPException(
                status_code=400, 
                detail="Dataset inconnu. Options: iris, titanic, wine, diabetes, cancer, housing, moons, movies, penguins, tips"
            )
        
        response = save_data_session(df)
        response["suggested_target"] = DEMO_TARGETS.get(dataset, None)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

# OPTION 4 : WEB SCRAPING 

# ÉTAPE 1 : PRÉVISUALISER LES TABLES 
@router.post("/scrape/preview")
async def scrape_preview(req: ScrapePreviewRequest, user: User = Depends(current_active_user)):
    """
    Scrape l'URL avec Playwright, trouve les tables et renvoie un aperçu.
    """
    try:
        print(f" User {user.email} lance un scrape sur : {req.url}")

        dfs = await scrape_all_tables(req.url)
        
        if not dfs:
            raise HTTPException(status_code=404, detail="Aucune table trouvée sur cette page.")

        temp_session_id = str(uuid.uuid4())
        TEMP_SCRAPED_DATA[temp_session_id] = dfs
        
        previews = []
        for idx, df in enumerate(dfs):
            # Nettoyage NaN -> None pour le JSON
            df_clean = df.head(3).astype(object).where(pd.notnull(df.head(3)), None)
            
            previews.append({
                "index": idx,
                "rows": df.shape[0],
                "cols": df.shape[1],
                "columns": list(df.columns),
                "preview": df_clean.to_dict(orient="records")
            })
            
        return {
            "message": f"{len(dfs)} tables trouvées.",
            "session_id": temp_session_id,
            "tables": previews
        }

    except Exception as e:
        print(f" Erreur scraping : {e}")
        raise HTTPException(status_code=400, detail=str(e))


# ÉTAPE 2 : SÉLECTIONNER ET SAUVEGARDER 
@router.post("/scrape/select")
async def scrape_select(req: ScrapeSelectRequest):
    """
    Reçoit les choix, fusionne et sauvegarde.
    """
    if req.session_id not in TEMP_SCRAPED_DATA:
        raise HTTPException(status_code=404, detail="Session expirée.")
    
    all_dfs = TEMP_SCRAPED_DATA[req.session_id]
    selected_dfs = []

    for idx in req.selected_indices:
        if 0 <= idx < len(all_dfs):
            selected_dfs.append(all_dfs[idx])
    
    if not selected_dfs:
        raise HTTPException(status_code=400, detail="Aucune table sélectionnée.")

    try:
        final_df = pd.DataFrame()
        
        if len(selected_dfs) == 1:
            final_df = selected_dfs[0]
        elif req.merge:
            final_df = pd.concat(selected_dfs, ignore_index=True)
        else:
             final_df = selected_dfs[0] 

        response = save_data_session(final_df) 
        
        # Nettoyage RAM
        del TEMP_SCRAPED_DATA[req.session_id]
        
        response["suggested_target"] = None
        return response

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erreur fusion : {str(e)}")
    

# --- OPTION 5.A : GÉNÉRATION SIMPLE ---
@router.post("/generate/simple")
def ingest_generate_simple(req: SimpleGenerateRequest):
    """
    Génération rapide de données mathématiques (Scikit-Learn).
    """
    try:
        df = generate_simple_data(req.n_rows, req.n_cols, req.task)
        response = save_data_session(df)
        response["suggested_target"] = "target" if "target" in df.columns else None
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# --- OPTION 5.B : GÉNÉRATION CUSTOM ---
@router.post("/generate/custom")
def ingest_generate_custom(req: CustomGenerateRequest):
    """
    Génération avancée avec règles définies par l'utilisateur (Pourcentages, intervalles).
    """
    try:
        df = generate_custom_data(req.n_rows, req.columns)
        response = save_data_session(df)
        response["suggested_target"] = None
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# --- OPTION 6 : ENTRÉE MANUELLE ---
@router.post("/manual")
def ingest_manual(req: ManualRequest):
    """
    Reçoit un tableau JSON brut entré manuellement dans le frontend.
    Convertit les chaînes vides "" en None (pour gérer les cases vides).
    """
    try:
        # Conversion de la liste de dicts en DataFrame
        df = pd.DataFrame(req.data)
        
        # Vérification si vide
        if df.empty:
            raise ValueError("Le tableau manuel est vide.")
            
        # Nettoyage : Si le frontend envoie "" pour une case vide, on met None (NaN)
        # Cela permet au Preprocessing de détecter les valeurs manquantes plus tard.
        df = df.replace(r'^\s*$', None, regex=True)

        response = save_data_session(df)
        response["suggested_target"] = None
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erreur données manuelles : {str(e)}")