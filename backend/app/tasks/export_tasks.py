from app.tasks.celery_app import celery_app
@celery_app.task
def generate_export_notice(form_id: int, export_type: str):
    return {"form_id": form_id, "export_type": export_type, "status": "queued"}
