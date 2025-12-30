from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Any, Literal
from app.services.preprocessing_service import PreprocessingService
from app.utils.file_manager import load_data_session, save_data_session

router = APIRouter(
    prefix="/preprocess",
    tags=["Preprocessing"]
)



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
    auto_clean: bool = False
    drop_duplicates: bool = False
    strategies: List[CleaningRule] = []

@router.post("/clean")
def clean_dataset(req: CleanRequest):
    try:
        df = load_data_session(req.session_id)
        params = {
            "auto_clean": req.auto_clean,
            "drop_duplicates": req.drop_duplicates,
            "strategies": [rule.dict() for rule in req.strategies]
        }
        df_clean = PreprocessingService.clean_dataframe(df, params)
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
    auto_encode: bool = False
    strategies: List[EncodingRule]

@router.post("/encode")
def encode_dataset(req: EncodeRequest):
    try:
        df = load_data_session(req.session_id)
        params = {
            "auto_encode": req.auto_encode,
            "strategies": [rule.dict() for rule in req.strategies],
            "target_column": req.target_column
        }
        df_encoded = PreprocessingService.encode_dataframe(df, params)
        save_data_session(df_encoded, req.session_id)
        return {"message": "Encodage effectué", "info": PreprocessingService.get_dataframe_info(df_encoded)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- 4. NORMALIZATION ---
class NormalizeRequest(BaseModel):
    session_id: str
    auto_normalize: bool = False
    target_column: Optional[str] = None
    method: Literal["standard", "minmax"] = "standard"
    columns: List[str]= []

@router.post("/normalize")
def normalize_dataset(req: NormalizeRequest):
    try:
        df = load_data_session(req.session_id)
        params = req.dict()
        df_norm = PreprocessingService.normalize_dataframe(df, params)
        save_data_session(df_norm, req.session_id)
        return {"message": "Normalisation effectuée", "info": PreprocessingService.get_dataframe_info(df_norm)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- 5. OUTLIERS ---
class OutlierRequest(BaseModel):
    session_id: str
    auto_outliers: bool = False
    method: Literal["zscore", "iqr"] = "iqr"
    threshold: float = 1.5
    action: Literal["drop", "clip"] = "clip"
    columns: List[str]= []

@router.post("/outliers")
def handle_outliers_route(req: OutlierRequest):
    try:
        df = load_data_session(req.session_id)
        params = req.dict()
        df_res = PreprocessingService.handle_outliers(df, params)
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
        params = req.dict()
        df_res = PreprocessingService.balance_data(df, params)
        save_data_session(df_res, req.session_id)
        return {"message": "Dataset rééquilibré", "info": PreprocessingService.get_dataframe_info(df_res)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
