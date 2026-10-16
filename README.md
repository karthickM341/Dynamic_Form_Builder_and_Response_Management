# Dynamic Form Builder & Response Management System

A full-stack platform for creating dynamic forms without changing application code. It includes JWT authentication, Admin/User RBAC, a configurable form builder, conditional visibility, response management, analytics, audit logs, Excel/PDF export, Celery background jobs, MySQL 8, and Docker.

## Stack
- Backend: Python 3.12, FastAPI, SQLAlchemy 2, Alembic, Pydantic, JWT, Celery
- Frontend: React, Vite, TypeScript, Material UI, Axios, React Router, React Hook Form-ready architecture, Recharts
- Database: MySQL 8.0
- Infrastructure: Redis, Docker Compose

## Quick start with Docker
```bash
docker compose up --build
```
Open `http://localhost:5173` and API docs at `http://localhost:8000/docs`.

## Local development
### Backend
```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

### Celery worker
```powershell
cd backend
celery -A app.tasks.celery_app.celery_app worker --loglevel=info -Q exports
```

### Frontend
```powershell
cd frontend
npm install
copy .env.example .env
npm run dev
```

## MySQL
Create a database named `dynamic_forms`, or use Docker Compose. Update `backend/.env` with your MySQL credentials.

## Main workflow
1. Register and login.
2. Create an admin account for development if needed by selecting `admin` during registration; lock this down in production.
3. Create a form and add fields.
4. Configure required fields, options and conditional rules.
5. Enable the form and submit responses.
6. Review responses and export Excel/PDF.
7. View dashboard analytics and activity logs.

## Conditional rule format
A field can contain a rule such as:
```json
{"field":"employment_status","equals":"employed"}
```
The field is displayed only when the referenced field equals the configured value.

## API
Swagger/OpenAPI: `http://localhost:8000/docs`
OpenAPI JSON: `http://localhost:8000/openapi.json`

## Project structure
`backend/` contains the FastAPI application and database models. `frontend/` contains the React application. `docker-compose.yml` runs MySQL, Redis, FastAPI, Celery and React.

## Production notes
Change the JWT secret, restrict CORS, disable self-service admin registration, configure secure file storage, add HTTPS, and run Alembic migrations as part of deployment.
