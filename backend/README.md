# Dynamic Form Builder Backend

FastAPI backend for dynamic forms, responses, analytics and exports.

## Run locally
1. Create MySQL database `dynamic_forms`.
2. Copy `.env.example` to `.env` and update credentials.
3. `python -m venv .venv`
4. `.venv\Scripts\activate` on Windows.
5. `pip install -r requirements.txt`
6. `uvicorn app.main:app --reload`
7. Open http://localhost:8000/docs

The application creates the core tables on startup for a quick development setup. Alembic is included for migration-based deployments.
