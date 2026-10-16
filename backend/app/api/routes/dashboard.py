from fastapi import APIRouter, Depends
from app.core.security import get_current_user
router=APIRouter(prefix="/dashboard",tags=["Dashboard"])
@router.get("/health")
def health(user=Depends(get_current_user)): return {"status":"ok"}
