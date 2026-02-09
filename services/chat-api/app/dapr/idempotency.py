"""
Idempotency helper for event processing.

Uses Dapr state store to track processed events and prevent duplicates.
Implements at-least-once delivery semantics with idempotent consumers.
"""

import logging
from typing import Optional
import httpx
import os

logger = logging.getLogger(__name__)

DAPR_HTTP_PORT = os.getenv("DAPR_HTTP_PORT", "3500")
DAPR_STATE_STORE = os.getenv("DAPR_STATE_STORE", "statestore")
IDEMPOTENCY_TTL_SECONDS = int(os.getenv("IDEMPOTENCY_TTL_SECONDS", "86400"))  # 24 hours


class IdempotencyChecker:
    """
    Check and mark events as processed using Dapr state store.

    Usage:
        checker = IdempotencyChecker()
        if await checker.is_processed(event_id):
            return {"status": "DUPLICATE"}

        # Process event...

        await checker.mark_processed(event_id)
    """

    def __init__(self, state_store: str = DAPR_STATE_STORE):
        self.state_store = state_store
        self.base_url = f"http://localhost:{DAPR_HTTP_PORT}"

    def _get_key(self, event_id: str) -> str:
        """Generate state store key for event."""
        return f"processed:{event_id}"

    async def is_processed(self, event_id: str) -> bool:
        """
        Check if an event has already been processed.

        Args:
            event_id: Unique event identifier

        Returns:
            True if event was already processed, False otherwise
        """
        key = self._get_key(event_id)
        url = f"{self.base_url}/v1.0/state/{self.state_store}/{key}"

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, timeout=5.0)

                if response.status_code == 200 and response.text:
                    logger.debug(f"Event {event_id} already processed")
                    return True
                return False

        except httpx.RequestError as e:
            logger.warning(f"Failed to check idempotency for {event_id}: {e}")
            # On error, assume not processed to avoid dropping events
            return False

    async def mark_processed(self, event_id: str, metadata: Optional[dict] = None) -> bool:
        """
        Mark an event as processed in state store.

        Args:
            event_id: Unique event identifier
            metadata: Optional metadata to store with the marker

        Returns:
            True if successfully marked, False on error
        """
        key = self._get_key(event_id)
        url = f"{self.base_url}/v1.0/state/{self.state_store}"

        state_entry = [{
            "key": key,
            "value": metadata or {"processed": True},
            "metadata": {
                "ttlInSeconds": str(IDEMPOTENCY_TTL_SECONDS)
            }
        }]

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    url,
                    json=state_entry,
                    timeout=5.0
                )

                if response.status_code in (200, 201, 204):
                    logger.debug(f"Marked event {event_id} as processed")
                    return True
                else:
                    logger.error(f"Failed to mark {event_id}: {response.status_code}")
                    return False

        except httpx.RequestError as e:
            logger.error(f"Failed to mark {event_id} as processed: {e}")
            return False

    async def delete_processed(self, event_id: str) -> bool:
        """
        Remove processed marker (for testing or reprocessing).

        Args:
            event_id: Unique event identifier

        Returns:
            True if successfully deleted, False on error
        """
        key = self._get_key(event_id)
        url = f"{self.base_url}/v1.0/state/{self.state_store}/{key}"

        try:
            async with httpx.AsyncClient() as client:
                response = await client.delete(url, timeout=5.0)
                return response.status_code in (200, 204)
        except httpx.RequestError as e:
            logger.error(f"Failed to delete {event_id}: {e}")
            return False
