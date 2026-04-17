"""
SpectaSyncAI: Pre-Event Analysis Router
Exposes strategic forecasting capabilities to the Command Hub.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from agents.pre_event_agent import run_pre_event_analysis

router = APIRouter()

# Global in-memory cache for the latest strategic analysis
_LATEST_ANALYSIS = {
    "data": None,
    "last_updated": None
}


class PreEventData(BaseModel):
    event_name: str
    total_reservations: int
    venue_capacity: int
    expected_peak_time: str
    weather_forecast: dict  # temp, precipitation, conditions
    additional_context: str | None = None


@router.get("/analysis")
async def get_latest_pre_event_analysis():
    """Retrieves the last computed strategic analysis (or triggers a default if missing)."""
    if _LATEST_ANALYSIS["data"]:
        return _LATEST_ANALYSIS["data"]

    # If no analysis yet, return the default mock scenario to avoid 404/500.
    # The mock payload is defined in the same module for UI fallback parity.
    await get_mock_pre_event()
    # We don't run a full analysis here to avoid slowing down the initial GET
    # The background task in main.py should have already populated this
    return {
        "status": "pending_or_failed",
        "message": (
            "Strategic analysis is being computed or failed to initialize. "
            "Try manual run."
        ),
        "risk_level": "UNKNOWN",
        "expected_crowd_peak": "Awaiting Analysis",
        "weather_impact": "Awaiting Analysis",
        "pro_con_summary": "N/A",
        "precautionary_measures": [],
        "strategic_recommendation": (
            "Click 'Run Strategic Analysis' to trigger agent reasoning."
        )
    }


@router.post("/analysis")
async def trigger_pre_event_analysis(data: PreEventData) -> dict:
    """Triggers the Agent 12: Pre-Event Strategic Analyst loop."""

    try:
        analysis = await run_pre_event_analysis(data.model_dump())
        if not isinstance(analysis, dict):
            analysis = {"raw_analysis": str(analysis)}

        # Update global cache
        _LATEST_ANALYSIS["data"] = analysis
        from datetime import datetime
        _LATEST_ANALYSIS["last_updated"] = datetime.now().isoformat()

        return analysis
    except Exception as e:
        import logging
        import traceback
        logging.error(f"Pre-Event Agent Error: {e}")
        logging.error(traceback.format_exc())

        fallback = {
            "risk_level": "ELEVATED (Fallback)",
            "expected_crowd_peak": f"~{data.total_reservations + 1200} (Estimated)",
            "weather_impact": "Conditions may cause clustering at gate entries.",
            "pro_con_summary": "PRO: High interest. CON: Expected peak near capacity limits.",
            "precautionary_measures": [
                "Deploy secondary steward mesh to Zone B",
                "Activate staggered entry protocols",
                "Verify backup power for real-time vision nodes"
            ],
            "strategic_recommendation": (
                f"Proceed with event {data.event_name} under Enhanced Safety "
                "Protocol V2.1. Monitor density closely."
            ),
            "is_fallback": True,
            "error_detail": str(e)
        }
        _LATEST_ANALYSIS["data"] = fallback
        return fallback


@router.get("/mock-data")
async def get_mock_pre_event():
    """Returns sample scenario data for the Pre-Event UI."""
    return {
        "event_name": "SpectaSync Grand Opening — Tech City Arena",
        "total_reservations": 142000,
        "venue_capacity": 120000,
        "expected_peak_time": "18:00 - 20:00 (Sunset/Opening Ceremony)",
        "weather_forecast": {
            "temp_c": 38,
            "condition": "Extreme Heat / Clear Sky",
            "precipitation_prob": 0.05,
            "humidity": 12
        },
        "additional_context": (
            "Regional holiday conflict detected. "
            "Public transport strike scheduled for 16:00. "
            "Wait times at Gate North expected to exceed 90 mins."
        )
    }
