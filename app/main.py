import sys
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import create_db_and_tables
from app.schemas import UserRead, UserCreate, UserUpdate
from app.users import auth_backend, fastapi_users, current_active_user
from app.routers import data_ingestion
from app.routers import preprocessing
from app.routers import visualization

if sys.platform.startswith("win"):
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_db_and_tables()
    print(" Base de données (SQLite) prête et tables créées.")
    yield

# 2. CRÉATION DE L'APP
app = FastAPI(
    title="No-Code Data Science API",
    version="0.1.0",
    lifespan=lifespan 
)

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

# Route pour le LOGIN (/auth/jwt/login)
app.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/auth/jwt",
    tags=["Auth"],
)

# Route pour l'INSCRIPTION (/auth/register)
app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["Auth"],
)
# Route pour la GESTION DES UTILISATEURS (/users)
app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)

app.include_router(data_ingestion.router)
app.include_router(preprocessing.router)
app.include_router(visualization.router)

@app.get("/")
def root():
    return {"status": "API is running", "security": "Enabled"}



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

