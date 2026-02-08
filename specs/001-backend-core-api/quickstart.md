# Quickstart: Backend Core & Data Layer

**Feature**: 001-backend-core-api
**Date**: 2026-01-09

## Prerequisites

- Python 3.11+
- Neon PostgreSQL database (provisioned)
- Better Auth JWT secret (shared)

## Setup Steps

### 1. Clone and Navigate

```bash
cd backend
```

### 2. Create Virtual Environment

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment

Create `.env` file in `backend/` directory:

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://username:password@host.neon.tech/dbname?sslmode=require

# JWT Configuration (must match Better Auth)
JWT_SECRET=your-shared-jwt-secret-here
JWT_ALGORITHM=HS256

# CORS (frontend URL)
CORS_ORIGINS=http://localhost:3000

# Optional: Debug mode
DEBUG=false
```

**Important**: The `JWT_SECRET` must be the same secret configured in Better Auth on the frontend.

### 5. Initialize Database

The database tables will be created automatically on first run, or you can run:

```bash
python -c "from app.database import init_db; init_db()"
```

### 6. Run the Server

```bash
# Development
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 7. Verify Installation

```bash
# Health check (no auth required)
curl http://localhost:8000/health

# Expected response:
# {"status": "healthy", "timestamp": "2026-01-09T12:00:00Z"}
```

## Testing the API

### Generate a Test JWT

For testing, you can generate a JWT using this Python script:

```python
from jose import jwt
from datetime import datetime, timedelta

JWT_SECRET = "your-shared-jwt-secret-here"  # Same as .env

payload = {
    "sub": "test-user-123",
    "email": "test@example.com",
    "iat": datetime.utcnow(),
    "exp": datetime.utcnow() + timedelta(hours=1)
}

token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")
print(f"Bearer {token}")
```

### API Requests

```bash
# Set your token
TOKEN="your-jwt-token-here"

# Create a task
curl -X POST http://localhost:8000/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My first task",
    "description": "Testing the API",
    "priority": "high"
  }'

# List all tasks
curl http://localhost:8000/api/tasks \
  -H "Authorization: Bearer $TOKEN"

# Get a specific task (replace {id} with actual UUID)
curl http://localhost:8000/api/tasks/{id} \
  -H "Authorization: Bearer $TOKEN"

# Update a task
curl -X PUT http://localhost:8000/api/tasks/{id} \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'

# Delete a task
curl -X DELETE http://localhost:8000/api/tasks/{id} \
  -H "Authorization: Bearer $TOKEN"
```

## API Documentation

Once the server is running, access:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

## Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_tasks.py -v
```

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry
│   ├── config.py            # Environment config
│   ├── database.py          # DB connection
│   ├── auth/
│   │   └── jwt.py           # JWT verification
│   ├── models/
│   │   └── task.py          # SQLModel Task
│   ├── schemas/
│   │   └── task.py          # Pydantic schemas
│   └── routers/
│       └── tasks.py         # CRUD endpoints
├── tests/
├── requirements.txt
├── .env                     # (create this)
└── .env.example
```

## Common Issues

### 1. Database Connection Error

```
sqlalchemy.exc.OperationalError: could not connect to server
```

**Solution**: Check `DATABASE_URL` in `.env`. Ensure Neon database is active and `sslmode=require` is included.

### 2. JWT Validation Fails

```
{"detail": "Invalid or expired token"}
```

**Solution**: Ensure `JWT_SECRET` in backend matches the secret configured in Better Auth. Check token hasn't expired.

### 3. CORS Error in Browser

```
Access to fetch has been blocked by CORS policy
```

**Solution**: Add your frontend URL to `CORS_ORIGINS` in `.env`. Multiple origins can be comma-separated.

### 4. 403 Forbidden on Task Access

```
{"detail": "Not authorized to access this resource"}
```

**Solution**: The task belongs to a different user. Tasks are isolated by `user_id` from the JWT.

## Integration with Better Auth

The backend expects JWT tokens issued by Better Auth with this structure:

```json
{
  "sub": "user-id-from-better-auth",
  "email": "user@example.com",
  "iat": 1704787200,
  "exp": 1704873600
}
```

Configure Better Auth to:
1. Use the same `JWT_SECRET` as the backend
2. Use HS256 algorithm
3. Include `sub` claim with user ID

## Next Steps

1. Deploy backend to cloud platform (Vercel, Railway, etc.)
2. Configure production `DATABASE_URL` for Neon
3. Set secure `JWT_SECRET` in production environment
4. Enable HTTPS in production
5. Proceed to frontend implementation (`/sp.specify` for frontend spec)
