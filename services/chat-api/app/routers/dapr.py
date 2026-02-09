"""
Dapr integration router.

Provides:
- Subscription discovery endpoint for Dapr sidecar
- Health endpoints compatible with Dapr
"""

from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter(tags=["Dapr"])


@router.get("/dapr/subscribe")
async def get_subscriptions() -> List[Dict[str, Any]]:
    """
    Dapr subscription discovery endpoint.

    Called by Dapr sidecar to discover which topics this service subscribes to.
    For the chat-api (producer), we don't subscribe to topics - we only publish.

    Returns:
        Empty list since chat-api is a producer, not consumer.
    """
    # Chat API is a producer - it publishes events but doesn't consume them
    # Consumer services (notification, recurring-task, audit) will have subscriptions
    return []


@router.get("/dapr/config")
async def get_config() -> Dict[str, Any]:
    """
    Dapr configuration endpoint.

    Returns service configuration for Dapr.
    """
    return {
        "entities": [],  # No actors used
        "drainRebalancedActors": False,
        "reentrancy": {
            "enabled": False
        }
    }
