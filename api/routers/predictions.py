"""Predictions router — triggers surge forecasting via Prediction Agent."""
import logging
from fastapi import APIRouter
from pydantic import BaseModel, Field
from agents.prediction_agent import run_surge_prediction

logger = logging.getLogger(__name__)
router = APIRouter()


class PredictionRequest(BaseModel):
    location_id: str = Field(..., example="GATE_NORTH")
    current_density: float = Field(..., ge=0.0, le=1.0, example=0.74)


@router.post(
    "/predictions/surge",
    summary="Run AI surge prediction for a venue zone"
)
async def predict_surge(payload: PredictionRequest) -> dict:
    """Invokes Prediction Agent (Gemini 2.5 Pro) to forecast surge."""
    try:
        return await run_surge_prediction(
            payload.location_id,
            payload.current_density
        )
    except Exception as exc:
        logger.error(f"Prediction failure: {exc}")
        from fastapi import HTTPException
        raise HTTPException(
            status_code=500,
            detail="Prediction pipeline failure."
        )


@router.get(
    "/predictions/surge/{location_id}",
    summary="Quick surge forecast via GET"
)
async def predict_surge_get(location_id: str, density: float = 0.70) -> dict:
    """Convenience GET endpoint for dashboard polling."""
    try:
        return await run_surge_prediction(location_id, density)
    except Exception as exc:
        logger.error(f"Prediction failure: {exc}")
        from fastapi import HTTPException
        raise HTTPException(
            status_code=500,
            detail="Prediction pipeline failure."
        )
