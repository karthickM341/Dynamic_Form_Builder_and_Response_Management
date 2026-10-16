"""initial dynamic form schema

Revision ID: 0001_initial
"""
from alembic import op
import sqlalchemy as sa

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table("roles", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("name", sa.String(30), nullable=False, unique=True))
    op.create_table("users", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("username", sa.String(80), nullable=False), sa.Column("email", sa.String(255), nullable=False), sa.Column("password_hash", sa.String(255), nullable=False), sa.Column("role_id", sa.Integer(), sa.ForeignKey("roles.id"), nullable=False), sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()))
    op.create_index("ix_users_username", "users", ["username"], unique=True)
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_table("forms", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("created_by", sa.Integer(), sa.ForeignKey("users.id"), nullable=False), sa.Column("title", sa.String(200), nullable=False), sa.Column("description", sa.Text()), sa.Column("is_public", sa.Boolean(), nullable=False, server_default=sa.false()), sa.Column("is_enabled", sa.Boolean(), nullable=False, server_default=sa.true()))
    op.create_index("ix_forms_created_by", "forms", ["created_by"])
    op.create_table("form_fields", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("form_id", sa.Integer(), sa.ForeignKey("forms.id", ondelete="CASCADE"), nullable=False), sa.Column("field_name", sa.String(100), nullable=False), sa.Column("label", sa.String(200), nullable=False), sa.Column("field_type", sa.String(30), nullable=False), sa.Column("placeholder", sa.String(255)), sa.Column("is_required", sa.Boolean(), nullable=False, server_default=sa.false()), sa.Column("display_order", sa.Integer(), nullable=False, server_default="0"), sa.Column("validation_rules", sa.JSON()), sa.Column("conditional_rules", sa.JSON()))
    op.create_index("ix_form_fields_form_id", "form_fields", ["form_id"])
    op.create_table("field_options", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("field_id", sa.Integer(), sa.ForeignKey("form_fields.id", ondelete="CASCADE"), nullable=False), sa.Column("option_label", sa.String(200), nullable=False), sa.Column("option_value", sa.String(200), nullable=False), sa.Column("display_order", sa.Integer(), nullable=False, server_default="0"))
    op.create_table("form_responses", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("form_id", sa.Integer(), sa.ForeignKey("forms.id"), nullable=False), sa.Column("submitted_by", sa.Integer(), sa.ForeignKey("users.id")), sa.Column("status", sa.String(30), nullable=False, server_default="submitted"), sa.Column("submitted_at", sa.DateTime(), nullable=False), sa.Column("updated_at", sa.DateTime(), nullable=False))
    op.create_index("ix_form_responses_form_id", "form_responses", ["form_id"])
    op.create_table("response_details", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("response_id", sa.Integer(), sa.ForeignKey("form_responses.id", ondelete="CASCADE"), nullable=False), sa.Column("field_id", sa.Integer(), sa.ForeignKey("form_fields.id"), nullable=False), sa.Column("field_value", sa.Text()))
    op.create_index("ix_response_details_response_id", "response_details", ["response_id"])
    op.create_table("activity_logs", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id")), sa.Column("form_id", sa.Integer(), sa.ForeignKey("forms.id")), sa.Column("action", sa.String(80), nullable=False), sa.Column("description", sa.Text(), nullable=False), sa.Column("ip_address", sa.String(45)), sa.Column("created_at", sa.DateTime(), nullable=False))

def downgrade():
    for t in ["activity_logs","response_details","form_responses","field_options","form_fields","forms","users","roles"]:
        op.drop_table(t)
