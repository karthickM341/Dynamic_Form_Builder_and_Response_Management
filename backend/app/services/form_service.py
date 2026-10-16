from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.form import Form, FormField, FieldOption

def save_form(db: Session, data, user_id: int, form: Form | None = None):
    if form is None:
        form = Form(created_by=user_id, title=data.title, description=data.description, is_public=data.is_public, is_enabled=data.is_enabled)
        db.add(form); db.flush()
    else:
        form.title=data.title; form.description=data.description; form.is_public=data.is_public; form.is_enabled=data.is_enabled
        form.fields.clear(); db.flush()
    for idx, item in enumerate(data.fields):
        field=FormField(form_id=form.id, field_name=item.field_name, label=item.label, field_type=item.field_type, placeholder=item.placeholder, is_required=item.is_required, display_order=item.display_order if item.display_order is not None else idx, validation_rules=item.validation_rules, conditional_rules=item.conditional_rules)
        db.add(field); db.flush()
        for oi, opt in enumerate(item.options):
            db.add(FieldOption(field_id=field.id, option_label=opt.label, option_value=opt.value, display_order=oi))
    db.commit(); db.refresh(form); return form

def get_form(db, form_id):
    form=db.query(Form).filter(Form.id==form_id).first()
    if not form: raise HTTPException(404, "Form not found")
    return form
