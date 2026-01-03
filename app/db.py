from typing import AsyncGenerator
from fastapi import Depends
from fastapi_users.db import SQLAlchemyBaseUserTableUUID, SQLAlchemyUserDatabase
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

# 1. URL de la base de données 
DATABASE_URL = "sqlite+aiosqlite:///./test.db"

class Base(DeclarativeBase):
    pass

# 2. Modèle de l'Utilisateur (La Table)
# FastAPI Users ajoute déjà : email, hashed_password, is_active, is_superuser, etc.
class User(SQLAlchemyBaseUserTableUUID, Base):
    pass

# 3. Moteur de base de données
engine = create_async_engine(DATABASE_URL)
async_session_maker = async_sessionmaker(engine, expire_on_commit=False)

# 4. Fonction pour créer les tables au démarrage pour SQLite
async def create_db_and_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# 5. Dépendance pour récupérer une session DB
async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session

# 6. Adaptateur FastAPI Users
async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(session, User)