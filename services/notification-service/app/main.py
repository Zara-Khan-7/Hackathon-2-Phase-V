"""
Notification Service - FastAPI application.

US3: Consumes reminders topic and logs notification details.
Future: Will send actual notifications (email, push, etc.)

Dapr Integration:
- Subscribes to reminders topic via /api/v1/handle-reminder
- Uses Dapr state store for idempotency
"""

import logging
import os
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Dict, Any

from fastapi import FastAPI, Request, HTTPException, status
from fastapi.responses import JSONResponse

from app.handlers.reminder import handle_reminder_event, ReminderEventPayload

# Configure logging
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - startup and shutdown."""
    logger.info("[NOTIFICATION_SERVICE] Starting up...")
    yield
    logger.info("[NOTIFICATION_SERVICE] Shutting down...")


# Create FastAPI application
app = FastAPI(
    title="Notification Service",
    description="Consumes reminder events and sends notifications (stubbed).",
    version="1.0.0",
    lifespan=lifespan,
)


# ==================== Health Endpoints ====================


@app.get("/health", tags=["System"])
def health_check() -> Dict[str, Any]:
    """
    Health check endpoint.

    Returns basic service status.
    """
    return {
        "status": "healthy",
        "service": "notification-service",
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


@app.get("/ready", tags=["System"])
def readiness_check() -> Dict[str, Any]:
    """
    Readiness check endpoint.

    Returns ready status for Kubernetes probes.
    """
    return {
        "status": "ready",
        "service": "notification-service",
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


# ==================== Dapr Subscription Endpoints ====================


@app.get("/dapr/subscribe")
async def get_subscriptions() -> list:
    """
    Dapr subscription discovery endpoint.

    Tells Dapr sidecar which topics this service subscribes to.
    """
    return [
        {
            "pubsubname": os.getenv("DAPR_PUBSUB_NAME", "pubsub"),
            "topic": "reminders",
            "route": "/api/v1/handle-reminder",
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


@app.post("/api/v1/handle-reminder", tags=["Events"])
async def handle_reminder(request: Request) -> Dict[str, Any]:
    """
    Handle reminder events from Dapr Pub/Sub.

    US3: Receives reminder.scheduled and reminder.triggered events
    and logs notification details (stubbed for future implementation).

    The endpoint must return 2xx to acknowledge the message.
    - 200: Message processed successfully
    - 204: Message dropped (duplicate via idempotency check)
    - 4xx: Non-retryable error (message will be dead-lettered)
    - 5xx: Retryable error (Dapr will retry)
    """
    try:
        # Parse CloudEvents envelope
        body = await request.json()

        logger.info(
            "[REMINDER_RECEIVED] event_id=%s type=%s",
            body.get("event_id", "unknown"),
            body.get("event_type", "unknown"),
        )

        # Extract and validate payload
        payload_data = body.get("payload", {})
        event_payload = ReminderEventPayload(
            event_id=body.get("event_id"),
            event_type=body.get("event_type"),
            timestamp=body.get("timestamp"),
            user_id=body.get("user_id"),
            task_id=payload_data.get("task_id"),
            task_title=payload_data.get("task_title"),
            due_at=payload_data.get("due_at"),
            remind_at=payload_data.get("remind_at"),
        )

        # Handle the event
        result = await handle_reminder_event(event_payload)

        if result["status"] == "duplicate":
            # Return 204 for duplicates (processed but no content)
            return JSONResponse(
                status_code=status.HTTP_204_NO_CONTENT,
                content=None,
            )

        return result

    except Exception as e:
        logger.error(
            "[REMINDER_ERROR] error=%s",
            str(e),
        )
        # Return 500 for retryable errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )
