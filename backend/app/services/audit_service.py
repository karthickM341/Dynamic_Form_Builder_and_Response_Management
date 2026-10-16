from sqlalchemy.orm import Session
from app.models.activity import ActivityLog
def log(db: Session, action: str, description: str, user_id=None, form_id=None, ip_address=None):
    db.add(ActivityLog(user_id=user_id, form_id=form_id, action=action, description=description, ip_address=ip_address))
