from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import require_admin
from app.models.activity import ActivityLog
router=APIRouter(prefix="/activity-logs",tags=["Activity Logs"])
@router.get("")
def logs(db:Session=Depends(get_db),user=Depends(require_admin)):
    rows=db.query(ActivityLog).order_by(ActivityLog.created_at.desc()).limit(500).all()
    return [{"id":r.id,"user_id":r.user_id,"form_id":r.form_id,"action":r.action,"description":r.description,"created_at":r.created_at.isoformat()} for r in rows]
