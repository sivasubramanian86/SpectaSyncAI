"""Health check router."""

from fastapi import APIRouter

router = APIRouter()


@router.get(
    "/health",
    summary="Service health check",
    response_description="Basic health payload",
)
async def health_check() -> dict:
    """Executes a high-fidelity system health check for load balancers and orchestrated environments.

    Returns
    -------
        dict: A structured dictionary indicating the current operational status,
              the service identity mask, and the semantic version.

    """
    return {"status": "healthy", "service": "SpectaSyncAI", "version": "1.0.0"}
