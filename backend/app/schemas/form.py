from pydantic import BaseModel, ConfigDict, Field
from typing import Any
class FieldOptionIn(BaseModel):
    label: str
    value: str
class FieldIn(BaseModel):
    field_name: str
    label: str
    field_type: str
    placeholder: str | None = None
    is_required: bool = False
    display_order: int = 0
    validation_rules: dict[str, Any] | None = None
    conditional_rules: dict[str, Any] | None = None
    options: list[FieldOptionIn] = []
class FormCreate(BaseModel):
    title: str
    description: str | None = None
    is_public: bool = False
    is_enabled: bool = True
    fields: list[FieldIn] = []
class FormUpdate(FormCreate):
    pass
class OptionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    option_label: str
    option_value: str
    display_order: int
class FieldOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    field_name: str
    label: str
    field_type: str
    placeholder: str | None
    is_required: bool
    display_order: int
    validation_rules: dict | None
    conditional_rules: dict | None
    options: list[OptionOut]
class FormOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    description: str | None
    is_public: bool
    is_enabled: bool
    created_by: int
    fields: list[FieldOut]
