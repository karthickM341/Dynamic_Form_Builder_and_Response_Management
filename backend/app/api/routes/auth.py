
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    create_password_reset_token,
    verify_password_reset_token,
)
from app.models.user import User, Role
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest,
    Token,
    UserOut,
    ForgotPasswordRequest,
    ResetPasswordRequest,
)
from fastapi.security import OAuth2PasswordRequestForm


router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserOut)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(
        (User.username == data.username) |
        (User.email == data.email)
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="Username or email already exists",
        )

    role_name = data.role if data.role in ("admin", "user") else "user"

    role = db.query(Role).filter_by(name=role_name).first()

    if not role:
        role = Role(name=role_name)
        db.add(role)
        db.flush()

    user = User(
        username=data.username,
        email=data.email,
        password_hash=hash_password(data.password),
        role_id=role.id,
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": role.name,
        "is_active": user.is_active,
    }


@router.post("/login", response_model=Token)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        User.username == data.username
    ).first()

    if not user or not verify_password(
        data.password, user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="Account is inactive",
        )

    return {
        "access_token": create_access_token(user.username),
        "token_type": "bearer",
    }


@router.post("/forgot-password")
def forgot_password(
    data: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(
        User.email == data.email
    ).first()

    # Generic response helps avoid revealing registered emails.
    response = {
        "message": (
            "If the email is registered, password reset "
            "instructions will be provided."
        )
    }

    # LOCAL DEVELOPMENT ONLY:
    # Replace this with sending a reset link by email in production.
    if user:
        response["reset_token"] = create_password_reset_token(
            user.username
        )

    return response


@router.post("/reset-password")
def reset_password(
    data: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    username = verify_password_reset_token(data.token)

    if not username:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired reset token",
        )

    user = db.query(User).filter(
        User.username == username
    ).first()

    if not user:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired reset token",
        )

    user.password_hash = hash_password(data.new_password)
    db.commit()

    return {"message": "Password has been reset successfully"}


@router.get("/me", response_model=UserOut)
def me(user=Depends(get_current_user)):
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role.name,
        "is_active": user.is_active,
    }

@router.post("/token", response_model=Token)
def swagger_login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(
        User.username == form_data.username
    ).first()

    if not user or not verify_password(
        form_data.password, user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="Account is inactive",
        )

    return {
        "access_token": create_access_token(user.username),
        "token_type": "bearer",
    }