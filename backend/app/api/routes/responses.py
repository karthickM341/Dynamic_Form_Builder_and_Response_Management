from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.form import Form
from app.models.response import FormResponse
from app.schemas.response import ResponseCreate
from app.services.response_service import validate_and_save, to_dict
from app.services.audit_service import log
router=APIRouter(tags=["Responses"])
@router.post("/forms/{form_id}/responses")
def submit(form_id:int,data:ResponseCreate,db:Session=Depends(get_db),user=Depends(get_current_user)):
    form=db.query(Form).filter_by(id=form_id).first()
    if not form or not form.is_enabled: raise HTTPException(404,"Form not available")
    r=validate_and_save(db,form,data.values,user.id); log(db,"SUBMIT_RESPONSE",f"Submitted response {r.id}",user.id,form.id); db.commit()
    return {"id":r.id,"message":"Response submitted"}
@router.get("/forms/{form_id}/responses")
def list_responses(form_id:int,search:str|None=None,db:Session=Depends(get_db),user=Depends(get_current_user)):
    form=db.query(Form).filter_by(id=form_id).first()
    if not form: raise HTTPException(404,"Form not found")
    if user.role.name!="admin" and form.created_by!=user.id: raise HTTPException(403,"Not permitted")
    rows=db.query(FormResponse).filter_by(form_id=form_id).order_by(FormResponse.submitted_at.desc()).all()
    result=[]
    for r in rows:
        values=to_dict(r,form)
        if search and search.lower() not in str(values).lower(): continue
        result.append({"id":r.id,"form_id":r.form_id,"submitted_by":r.submitted_by,"status":r.status,"submitted_at":r.submitted_at.isoformat(),"values":values})
    return result
@router.get("/responses/{response_id}")
def get_response(response_id:int,db:Session=Depends(get_db),user=Depends(get_current_user)):
    r=db.query(FormResponse).filter_by(id=response_id).first()
    if not r: raise HTTPException(404,"Response not found")
    form=db.query(Form).filter_by(id=r.form_id).first()
    if user.role.name!="admin" and r.submitted_by!=user.id and form.created_by!=user.id: raise HTTPException(403,"Not permitted")
    return {"id":r.id,"form_id":r.form_id,"submitted_by":r.submitted_by,"status":r.status,"submitted_at":r.submitted_at.isoformat(),"values":to_dict(r,form)}


@router.get("/public/forms/{form_id}")
def public_form(form_id:int,db:Session=Depends(get_db)):
    form=db.query(Form).filter(Form.id==form_id, Form.is_public==True, Form.is_enabled==True).first()
    if not form: raise HTTPException(404,"Public form not available")
    return form

@router.post("/public/forms/{form_id}/responses")
def public_submit(form_id:int,data:ResponseCreate,db:Session=Depends(get_db)):
    form=db.query(Form).filter(Form.id==form_id, Form.is_public==True, Form.is_enabled==True).first()
    if not form: raise HTTPException(404,"Public form not available")
    r=validate_and_save(db,form,data.values,None); log(db,"PUBLIC_SUBMIT_RESPONSE",f"Public response {r.id}",None,form.id); db.commit()
    return {"id":r.id,"message":"Response submitted"}

@router.put("/responses/{response_id}")
def update_response(response_id:int,data:ResponseCreate,db:Session=Depends(get_db),user=Depends(get_current_user)):
    r=db.query(FormResponse).filter_by(id=response_id).first()
    if not r: raise HTTPException(404,"Response not found")
    form=db.query(Form).filter_by(id=r.form_id).first()
    if user.role.name!="admin" and r.submitted_by!=user.id: raise HTTPException(403,"You do not have permission to edit this response")
    for detail in r.details:
        if detail.field_id in {f.id for f in form.fields}:
            fname=next(f.field_name for f in form.fields if f.id==detail.field_id)
            if fname in data.values: detail.field_value=str(data.values[fname])
    r.status="updated"; db.commit(); log(db,"UPDATE_RESPONSE",f"Updated response {r.id}",user.id,form.id); db.commit()
    return {"id":r.id,"message":"Response updated"}
