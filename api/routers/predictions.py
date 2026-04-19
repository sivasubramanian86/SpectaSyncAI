"""Predictions router - triggers surge forecasting via Prediction Agent."""

import logging
from fastapi import APIRouter
from pydantic import BaseModel, Field
from agents.prediction_agent import run_surge_prediction

logger = logging.getLogger(__name__)
router = APIRouter()


class PredictionRequest(BaseModel):
    """Payload for requesting localized surge congestion predictions."""

    location_id: str = Field(..., json_schema_extra={"example": "GATE_NORTH"})
    current_density: float = Field(
        ..., ge=0.0, le=1.0, json_schema_extra={"example": 0.74}
    )


@router.post("/predictions/surge", summary="Run AI surge prediction for a venue zone")
async def predict_surge(payload: PredictionRequest) -> dict:
    """Invokes Prediction Agent (Gemini 2.5 Pro) to forecast surge."""
    try:
        return await run_surge_prediction(payload.location_id, payload.current_density)
    except Exception as exc:  # pragma: no cover
        logger.error(f"Prediction failure: {exc}")
        # Fallback to realistic demo data to ensure dashboard stability
        from agents.prediction_agent import calculate_surge_trajectory

        trajectory = calculate_surge_trajectory(payload.current_density, 0.018)
        return {
            "location_id": payload.location_id,
            "current_density": payload.current_density,
            "predicted_peak_time_mins": 25,
            "confidence_score": 68,
            "surge_level": trajectory["T+20_mins"]["level"],
            "forecast": trajectory,
            "actionable_recommendations": [
                f"Pre-position 2 staff at {payload.location_id} within 10 minutes.",
                "Update digital signage to redirect flow via alternate route.",
                "Alert Gate Supervisor for auxiliary gate pre-authorization.",
            ],
            "is_fallback": True,
        }


@router.get("/predictions/surge/{location_id}", summary="Quick surge forecast via GET")
async def predict_surge_get(location_id: str, density: float = 0.70) -> dict:
    """Convenience GET endpoint for dashboard polling."""
    try:
        return await run_surge_prediction(location_id, density)
    except Exception as exc:  # pragma: no cover
        logger.error(f"Prediction failure: {exc}")
        return {
            "location_id": location_id,
            "current_density": density,
            "predicted_peak_time_mins": 20,
            "confidence_score": 75,
            "surge_level": "MODERATE" if density < 0.8 else "HIGH",
            "actionable_recommendations": [f"Increase monitoring at {location_id}."],
            "is_fallback": True,
        }
