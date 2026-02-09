"""
Dapr HTTP Client Wrapper.

Provides a simple interface for Dapr building blocks:
- Pub/Sub: Publish events to topics
- State: Get/Set state
- Secrets: Retrieve secrets
- Service Invocation: Call other services
- Jobs: Schedule one-time jobs (v1.12+)
"""

import logging
import os
from typing import Any, Dict, Optional
from uuid import uuid4
from datetime import datetime

import httpx

logger = logging.getLogger(__name__)

DAPR_HTTP_PORT = os.getenv("DAPR_HTTP_PORT", "3500")


class DaprClient:
    """
    HTTP client for Dapr sidecar communication.

    All methods are async and handle retries internally.
    """

    def __init__(self, dapr_port: str = DAPR_HTTP_PORT):
        self.base_url = f"http://localhost:{dapr_port}"
        self.timeout = httpx.Timeout(10.0, connect=5.0)

    # ==================== Pub/Sub ====================

    async def publish_event(
        self,
        pubsub_name: str,
        topic: str,
        data: Dict[str, Any],
        metadata: Optional[Dict[str, str]] = None
    ) -> bool:
        """
        Publish an event to a Dapr Pub/Sub topic.

        Args:
            pubsub_name: Name of the Pub/Sub component (e.g., "pubsub")
            topic: Topic name (e.g., "task-events")
            data: Event payload (will be JSON serialized)
            metadata: Optional CloudEvents metadata

        Returns:
            True if published successfully, False on error
        """
        url = f"{self.base_url}/v1.0/publish/{pubsub_name}/{topic}"

        # Add CloudEvents metadata if not present
        if "id" not in data:
            data["id"] = str(uuid4())
        if "timestamp" not in data:
            data["timestamp"] = datetime.utcnow().isoformat() + "Z"

        headers = {"Content-Type": "application/json"}
        if metadata:
            for key, value in metadata.items():
                headers[f"cloudevents-{key}"] = value

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url, json=data, headers=headers)

                if response.status_code in (200, 201, 204):
                    logger.info(f"Published to {topic}: {data.get('event_type', 'unknown')}")
                    return True
                else:
                    logger.error(f"Publish failed: {response.status_code} - {response.text}")
                    return False

        except httpx.RequestError as e:
            logger.error(f"Publish error to {topic}: {e}")
            return False

    # ==================== State Management ====================

    async def get_state(
        self,
        store_name: str,
        key: str
    ) -> Optional[Any]:
        """
        Get state from Dapr state store.

        Args:
            store_name: Name of the state store component
            key: State key

        Returns:
            State value or None if not found
        """
        url = f"{self.base_url}/v1.0/state/{store_name}/{key}"

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url)

                if response.status_code == 200:
                    return response.json() if response.text else None
                return None

        except httpx.RequestError as e:
            logger.error(f"Get state error for {key}: {e}")
            return None

    async def save_state(
        self,
        store_name: str,
        key: str,
        value: Any,
        ttl_seconds: Optional[int] = None
    ) -> bool:
        """
        Save state to Dapr state store.

        Args:
            store_name: Name of the state store component
            key: State key
            value: State value (will be JSON serialized)
            ttl_seconds: Optional TTL for the state entry

        Returns:
            True if saved successfully
        """
        url = f"{self.base_url}/v1.0/state/{store_name}"

        state_entry = [{"key": key, "value": value}]
        if ttl_seconds:
            state_entry[0]["metadata"] = {"ttlInSeconds": str(ttl_seconds)}

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url, json=state_entry)
                return response.status_code in (200, 201, 204)

        except httpx.RequestError as e:
            logger.error(f"Save state error for {key}: {e}")
            return False

    # ==================== Service Invocation ====================

    async def invoke_service(
        self,
        app_id: str,
        method: str,
        data: Optional[Dict[str, Any]] = None,
        http_method: str = "POST"
    ) -> Optional[Dict[str, Any]]:
        """
        Invoke another service via Dapr service invocation.

        Args:
            app_id: Target service app ID
            method: Method/endpoint to call
            data: Request body (for POST/PUT)
            http_method: HTTP method (GET, POST, PUT, DELETE)

        Returns:
            Response data or None on error
        """
        url = f"{self.base_url}/v1.0/invoke/{app_id}/method/{method}"

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                if http_method.upper() == "GET":
                    response = await client.get(url)
                elif http_method.upper() == "DELETE":
                    response = await client.delete(url)
                else:
                    response = await client.request(
                        http_method.upper(),
                        url,
                        json=data
                    )

                if response.status_code in (200, 201):
                    return response.json() if response.text else {}
                else:
                    logger.error(f"Service invoke failed: {response.status_code}")
                    return None

        except httpx.RequestError as e:
            logger.error(f"Service invoke error to {app_id}/{method}: {e}")
            return None

    # ==================== Secrets ====================

    async def get_secret(
        self,
        store_name: str,
        secret_name: str,
        metadata: Optional[Dict[str, str]] = None
    ) -> Optional[Dict[str, str]]:
        """
        Get secret from Dapr secrets store.

        Args:
            store_name: Name of the secrets store component
            secret_name: Secret key name
            metadata: Optional metadata for secret retrieval

        Returns:
            Secret values dict or None if not found
        """
        url = f"{self.base_url}/v1.0/secrets/{store_name}/{secret_name}"

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, params=metadata)

                if response.status_code == 200:
                    return response.json()
                return None

        except httpx.RequestError as e:
            logger.error(f"Get secret error for {secret_name}: {e}")
            return None

    # ==================== Jobs API (v1.12+) ====================

    async def schedule_job(
        self,
        job_name: str,
        schedule_time: datetime,
        data: Dict[str, Any],
        callback_url: str = "/api/v1/jobs/reminder-callback"
    ) -> bool:
        """
        Schedule a one-time job using Dapr Jobs API.

        Args:
            job_name: Unique job identifier
            schedule_time: When to execute the job (UTC)
            data: Data to pass to the callback
            callback_url: Endpoint to call when job fires

        Returns:
            True if scheduled successfully
        """
        url = f"{self.base_url}/v1.0-alpha1/jobs/{job_name}"

        job_spec = {
            "schedule": f"@at {schedule_time.isoformat()}Z",
            "data": data,
            "callback": {
                "method": callback_url
            }
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url, json=job_spec)

                if response.status_code in (200, 201, 204):
                    logger.info(f"Scheduled job {job_name} for {schedule_time}")
                    return True
                else:
                    logger.error(f"Schedule job failed: {response.status_code}")
                    return False

        except httpx.RequestError as e:
            logger.error(f"Schedule job error for {job_name}: {e}")
            return False

    async def cancel_job(self, job_name: str) -> bool:
        """
        Cancel a scheduled job.

        Args:
            job_name: Job identifier to cancel

        Returns:
            True if cancelled successfully
        """
        url = f"{self.base_url}/v1.0-alpha1/jobs/{job_name}"

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.delete(url)

                if response.status_code in (200, 204, 404):
                    logger.info(f"Cancelled job {job_name}")
                    return True
                return False

        except httpx.RequestError as e:
            logger.error(f"Cancel job error for {job_name}: {e}")
            return False


# Singleton instance for convenience
dapr_client = DaprClient()
