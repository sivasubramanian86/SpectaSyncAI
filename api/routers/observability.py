"""Observability router for runtime visibility into Google Cloud integration."""

from typing import Any

from fastapi import APIRouter

from api.services.observability_service import observability_service

router = APIRouter()


@router.get(
    "/observability/status",
    summary="Runtime observability status",
    response_description="A structured JSON detailing active diagnostic connections.",
)
async def observability_status() -> dict[str, Any]:
    """Retrieve the global runtime observability metadata.

    Returns:
    -------
        dict[str, Any]: Mapping of active configuration blocks.

    """
    return {
        "cloud_monitoring": observability_service.status(),
        "cloud_logging": {
            "enabled": True,
            "project_id": observability_service.project_id,
            "service_name": observability_service.service_name,
        },
    }
