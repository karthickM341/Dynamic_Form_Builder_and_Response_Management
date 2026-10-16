from pydantic import BaseModel
from typing import Any
class ResponseCreate(BaseModel):
    values: dict[str, Any]
class ResponseOut(BaseModel):
    id: int
    form_id: int
    submitted_by: int | None
    status: str
    submitted_at: str
    values: dict[str, Any]
