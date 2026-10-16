from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.form import Form
from app.models.response import FormResponse, ResponseDetail

def validate_and_save(db: Session, form: Form, values: dict, user_id=None):
    by_name={f.field_name:f for f in form.fields}
    for name, field in by_name.items():
        visible=True
        rule=field.conditional_rules or {}
        if rule.get("field"):
            actual=values.get(rule["field"]); expected=rule.get("equals")
            visible = actual == expected
        if visible and field.is_required and (name not in values or values.get(name) in (None,"",[])):
            raise HTTPException(422, f"{field.label} is required")
        if name in values and field.field_type=="email" and values[name]:
            if "@" not in str(values[name]): raise HTTPException(422, f"Invalid email for {field.label}")
        if name in values and field.field_type=="number" and values[name] not in (None,""):
            try: float(values[name])
            except: raise HTTPException(422, f"Invalid number for {field.label}")
    response=FormResponse(form_id=form.id, submitted_by=user_id); db.add(response); db.flush()
    for name,value in values.items():
        if name in by_name:
            db.add(ResponseDetail(response_id=response.id, field_id=by_name[name].id, field_value=str(value) if value is not None else None))
    db.commit(); db.refresh(response); return response

def to_dict(response, form):
    fields={f.id:f.field_name for f in form.fields}
    return {fields[d.field_id]: d.field_value for d in response.details if d.field_id in fields}
