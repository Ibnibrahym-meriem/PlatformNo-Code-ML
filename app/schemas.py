import uuid
from typing import Optional
from fastapi_users import schemas

# réponse API
class UserRead(schemas.BaseUser[uuid.UUID]):
    kaggle_username: Optional[str] = None

# Requête API qu'on envoie pour créer un compte 
class UserCreate(schemas.BaseUserCreate):
    pass

# Ce qu'on envoie pour mettre à jour
class UserUpdate(schemas.BaseUserUpdate):
    kaggle_username: Optional[str] = None
    kaggle_key: Optional[str] = None