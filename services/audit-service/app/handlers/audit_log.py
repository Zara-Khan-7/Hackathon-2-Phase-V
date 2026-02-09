"""
Audit log event handler with idempotency.

US5: Stores all task events to audit_log table for compliance.
"""

import logging
import os
from typing import Dict, Any, Optional
from dataclasses import dataclass
from datetime import datetime

import httpx
from sqlmodel import Session, select

from app.models.audit_log import AuditLogEntry
from app.database import get_session

logger = logging.getLogger(__name__)

# Dapr configuration
DAPR_HTTP_PORT = os.getenv("DAPR_HTTP_PORT", "3500")
DAPR_STATE_STORE = os.getenv("DAPR_STATE_STORE", "statestore")


@dataclass
class TaskEventPayload:
    """Task event payload from Pub/Sub."""
    event_id: str
    event_type: str
    timestamp: str
    user_id: str
    source: str
    payload: Dict[str, Any]


class IdempotencyChecker:
    """Idempotency checker using Dapr state store."""

    def __init__(
        self,
        store_name: str = DAPR_STATE_STORE,
        dapr_port: str = DAPR_HTTP_PORT,
        ttl_seconds: int = 86400,
    ):
        self.store_name = store_name
        self.base_url = f"http://localhost:{dapr_port}"
        self.ttl_seconds = ttl_seconds
        self.timeout = httpx.Timeout(10.0, connect=5.0)

    def _key(self, event_id: str) -> str:
        return f"audit-processed:{event_id}"

    async def is_processed(self, event_id: str) -> bool:
        key = self._key(event_id)
        url = f"{self.base_url}/v1.0/state/{self.store_name}/{key}"

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url)
                return response.status_code == 200 and response.text
        except httpx.RequestError as e:
            logger.warning("[IDEMPOTENCY_CHECK_ERROR] key=%s error=%s", key, str(e))
            return False

    async def mark_processed(self, event_id: str, audit_log_id: str) -> bool:
        key = self._key(event_id)
        url = f"{self.base_url}/v1.0/state/{self.store_name}"

        state_entry = [{
            "key": key,
            "value": {
                "event_id": event_id,
                "audit_log_id": audit_log_id,
                "processed_at": datetime.utcnow().isoformat() + "Z",
            },
            "metadata": {"ttlInSeconds": str(self.ttl_seconds)},
        }]

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url, json=state_entry)
                return response.status_code in (200, 201, 204)
        except httpx.RequestError as e:
            logger.error("[IDEMPOTENCY_MARK_ERROR] key=%s error=%s", key, str(e))
            return False


# Global idempotency checker
idempotency_checker = IdempotencyChecker()


def store_audit_entry(
    session: Session,
    payload: TaskEventPayload,
) -> AuditLogEntry:
    """
    Store audit log entry in database.

    T060: Stores event with full payload for compliance.

    Args:
        session: Database session
        payload: Task event payload

    Returns:
        Created AuditLogEntry
    """
    # Parse timestamp
    try:
        if payload.timestamp.endswith("Z"):
            timestamp = datetime.fromisoformat(payload.timestamp[:-1])
        else:
            timestamp = datetime.fromisoformat(payload.timestamp.replace("+00:00", ""))
    except ValueError:
        timestamp = datetime.utcnow()

    # Extract task_id from payload if present
    task_id = payload.payload.get("id") or payload.payload.get("task_id")

    entry = AuditLogEntry(
        event_id=payload.event_id,
        event_type=payload.event_type,
        timestamp=timestamp,
        user_id=payload.user_id,
        task_id=str(task_id) if task_id else None,
        payload=payload.payload,
        source=payload.source,
    )

    session.add(entry)
    session.commit()
    session.refresh(entry)

    logger.info(
        "[AUDIT_STORED] id=%s event_id=%s event_type=%s task_id=%s",
        entry.id,
        entry.event_id,
        entry.event_type,
        entry.task_id,
    )

    return entry


async def handle_audit_event(
    payload: TaskEventPayload,
    session: Session,
) -> Dict[str, Any]:
    """
    Handle a task event for audit logging with idempotency.

    US5: Stores all task events to database for compliance.

    Args:
        payload: The task event payload
        session: Database session

    Returns:
        Processing result dict
    """
    event_id = payload.event_id

    # Check idempotency
    if await idempotency_checker.is_processed(event_id):
        logger.info(
            "[AUDIT_DUPLICATE] event_id=%s already processed",
            event_id,
        )
        return {
            "status": "duplicate",
            "event_id": event_id,
            "message": "Event already audited",
        }

    # Store audit entry
    entry = store_audit_entry(session, payload)

    # Mark as processed
    await idempotency_checker.mark_processed(event_id, str(entry.id))

    logger.info(
        "[AUDIT_PROCESSED] event_id=%s audit_id=%s",
        event_id,
        entry.id,
    )

    return {
        "status": "success",
        "event_id": event_id,
        "audit_log_id": str(entry.id),
        "message": "Event audited successfully",
    }


def query_audit_log(
    session: Session,
    user_id: Optional[str] = None,
    task_id: Optional[str] = None,
    event_type: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
) -> list:
    """
    Query audit log entries with optional filters.

    T061: Provides query endpoint for audit log retrieval.

    Args:
        session: Database session
        user_id: Filter by user ID
        task_id: Filter by task ID
        event_type: Filter by event type
        limit: Maximum entries to return
        offset: Pagination offset

    Returns:
        List of AuditLogEntry objects
    """
    statement = select(AuditLogEntry)

    if user_id:
        statement = statement.where(AuditLogEntry.user_id == user_id)
    if task_id:
        statement = statement.where(AuditLogEntry.task_id == task_id)
    if event_type:
        statement = statement.where(AuditLogEntry.event_type == event_type)

    statement = statement.order_by(AuditLogEntry.received_at.desc())
    statement = statement.offset(offset).limit(limit)

    return session.exec(statement).all()
