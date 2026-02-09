"""
Recurring Task Service - FastAPI application.

US4: Consumes task.completed events and creates next occurrence for recurring tasks.

Dapr Integration:
- Subscribes to task-events topic (filtered to task.completed)
- Uses Dapr service invocation to create tasks via chat-api
- Uses Dapr state store for idempotency
"""

import logging
import os
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Dict, Any

from fastapi import FastAPI, Request, HTTPException, status
from fastapi.responses import JSONResponse

from app.handlers.task_completed import (
    handle_task_completed_event,
    TaskCompletedPayload,
)

# Configure logging
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - startup and shutdown."""
    logger.info("[RECURRING_TASK_SERVICE] Starting up...")
    yield
    logger.info("[RECURRING_TASK_SERVICE] Shutting down...")


# Create FastAPI application
app = FastAPI(
    title="Recurring Task Service",
    description="Consumes task.completed events and creates next occurrence for recurring tasks.",
    version="1.0.0",
    lifespan=lifespan,
)


# ==================== Health Endpoints ====================


@app.get("/health", tags=["System"])
def health_check() -> Dict[str, Any]:
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "recurring-task-service",
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


@app.get("/ready", tags=["System"])
def readiness_check() -> Dict[str, Any]:
    """Readiness check endpoint for Kubernetes probes."""
    return {
        "status": "ready",
        "service": "recurring-task-service",
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


# ==================== Dapr Subscription Endpoints ====================


@app.get("/dapr/subscribe")
async def get_subscriptions() -> list:
    """
    Dapr subscription discovery endpoint.

    Subscribes to task-events topic with routing rules:
    - task.completed -> /api/v1/handle-completed
    - other events -> /api/v1/ignore (acknowledge but don't process)
    """
    return [
        {
            "pubsubname": os.getenv("DAPR_PUBSUB_NAME", "pubsub"),
            "topic": "task-events",
            "routes": {
                "rules": [
                    {
                        "match": "event.type == 'task.completed'",
                        "path": "/api/v1/handle-completed",
                    },
                ],
                "default": "/api/v1/ignore",
            },
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


@app.post("/api/v1/handle-completed", tags=["Events"])
async def handle_completed(request: Request) -> Dict[str, Any]:
    """
    Handle task.completed events from Dapr Pub/Sub.

    US4: When a recurring task is completed:
    1. Check if task is recurring (is_recurring=true)
    2. Calculate next due date from recurrence_rule
    3. Create next task occurrence via Dapr service invocation
    4. Use idempotency to prevent duplicate task creation

    Returns:
        200: Task processed (next occurrence created or not recurring)
        204: Duplicate event (already processed)
        500: Retryable error
    """
    try:
        body = await request.json()

        logger.info(
            "[TASK_COMPLETED_RECEIVED] event_id=%s",
            body.get("event_id", "unknown"),
        )

        # Extract payload
        payload_data = body.get("payload", {})
        event_payload = TaskCompletedPayload(
            event_id=body.get("event_id"),
            event_type=body.get("event_type"),
            timestamp=body.get("timestamp"),
            user_id=body.get("user_id"),
            task_id=payload_data.get("id"),
            title=payload_data.get("title"),
            description=payload_data.get("description"),
            status=payload_data.get("status"),
            priority=payload_data.get("priority"),
            due_date=payload_data.get("due_date"),
            tags=payload_data.get("tags", []),
            reminder_offset_minutes=payload_data.get("reminder_offset_minutes"),
            is_recurring=payload_data.get("is_recurring", False),
            recurrence_rule=payload_data.get("recurrence_rule"),
            parent_task_id=payload_data.get("parent_task_id"),
        )

        result = await handle_task_completed_event(event_payload)

        if result["status"] == "duplicate":
            return JSONResponse(
                status_code=status.HTTP_204_NO_CONTENT,
                content=None,
            )

        return result

    except Exception as e:
        logger.error("[TASK_COMPLETED_ERROR] error=%s", str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )


@app.post("/api/v1/ignore", tags=["Events"])
async def ignore_event(request: Request) -> Dict[str, Any]:
    """
    Ignore non-completed task events.

    T048: Acknowledge events that don't need processing
    (task.created, task.updated, task.deleted).
    """
    try:
        body = await request.json()
        logger.debug(
            "[EVENT_IGNORED] event_type=%s event_id=%s",
            body.get("event_type", "unknown"),
            body.get("event_id", "unknown"),
        )
        return {"status": "ignored", "event_type": body.get("event_type")}
    except Exception:
        # Still return success to acknowledge the message
        return {"status": "ignored"}
