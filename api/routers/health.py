"""Health check router."""
from fastapi import APIRouter

router = APIRouter()


@router.get("/health", summary="Service health check")
async def health_check() -> dict:
    """Returns service health status and version."""
    return {"status": "healthy", "service": "SpectaSyncAI", "version": "1.0.0"}
