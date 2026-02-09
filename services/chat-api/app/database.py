"""
Database connection and session management for Neon PostgreSQL.
Uses SQLModel with connection pooling for serverless environment.
"""
from sqlmodel import SQLModel, Session, create_engine
from sqlalchemy.exc import OperationalError
from fastapi import HTTPException, status
from typing import Generator

from app.config import get_settings
# Import models to register with SQLModel metadata
from app.models import Task, Conversation, Message  # noqa: F401

# Get settings
settings = get_settings()

# Create database engine with connection pooling
engine = create_engine(
    settings.database_url,
    echo=settings.debug,  # Log SQL statements in debug mode
    pool_pre_ping=True,   # Check connection health before use
    pool_size=5,
    max_overflow=10,
)


def create_db_and_tables() -> None:
    """Create all database tables defined in SQLModel models."""
    try:
        SQLModel.metadata.create_all(engine)
    except OperationalError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection unavailable"
        ) from e


def get_session() -> Generator[Session, None, None]:
    """
    Database session dependency for FastAPI.
    Yields a session and ensures it's closed after use.
    Returns 503 if database connection fails.
    """
    try:
        with Session(engine) as session:
            yield session
    except OperationalError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection unavailable"
        ) from e
