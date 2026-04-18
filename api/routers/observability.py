"""
Observability router for runtime visibility into Google Cloud integration.
"""
from fastapi import APIRouter

from api.services.observability_service import observability_service

router = APIRouter()


@router.get(
    "/observability/status",
    summary="Runtime observability status",
)
async def observability_status() -> dict:
    """Expose monitoring/logging configuration for demos and smoke tests."""
    return {
        "cloud_monitoring": observability_service.status(),
        "cloud_logging": {
            "enabled": True,
            "project_id": observability_service.project_id,
            "service_name": observability_service.service_name,
        },
    }
