from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import pandas as pd
from io import BytesIO

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
from app.services.scraping_service import scrape_url
from app.services.generation_service import generate_simple_data, generate_custom_data
from app.utils.file_manager import save_data_session

# --- CONFIGURATION DU ROUTEUR ---
router = APIRouter(
    prefix="/data",
    tags=["Data Ingestion"]
)

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

# Modèle pour le Scraping
class ScrapeRequest(BaseModel):
    url: str

# Modèle pour la Génération SIMPLE (Scikit-Learn)
class SimpleGenerateRequest(BaseModel):
    n_rows: int = 100
    n_cols: int = 5
    task: str = "classification" # "classification" ou "regression"

# Modèles pour la Génération CUSTOM (Règles précises)
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

# Modèle pour l'Entrée MANUELLE
class ManualRequest(BaseModel):
    # Le front envoie une liste d'objets JSON
    # Ex: [{"nom": "Alice", "age": 25}, {"nom": "Bob", "age": null}]
    data: List[Dict[str, Any]]

# ==============================================================================
# 2. ENDPOINTS D'INGESTION
# ==============================================================================

# ---  RECHERCHE KAGGLE ---
@router.get("/kaggle/search")
def search_kaggle_route(query: str = Query(..., min_length=2, description="Mot clé de recherche")):
    """
    Recherche des datasets sur Kaggle et retourne une liste de candidats.
    """
    try:
        results = search_kaggle_datasets(query)
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
def ingest_kaggle(dataset: str = Query(..., description="ID Kaggle (ex: 'titanic')")):
    """
    Télécharge un dataset depuis Kaggle via l'API.
    """
    try:
        df = load_kaggle(dataset)
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
    

# --- OPTION 4 : WEB SCRAPING ---
@router.post("/scrape")
def ingest_scrape(req: ScrapeRequest):
    """
    Extrait le premier tableau HTML trouvé sur une URL donnée.
    """
    try:
        df = scrape_url(req.url)
        response = save_data_session(df)
        response["suggested_target"] = None
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


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