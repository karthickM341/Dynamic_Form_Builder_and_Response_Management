from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.form import Form
from app.models.response import FormResponse
router=APIRouter(prefix="/analytics",tags=["Analytics"])
@router.get("/dashboard")
def dashboard(db:Session=Depends(get_db),user=Depends(get_current_user)):
    forms_q=db.query(Form) if user.role.name=="admin" else db.query(Form).filter(Form.created_by==user.id)
    forms=forms_q.all(); ids=[f.id for f in forms]
    responses=db.query(FormResponse).filter(FormResponse.form_id.in_(ids)).count() if ids else 0
    return {"total_forms":len(forms),"active_forms":sum(f.is_enabled for f in forms),"total_responses":responses,"forms":[{"id":f.id,"title":f.title,"responses":db.query(FormResponse).filter_by(form_id=f.id).count()} for f in forms]}
@router.get("/forms/{form_id}")
def form_analytics(form_id:int,db:Session=Depends(get_db),user=Depends(get_current_user)):
    total=db.query(FormResponse).filter_by(form_id=form_id).count()
    return {"form_id":form_id,"total_responses":total}
