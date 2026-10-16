from sqlalchemy import String, Text, Boolean, Integer, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class Form(Base):
    __tablename__ = "forms"
    id: Mapped[int] = mapped_column(primary_key=True)
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_public: Mapped[bool] = mapped_column(Boolean, default=False)
    is_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    fields: Mapped[list["FormField"]] = relationship(back_populates="form", cascade="all, delete-orphan", order_by="FormField.display_order")

class FormField(Base):
    __tablename__ = "form_fields"
    id: Mapped[int] = mapped_column(primary_key=True)
    form_id: Mapped[int] = mapped_column(ForeignKey("forms.id", ondelete="CASCADE"), index=True)
    field_name: Mapped[str] = mapped_column(String(100))
    label: Mapped[str] = mapped_column(String(200))
    field_type: Mapped[str] = mapped_column(String(30))
    placeholder: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_required: Mapped[bool] = mapped_column(Boolean, default=False)
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    validation_rules: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    conditional_rules: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    form: Mapped[Form] = relationship(back_populates="fields")
    options: Mapped[list["FieldOption"]] = relationship(back_populates="field", cascade="all, delete-orphan", order_by="FieldOption.display_order")

class FieldOption(Base):
    __tablename__ = "field_options"
    id: Mapped[int] = mapped_column(primary_key=True)
    field_id: Mapped[int] = mapped_column(ForeignKey("form_fields.id", ondelete="CASCADE"))
    option_label: Mapped[str] = mapped_column(String(200))
    option_value: Mapped[str] = mapped_column(String(200))
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    field: Mapped[FormField] = relationship(back_populates="options")
