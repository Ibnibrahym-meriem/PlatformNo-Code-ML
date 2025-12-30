from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import data_ingestion
from app.routers import preprocessing
from app.routers import visualization

app = FastAPI(
    title="ML Platform API",
    version="0.1.0"
)

app = FastAPI(title="No-Code Data Science API")


# Cela autorise le React (localhost:3000) à parler au Python
origins = [
    "http://localhost:3000", # Le port par défaut de React
    "http://localhost:5173", # Le port par défaut de Vite (si utilisé)
    "*"                      # (Optionnel) Pour tout autoriser en dev
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




print(" DÉBUT DU DIAGNOSTIC DE CHARGEMENT")
# 1. Test Ingestion
try:
    app.include_router(data_ingestion.router)
    print(" Ingestion : OK")
except Exception as e:
    print(f" Ingestion : ERREUR ({e})")

# 2. Test Preprocessing
try:
    app.include_router(preprocessing.router)
    print(" Preprocessing : OK")
except Exception as e:
    print(f" Preprocessing : ERREUR ({e})")

# 3. Test Visualization 
try:
    from app.routers import visualization
    app.include_router(visualization.router)
    print(" Visualization : OK ")
except ImportError as e:
    print(f" Visualization : ERREUR D'IMPORT. Python ne trouve pas le fichier ! ({e})")
except AttributeError as e:
    print(f" Visualization : ERREUR DE CODE. Le fichier existe mais 'router' est introuvable. ({e})")
except Exception as e:
    print(f" Visualization : AUTRE ERREUR ({e})")




app.include_router(data_ingestion.router)
app.include_router(preprocessing.router)
app.include_router(visualization.router)

@app.get("/")
def root():
    return {"status": "API is running"}

