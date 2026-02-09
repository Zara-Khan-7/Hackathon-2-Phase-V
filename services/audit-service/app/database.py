"""
Database connection for Audit Service.

US5: Connects to PostgreSQL for storing audit log entries.
"""

import os
import logging
from typing import Generator

from sqlmodel import SQLModel, Session, create_engine

logger = logging.getLogger(__name__)

# Database URL from environment
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/audit_db"
)

# Create engine
engine = create_engine(
    DATABASE_URL,
    echo=os.getenv("SQL_ECHO", "false").lower() == "true",
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10,
)


def create_db_and_tables():
    """Create database tables if they don't exist."""
    from app.models.audit_log import AuditLogEntry  # noqa: F401
    SQLModel.metadata.create_all(engine)
    logger.info("[DATABASE] Tables created/verified")


def get_session() -> Generator[Session, None, None]:
    """Get database session for dependency injection."""
    with Session(engine) as session:
        yield session
