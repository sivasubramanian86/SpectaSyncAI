"""Safety router - detection and risk assessment via Safety Agent."""

import logging
from fastapi import APIRouter
from pydantic import BaseModel, Field
from agents.safety_agent import run_safety_assessment

logger = logging.getLogger(__name__)
router = APIRouter()


class SafetyAssessmentRequest(BaseModel):
    """Payload for invoking real-time localized safety risk assessments."""

    location_id: str = Field(..., json_schema_extra={"example": "GATE_NORTH"})
    density_score: float = Field(..., ge=0.0, le=1.0)
    rate_of_change: float = Field(0.02, description="Density increase/min")


@router.post("/safety/assess", summary="Run safety risk assessment for a venue zone")
async def assess_safety(payload: SafetyAssessmentRequest) -> dict:
    """Invoke Safety Agent (Pro) for emergency risk classification."""
    return await run_safety_assessment(
        payload.location_id, payload.density_score, payload.rate_of_change
    )
