from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import pandas as pd
import numpy as np
from app.utils.file_manager import load_data_session

router = APIRouter(
    prefix="/vis",
    tags=["Visualisation"]
)

class ColumnRequest(BaseModel):
    session_id: str
    column: str

class ScatterRequest(BaseModel):
    session_id: str
    x_column: str
    y_column: str

# 1. Récupérer la liste des colonnes (pour les menus déroulants)
@router.get("/columns/{session_id}")
def get_columns(session_id: str):
    try:
        df = load_data_session(session_id)
        # On renvoie les colonnes numériques et catégorielles séparément
        return {
            "all_columns": df.columns.tolist(),
            "numeric_columns": df.select_dtypes(include=[np.number]).columns.tolist(),
            "categorical_columns": df.select_dtypes(include=['object', 'category']).columns.tolist()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 2. Données pour un Histogramme (Distribution)
@router.post("/histogram")
def get_histogram_data(req: ColumnRequest):
    try:
        df = load_data_session(req.session_id)
        if req.column not in df.columns:
            raise HTTPException(status_code=404, detail="Colonne introuvable")
        
        # On nettoie les NaN pour le graphique
        data = df[req.column].dropna().tolist()
        
        return {
            "column": req.column,
            "values": data  # On renvoie la liste brute, le frontend fera les barres
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 3. Données pour la Matrice de Corrélation (Heatmap)
@router.get("/correlation/{session_id}")
def get_correlation_matrix(session_id: str):
    try:
        df = load_data_session(session_id)
        # On ne garde que les chiffres pour la corrélation
        df_num = df.select_dtypes(include=[np.number])
        
        if df_num.empty:
            return {"error": "Pas de colonnes numériques"}

        # Calcul de la matrice
        corr_matrix = df_num.corr()
        
        # Formatage pour le frontend (Plotly aime ce format)
        return {
            "x": corr_matrix.columns.tolist(),
            "y": corr_matrix.columns.tolist(),
            "z": corr_matrix.values.tolist() # Les valeurs de corrélation
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 4. Nuage de points (Scatter Plot) - Relation entre 2 variables
@router.post("/scatter")
def get_scatter_data(req: ScatterRequest):
    try:
        df = load_data_session(req.session_id)
        
        # Vérification que les colonnes existent
        if req.x_column not in df.columns or req.y_column not in df.columns:
            raise HTTPException(status_code=404, detail="Colonnes introuvables")
            
        # On renvoie les deux listes de données
        return {
            "x": df[req.x_column].tolist(),
            "y": df[req.y_column].tolist(),
            "x_name": req.x_column,
            "y_name": req.y_column
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 5. Diagramme pour les Catégories (Pie Chart / Bar Chart)
@router.post("/categorical")
def get_categorical_data(req: ColumnRequest):
    try:
        df = load_data_session(req.session_id)
        
        if req.column not in df.columns:
            raise HTTPException(status_code=404, detail="Colonne introuvable")
            
        # On compte combien de fois chaque valeur apparaît (ex: "Ford": 12, "BMW": 8)
        counts = df[req.column].value_counts()
        
        # On limite aux 15 catégories les plus fréquentes pour ne pas surcharger le graphe
        counts = counts.head(15)
        
        return {
            "labels": counts.index.tolist(),
            "values": counts.values.tolist()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 6. Boîte à moustaches (Boxplot) - Pour les outliers
@router.post("/boxplot")
def get_boxplot_data(req: ColumnRequest):
    try:
        df = load_data_session(req.session_id)
        
        if req.column not in df.columns:
            raise HTTPException(status_code=404, detail="Colonne introuvable")
            
        # On renvoie simplement les données brutes, le frontend fera le calcul des quartiles
        return {
            "values": df[req.column].dropna().tolist(),
            "name": req.column
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))