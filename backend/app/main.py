from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import SessionLocal
from app.models.user import Role

from app.api.routes import (
    auth,
    forms,
    responses,
    analytics,
    exports,
    activity_logs,
    dashboard,
)


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Dynamic Form Builder & Response Management API",
)


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in settings.CORS_ORIGINS.split(",")
        if origin.strip()
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# API ROUTES
# --------------------------------------------------

app.include_router(auth.router, prefix="/api")
app.include_router(forms.router, prefix="/api")
app.include_router(responses.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(exports.router, prefix="/api")
app.include_router(activity_logs.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")


# --------------------------------------------------
# STARTUP
# --------------------------------------------------

@app.on_event("startup")
def startup():
    
    db = SessionLocal()

    try:
        for name in ("admin", "user"):
            existing_role = (
                db.query(Role)
                .filter_by(name=name)
                .first()
            )

            if not existing_role:
                db.add(Role(name=name))

        db.commit()

    finally:
        db.close()


# --------------------------------------------------
# ROOT
# --------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "Dynamic Form Builder API",
        "docs": "/docs",
    }


# --------------------------------------------------
# HEALTH CHECK
# --------------------------------------------------

@app.get("/health")
def health():
    return {
        "status": "healthy"
    }