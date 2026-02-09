"""
Audit Service - FastAPI application.

US5: Logs all task events to audit_log table for compliance.

Dapr Integration:
- Subscribes to task-events topic
- Uses Dapr state store for idempotency
- Stores events in PostgreSQL
"""

import logging
import os
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Dict, Any, Optional, List

from fastapi import FastAPI, Request, HTTPException, status, Depends, Query
from fastapi.responses import JSONResponse
from sqlmodel import Session

from app.database import create_db_and_tables, get_session
from app.handlers.audit_log import (
    handle_audit_event,
    query_audit_log,
    TaskEventPayload,
)
from app.models.audit_log import AuditLogEntry

# Configure logging
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - startup and shutdown."""
    logger.info("[AUDIT_SERVICE] Starting up...")
    create_db_and_tables()
    yield
    logger.info("[AUDIT_SERVICE] Shutting down...")


# Create FastAPI application
app = FastAPI(
    title="Audit Service",
    description="Logs all task events for compliance and auditing.",
    version="1.0.0",
    lifespan=lifespan,
)


# ==================== Health Endpoints ====================


@app.get("/health", tags=["System"])
def health_check() -> Dict[str, Any]:
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "audit-service",
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


@app.get("/ready", tags=["System"])
def readiness_check(session: Session = Depends(get_session)) -> Dict[str, Any]:
    """
    Readiness check endpoint for Kubernetes probes.

    Verifies database connectivity.
    """
    try:
        # Simple query to verify database connection
        session.exec(AuditLogEntry.__table__.select().limit(1))
        return {
            "status": "ready",
            "service": "audit-service",
            "database": "connected",
            "timestamp": datetime.utcnow().isoformat() + "Z",
        }
    except Exception as e:
        logger.error("[READINESS_FAILED] error=%s", str(e))
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database not available",
        )


# ==================== Dapr Subscription Endpoints ====================


@app.get("/dapr/subscribe")
async def get_subscriptions() -> list:
    """
    Dapr subscription discovery endpoint.

    Subscribes to task-events topic to audit all task operations.
    """
    return [
        {
            "pubsubname": os.getenv("DAPR_PUBSUB_NAME", "pubsub"),
            "topic": "task-events",
            "route": "/api/v1/handle-event",
            "metadata": {
                "rawPayload": "true",
            },
        }
    ]


@app.get("/dapr/config")
async def get_config() -> Dict[str, Any]:
    """Dapr configuration endpoint."""
    return {
        "entities": [],
        "drainRebalancedActors": False,
        "reentrancy": {"enabled": False},
    }


# ==================== Event Handler Endpoints ====================


@app.post("/api/v1/handle-event", tags=["Events"])
async def handle_event(
    request: Request,
    session: Session = Depends(get_session),
) -> Dict[str, Any]:
    """
    Handle task events from Dapr Pub/Sub.

    US5: Receives all task events and stores them in audit_log table.
    Supports: task.created, task.updated, task.completed, task.deleted

    Returns:
        200: Event audited successfully
        204: Duplicate event (already audited)
        500: Retryable error
    """
    try:
        body = await request.json()

        logger.info(
            "[AUDIT_RECEIVED] event_id=%s event_type=%s",
            body.get("event_id", "unknown"),
            body.get("event_type", "unknown"),
        )

        # Extract payload
        event_payload = TaskEventPayload(
            event_id=body.get("event_id"),
            event_type=body.get("event_type"),
            timestamp=body.get("timestamp"),
            user_id=body.get("user_id"),
            source=body.get("source", "chat-api"),
            payload=body.get("payload", {}),
        )

        result = await handle_audit_event(event_payload, session)

        if result["status"] == "duplicate":
            return JSONResponse(
                status_code=status.HTTP_204_NO_CONTENT,
                content=None,
            )

        return result

    except Exception as e:
        logger.error("[AUDIT_ERROR] error=%s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


# ==================== Query Endpoints ====================


@app.get("/api/v1/audit-log", tags=["Audit"], response_model=List[Dict[str, Any]])
def get_audit_log(
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    task_id: Optional[str] = Query(None, description="Filter by task ID"),
    event_type: Optional[str] = Query(None, description="Filter by event type"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum entries to return"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    session: Session = Depends(get_session),
) -> List[Dict[str, Any]]:
    """
    Query audit log entries.

    T061: Provides query endpoint for audit log retrieval.

    Returns:
        List of audit log entries matching filters
    """
    entries = query_audit_log(
        session=session,
        user_id=user_id,
        task_id=task_id,
        event_type=event_type,
        limit=limit,
        offset=offset,
    )

    return [
        {
            "id": str(entry.id),
            "event_id": entry.event_id,
            "event_type": entry.event_type,
            "timestamp": entry.timestamp.isoformat() + "Z" if entry.timestamp else None,
            "received_at": entry.received_at.isoformat() + "Z" if entry.received_at else None,
            "user_id": entry.user_id,
            "task_id": entry.task_id,
            "source": entry.source,
            "payload": entry.payload,
        }
        for entry in entries
    ]
