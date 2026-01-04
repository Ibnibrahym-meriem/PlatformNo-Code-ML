from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from app.services.model_training_service import ModelTrainingService
from app.utils.ml_config import ML_ALGO_PARAMS # <--- Import the config

router = APIRouter(prefix="/training", tags=["Model Training"])
service = ModelTrainingService()

# --- DTOs (Data Transfer Objects) ---
class TargetSelectionRequest(BaseModel):
    session_id: str
    target_column: Optional[str] = None

class TrainRequest(BaseModel):
    session_id: str
    target_column: Optional[str] = None 
    problem_type: str  # "Classification", "Regression", or "Unsupervised"
    algorithm_name: str 
    
    # ✅ SPLIT LOGIC:
    # 1. default=0.2 : If the user ignores the slider, this value is used.
    # 2. ge=0.01, lt=1.0 : Prevents crashes (e.g. 0% test size or 100% test size).
    split_ratio: float = Field(0.2, ge=0.01, lt=1.0, description="Test set size (0.01 to 0.99)")
    # Cross-Validation Logic
    # Default is 5. We limit it between 2 and 20 to prevent server overload.
    k_folds: int = Field(5, ge=2, le=20, description="Number of Cross-Validation folds")
    #  Dictionary for hyperparameters (e.g. {"n_estimators": 150})
    hyperparameters: Optional[Dict[str, Any]] = {}

# --- ENDPOINTS ---

@router.get("/hyperparameters/{algorithm_name}")
def get_algorithm_hyperparameters(algorithm_name: str):
    """
    Returns the tunable hyperparameters for the specific algorithm
    so the Frontend can render the correct sliders.
    """
    params = ML_ALGO_PARAMS.get(algorithm_name)
    if params is None:
        # Return empty list if algorithm not found or has no params
        return []
    return params



@router.post("/detect-problem-type")
def detect_problem_type(request: TargetSelectionRequest):
    """
    Returns the detected problem type (Regression, Classification, Unsupervised).
    """
    try:
        return service.detect_problem_type(request.session_id, request.target_column)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/train")
def train_model(request: TrainRequest):
    """
    Executes training using the split_ratio provided (or default).
    """
    try:
        # The 'split_ratio' is automatically extracted from the request
        result = service.train_model(
            session_id=request.session_id,
            target_column=request.target_column,
            problem_type=request.problem_type,
            algorithm_name=request.algorithm_name,
            split_ratio=request.split_ratio,
            k_folds=request.k_folds, # Passing the new parameter
            hyperparameters=request.hyperparameters # Pass the dictionary
        )
        return result
    except Exception as e:
        print(f"Training Error: {e}")
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")