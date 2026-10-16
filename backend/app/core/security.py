
from datetime import datetime, timedelta, timezone

from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User


pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)

# Swagger uses a Bearer token instead of an OAuth2 password form.
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/auth/token"
)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)


def create_access_token(subject: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": subject,
        "exp": expire,
    }

    return jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token",
        headers={"WWW-Authenticate": "Bearer"},
    )


    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )

        username = payload.get("sub")

        # Reject password-reset tokens as access tokens.
        if not username or payload.get("purpose") == "password_reset":
            raise exc

    except JWTError:
        raise exc

    user = (
        db.query(User)
        .filter(
            User.username == username,
            User.is_active == True,
        )
        .first()
    )

    if not user:
        raise exc

    return user


def require_admin(
    user: User = Depends(get_current_user),
) -> User:
    if not user.role or user.role.name != "admin":
        raise HTTPException(
            status_code=403,
            detail="Administrator permission required",
        )

    return user


def create_password_reset_token(username: str) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=15)

    payload = {
        "sub": username,
        "purpose": "password_reset",
        "exp": expires_at,
    }

    return jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )


def verify_password_reset_token(token: str) -> str | None:
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )

        if payload.get("purpose") != "password_reset":
            return None

        username = payload.get("sub")

        return username if isinstance(username, str) else None

    except JWTError:
        return None
