---
title: Todo App Backend API
emoji: "API"
colorFrom: blue
colorTo: green
sdk: docker
pinned: false
license: mit
---

# Backend Core & Data Layer

RESTful API for managing user-owned tasks with JWT authentication.

## Tech Stack

- **Framework**: FastAPI
- **ORM**: SQLModel
- **Database**: Neon PostgreSQL (serverless)
- **Authentication**: JWT (Better Auth compatible)

## Quick Start

```bash
# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET

# Run server
uvicorn app.main:app --reload --port 8000
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| DATABASE_URL | Neon PostgreSQL connection string | postgresql://user:pass@host.neon.tech/db?sslmode=require |
| JWT_SECRET | Shared secret with Better Auth | your-secret-key |
| JWT_ALGORITHM | JWT signing algorithm | HS256 |
| CORS_ORIGINS | Allowed frontend origins | http://localhost:3000 |
| DEBUG | Enable SQL logging | false |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Health check (no auth) |
| POST | /api/tasks | Create task |
| GET | /api/tasks | List user's tasks |
| GET | /api/tasks/{id} | Get task by ID |
| PUT | /api/tasks/{id} | Update task |
| DELETE | /api/tasks/{id} | Delete task |

## API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
backend/
├── app/
│   ├── main.py          # FastAPI application
│   ├── config.py        # Environment configuration
│   ├── database.py      # Database connection
│   ├── auth/jwt.py      # JWT verification
│   ├── models/task.py   # SQLModel Task
│   ├── schemas/task.py  # Pydantic schemas
│   └── routers/tasks.py # CRUD endpoints
├── requirements.txt
├── .env.example
└── README.md
```

For detailed setup instructions, see [quickstart.md](../specs/001-backend-core-api/quickstart.md).
