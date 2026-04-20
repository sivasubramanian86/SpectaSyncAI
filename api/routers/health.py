"""Health check router."""

from fastapi import APIRouter

router = APIRouter()


@router.get(
    "/health",
    summary="Service health check",
    response_description="Basic health payload",
)
async def health_check() -> dict[str, str]:
    """Execute a system health check.

    Returns:
    -------
        dict[str, str]: Structured status, service identity mask, and semantic version.

    """
    return {"status": "healthy", "service": "SpectaSyncAI", "version": "1.0.0"}
