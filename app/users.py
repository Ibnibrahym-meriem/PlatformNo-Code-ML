# app/users.py
import uuid
from typing import Optional
from fastapi import Depends, Request
from fastapi_users import BaseUserManager, FastAPIUsers, UUIDIDMixin
from fastapi_users.authentication import (
    AuthenticationBackend,
    BearerTransport,
    JWTStrategy,
)
from app.db import User, get_user_db

SECRET = "fJCEOk1Ua1msv6-Tk37giyS75s3kZ0MwRFiSttfXgT8"

# 1. Configuration du Manager
class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):
    reset_password_token_secret = SECRET
    verification_token_secret = SECRET

    async def on_after_register(self, user: User, request: Optional[Request] = None):
        print(f"Nouvel utilisateur inscrit : {user.email}")

async def get_user_manager(user_db=Depends(get_user_db)):
    yield UserManager(user_db)

# 2. Configuration du JWT (Bearer Token)
bearer_transport = BearerTransport(tokenUrl="auth/jwt/login")

def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(secret=SECRET, lifetime_seconds=3600)

auth_backend = AuthenticationBackend(
    name="jwt",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)

# 3. L'objet principal FastAPI Users
fastapi_users = FastAPIUsers[User, uuid.UUID](
    get_user_manager,
    [auth_backend],
)

# 4. Le "Videur" pour protéger les routes
current_active_user = fastapi_users.current_user(active=True)