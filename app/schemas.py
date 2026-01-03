import uuid
from fastapi_users import schemas

# réponse API
class UserRead(schemas.BaseUser[uuid.UUID]):
    pass

# Requête API qu'on envoie pour créer un compte 
class UserCreate(schemas.BaseUserCreate):
    pass

# Ce qu'on envoie pour mettre à jour
class UserUpdate(schemas.BaseUserUpdate):
    pass