from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user, require_admin
from app.models.form import Form
from app.schemas.form import FormCreate, FormUpdate, FormOut
from app.services.form_service import save_form, get_form
from app.services.audit_service import log
router=APIRouter(prefix="/forms",tags=["Forms"])
@router.post("",response_model=FormOut)
def create(data:FormCreate, db:Session=Depends(get_db), user=Depends(require_admin)):
    form=save_form(db,data,user.id); log(db,"CREATE_FORM",f"Created form {form.title}",user.id,form.id); db.commit(); return form
@router.get("",response_model=list[FormOut])
def list_forms(db:Session=Depends(get_db), user=Depends(get_current_user)):
    if user.role.name=="admin": return db.query(Form).all()
    return db.query(Form).filter((Form.is_public==True)&(Form.is_enabled==True)).all()
@router.get("/{form_id}",response_model=FormOut)
def get(form_id:int,db:Session=Depends(get_db),user=Depends(get_current_user)):
    form=get_form(db,form_id)
    if not form.is_enabled and user.role.name!="admin": raise HTTPException(403,"Form is disabled")
    if not form.is_public and form.created_by!=user.id and user.role.name!="admin": raise HTTPException(403,"Private form")
    return form
@router.put("/{form_id}",response_model=FormOut)
def update(form_id:int,data:FormUpdate,db:Session=Depends(get_db),user=Depends(require_admin)):
    form=get_form(db,form_id); form=save_form(db,data,user.id,form); log(db,"UPDATE_FORM",f"Updated form {form.title}",user.id,form.id); db.commit(); return form
@router.delete("/{form_id}")
def delete(form_id:int,db:Session=Depends(get_db),user=Depends(require_admin)):
    form=get_form(db,form_id); db.delete(form); log(db,"DELETE_FORM",f"Deleted form {form.title}",user.id,form.id); db.commit(); return {"message":"Form deleted"}
@router.patch("/{form_id}/toggle",response_model=FormOut)
def toggle(form_id:int,db:Session=Depends(get_db),user=Depends(require_admin)):
    form=get_form(db,form_id); form.is_enabled=not form.is_enabled; db.commit(); db.refresh(form); log(db,"TOGGLE_FORM",f"Form {form.title} enabled={form.is_enabled}",user.id,form.id); db.commit(); return form
