"""Observability router for runtime visibility into Google Cloud integration."""

from fastapi import APIRouter

from api.services.observability_service import observability_service

router = APIRouter()


@router.get(
    "/observability/status",
    summary="Runtime observability status",
    response_description="A structured JSON detailing active diagnostic connections.",
)
async def observability_status() -> dict:
    """
    Retrieves the global runtime observability constraints and diagnostic metadata.

    This endpoint surfaces live monitoring and logging configurations bridging the local
    mesh with Google Cloud Observability, essential for hackathon smoke-tests and CI verifications.

    Returns:
        dict: A dictionary mapping active configuration blocks (Cloud Monitoring, Cloud Logging)
              along with project-bound execution identifiers.
    """
    return {
        "cloud_monitoring": observability_service.status(),
        "cloud_logging": {
            "enabled": True,
            "project_id": observability_service.project_id,
            "service_name": observability_service.service_name,
        },
    }
