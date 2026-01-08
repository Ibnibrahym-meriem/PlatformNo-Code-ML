from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Any, Literal
from app.services.preprocessing_service import PreprocessingService
from app.utils.file_manager import load_data_session, save_data_session
from app.db import User
from app.users import current_active_user

router = APIRouter(
    prefix="/preprocess",
    tags=["Preprocessing"],
    dependencies=[Depends(current_active_user)]
)


#   LE BOUTON Auto Clean (AUTO PIPELINE)

class AutoPipelineRequest(BaseModel):
    session_id: str
    target_column: Optional[str] = None 

@router.post("/auto-pipeline")
def run_auto_preprocessing(req: AutoPipelineRequest):
    """
    Lance TOUT le nettoyage automatiquement : Clean -> Encode -> Outliers -> Normalize
    """
    try:
        df = load_data_session(req.session_id)
        if df is None:
            raise HTTPException(status_code=404, detail="Session introuvable")

        # Appel au "Cerveau" du service
        df_final = PreprocessingService.run_auto_pipeline(df, req.target_column)
        
        save_data_session(df_final, req.session_id)
        
        return {
            "message": "Preprocessing automatique terminé avec succès !",
            "info": PreprocessingService.get_dataframe_info(df_final)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

# --- 1. INFO ---
class SessionRequest(BaseModel):
    session_id: str

@router.post("/info")
def get_dataset_info(req: SessionRequest):
    try:
        df = load_data_session(req.session_id)
        info = PreprocessingService.get_dataframe_info(df)
        return {"session_id": req.session_id, "info": info}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- 2. CLEANING ---
class CleaningRule(BaseModel):
    column: str
    method: Literal["drop_rows", "mean", "median", "mode", "constant"]
    value: Optional[Any] = None

class CleanRequest(BaseModel):
    session_id: str
    drop_duplicates: bool = False
    strategies: List[CleaningRule] = []

@router.post("/clean")
def clean_dataset(req: CleanRequest):
    try:
        df = load_data_session(req.session_id)
        df_clean = PreprocessingService.clean_dataframe(df, req.dict())
        save_data_session(df_clean, req.session_id)
        return {"message": "Nettoyage effectué", "info": PreprocessingService.get_dataframe_info(df_clean)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- 3. ENCODING ---
class EncodingRule(BaseModel):
    column: str
    method: Literal["label", "onehot", "target"]

class EncodeRequest(BaseModel):
    session_id: str
    target_column: Optional[str] = None 
    strategies: List[EncodingRule]

@router.post("/encode")
def encode_dataset(req: EncodeRequest):
    try:
        df = load_data_session(req.session_id)
        df_encoded = PreprocessingService.encode_dataframe(df, req.dict())
        save_data_session(df_encoded, req.session_id)
        return {"message": "Encodage effectué", "info": PreprocessingService.get_dataframe_info(df_encoded)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- 4. NORMALIZATION ---
class NormalizeRequest(BaseModel):
    session_id: str
    method: Literal["standard", "minmax"] = "standard"
    columns: List[str]= []

@router.post("/normalize")
def normalize_dataset(req: NormalizeRequest):
    try:
        df = load_data_session(req.session_id)
        df_norm = PreprocessingService.normalize_dataframe(df, req.dict())
        save_data_session(df_norm, req.session_id)
        return {"message": "Normalisation effectuée", "info": PreprocessingService.get_dataframe_info(df_norm)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- 5. OUTLIERS ---
class OutlierRequest(BaseModel):
    session_id: str
    method: Literal["zscore", "iqr"] = "iqr"
    threshold: float = 1.5
    action: Literal["drop", "clip"] = "clip"
    columns: List[str]= []

@router.post("/outliers")
def handle_outliers_route(req: OutlierRequest):
    try:
        df = load_data_session(req.session_id)
        df_res = PreprocessingService.handle_outliers(df, req.dict())
        save_data_session(df_res, req.session_id)
        return {"message": "Outliers traités", "info": PreprocessingService.get_dataframe_info(df_res)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# --- 6. BALANCE ---
class BalanceRequest(BaseModel):
    session_id: str
    target_column: str
    method: str = "smote"
    
@router.post("/balance")
def balance_dataset_route(req: BalanceRequest):
    try:
        df = load_data_session(req.session_id)
        df_res = PreprocessingService.balance_data(df, req.dict())
        save_data_session(df_res, req.session_id)
        return {"message": "Dataset rééquilibré", "info": PreprocessingService.get_dataframe_info(df_res)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
