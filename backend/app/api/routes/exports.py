from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from io import BytesIO
from openpyxl import Workbook
from reportlab.pdfgen import canvas
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.form import Form
from app.models.response import FormResponse
from app.services.response_service import to_dict
router=APIRouter(prefix="/exports",tags=["Exports"])
def load(form_id,db,user):
    form=db.query(Form).filter_by(id=form_id).first()
    if not form: return None,[]
    rows=db.query(FormResponse).filter_by(form_id=form_id).all()
    return form,[to_dict(r,form) for r in rows]
@router.get("/{form_id}/excel")
def excel(form_id:int,db:Session=Depends(get_db),user=Depends(get_current_user)):
    form,rows=load(form_id,db,user); wb=Workbook(); ws=wb.active; ws.title="Responses"
    headers=[f.field_name for f in form.fields]; ws.append(headers)
    for row in rows: ws.append([row.get(h,"") for h in headers])
    buf=BytesIO(); wb.save(buf); buf.seek(0)
    return StreamingResponse(buf,media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",headers={"Content-Disposition":f'attachment; filename="form_{form_id}_responses.xlsx"'})
@router.get("/{form_id}/pdf")
def pdf(form_id:int,db:Session=Depends(get_db),user=Depends(get_current_user)):
    form,rows=load(form_id,db,user); buf=BytesIO(); c=canvas.Canvas(buf); c.setTitle(form.title)
    y=800; c.drawString(40,y,form.title); y-=30
    for i,row in enumerate(rows[:100],1):
        c.drawString(40,y,f"Response {i}: {str(row)[:110]}"); y-=18
        if y<50: c.showPage(); y=800
    c.save(); buf.seek(0)
    return StreamingResponse(buf,media_type="application/pdf",headers={"Content-Disposition":f'attachment; filename="form_{form_id}_responses.pdf"'})
