"""
FastAPI application entry point.
Configures CORS, database initialization, and health check endpoint.
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager
from datetime import datetime

from app.config import get_settings
from app.database import create_db_and_tables
from app.routers import tasks, chat, dapr, callbacks
from app.mcp import register_all_tools

# Get settings
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - initialize database and MCP tools on startup."""
    # Startup: create database tables
    create_db_and_tables()
    # Startup: register MCP tools
    register_all_tools()
    yield
    # Shutdown: cleanup if needed
    pass


# Create FastAPI application
app = FastAPI(
    title="Todo API - Backend Core",
    description="RESTful API for managing user-owned tasks with JWT authentication.",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS middleware
# Include localhost and production origins
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://[::1]:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    # Vercel production
    "https://frontend-sepia-alpha-94.vercel.app",
    "https://todo-chatbot-app.vercel.app",
]
# Add any additional origins from settings
for origin in settings.cors_origins.split(","):
    origin = origin.strip()
    if origin and origin not in origins:
        origins.append(origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


# Register routers
app.include_router(tasks.router)
app.include_router(chat.router)
app.include_router(dapr.router)
app.include_router(callbacks.router)


# Structured error response handler for validation errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Return structured validation errors with field-level details."""
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )


@app.get("/health", tags=["System"])
def health_check():
    """
    Health check endpoint - no authentication required.
    Returns API health status.
    """
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
