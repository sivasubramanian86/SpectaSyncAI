"""
SpectaSyncAI: Prediction Agent — @03 @05
Powered by: google-adk + Gemini 2.5 Pro
Responsibility: AI-driven surge forecasting 15–30 minutes ahead using
historical AlloyDB patterns + current telemetry trend analysis.
Provides confidence scores and specific actionable recommendations.
"""
import json
import logging
from google.adk.agents import LlmAgent
from google.adk.runners import InMemoryRunner
from google.adk.sessions import InMemorySessionService
from google.genai import types as genai_types

logger = logging.getLogger(__name__)


def get_historical_surge_data(location_id: str, window_minutes: int = 60) -> dict:
    """
    Retrieves historical surge data for a venue zone over a time window.
    Production: queries AlloyDB time-series crowd_densities table.

    Args:
        location_id: The venue zone identifier.
        window_minutes: Historical window to analyze (default 60 mins).

    Returns:
        dict: Historical surge patterns and peak times.
    """
    # Prototype: returns realistic mock surge data
    return {
        "location_id": location_id,
        "window_minutes": window_minutes,
        "historical_surges": [
            {"time_offset_mins": -55, "density": 0.45},
            {"time_offset_mins": -45, "density": 0.52},
            {"time_offset_mins": -35, "density": 0.61},
            {"time_offset_mins": -25, "density": 0.74},
            {"time_offset_mins": -15, "density": 0.83},
            {"time_offset_mins": -5, "density": 0.88},
            {"time_offset_mins": 0, "density": 0.91},
        ],
        "known_peak_triggers": [
            "halftime_break",
            "pre_match_entry",
            "post_match_exit",
        ],
        "avg_buildup_rate_per_min": 0.018,
    }


def calculate_surge_trajectory(current_density: float, buildup_rate: float) -> dict:
    """
    Projects crowd density forward for 10, 20 and 30 minute windows.

    Args:
        current_density: Current density score (0.0–1.0).
        buildup_rate: Rate of density increase per minute.

    Returns:
        dict: Projected density at T+10, T+20, T+30 with alert levels.
    """
    def classify(d: float) -> str:
        if d >= 0.90:
            return "CRITICAL"
        if d >= 0.75:
            return "HIGH"
        if d >= 0.55:
            return "MODERATE"
        return "NORMAL"

    t10 = min(current_density + buildup_rate * 10, 1.0)
    t20 = min(current_density + buildup_rate * 20, 1.0)
    t30 = min(current_density + buildup_rate * 30, 1.0)

    return {
        "T+10_mins": {"density": round(t10, 3), "level": classify(t10)},
        "T+20_mins": {"density": round(t20, 3), "level": classify(t20)},
        "T+30_mins": {"density": round(t30, 3), "level": classify(t30)},
        "peak_expected_at_mins": round((0.9 - current_density) / buildup_rate, 1)
        if buildup_rate > 0 else None,
    }


def build_prediction_agent() -> LlmAgent:
    """
    Constructs the ADK Prediction Agent using Gemini 2.5 Pro.
    Specialized for temporal pattern analysis and surge forecasting.

    Returns:
        LlmAgent: Configured prediction agent.
    """
    return LlmAgent(
        model="gemini-2.5-pro-preview-03-25",
        name="prediction_agent",
        description=(
            "Analyzes crowd density trends and historical surge patterns to "
            "forecast crowd surges 10–30 minutes in advance with confidence "
            "scores and specific actionable interventions."
        ),
        instruction=(
            "You are the SpectaSyncAI Prediction Agent — a proactive surge forecaster. "
            "Given current density telemetry and historical surge data, you must:\n"
            "1. Call get_historical_surge_data() to retrieve historical patterns.\n"
            "2. Call calculate_surge_trajectory() with the current density and buildup rate.\n"
            "3. Synthesize a forecast with: predicted_peak_time, confidence_score (0-100), "
            "surge_level (NORMAL/MODERATE/HIGH/CRITICAL), and 3 specific actionable_recommendations.\n"
            "Always return a valid JSON object matching this schema:\n"
            '{"location_id": str, "current_density": float, "predicted_peak_time_mins": int, '
            '"confidence_score": int, "surge_level": str, "forecast": dict, '
            '"actionable_recommendations": list[str]}'
        ),
        tools=[get_historical_surge_data, calculate_surge_trajectory],
    )


async def run_surge_prediction(location_id: str, current_density: float) -> dict:
    """
    Executes the Prediction Agent for a given venue zone.

    Args:
        location_id: Venue zone identifier.
        current_density: Current crowd density score (0.0–1.0).

    Returns:
        dict: Surge forecast with confidence and recommendations.
    """
    agent = build_prediction_agent()
    session_service = InMemorySessionService()
    runner = InMemoryRunner(agent=agent, session_service=session_service)

    session = await session_service.create_session(
        app_name="spectasync_prediction", user_id="system"
    )

    prompt = (
        f"Analyze and forecast crowd surge for venue zone '{location_id}'. "
        f"Current density score is {current_density}. "
        "Retrieve historical data, calculate trajectory, and provide the full forecast JSON."
    )

    result_text = ""
    async for event in runner.run_async(
        user_id="system",
        session_id=session.id,
        new_message=genai_types.Content(
            role="user",
            parts=[genai_types.Part(text=prompt)],
        ),
    ):
        if event.is_final_response() and event.content:
            for part in event.content.parts:
                if part.text:
                    result_text += part.text

    logger.info(f"[PredictionAgent] Forecast for {location_id}: {result_text}")

    try:
        # Strip markdown code fences if present
        clean = result_text.strip().lstrip("```json").rstrip("```").strip()
        return json.loads(clean)
    except json.JSONDecodeError:
        # Fallback structured response using tool calculations
        trajectory = calculate_surge_trajectory(current_density, 0.018)
        return {
            "location_id": location_id,
            "current_density": current_density,
            "predicted_peak_time_mins": int(trajectory.get("peak_expected_at_mins") or 20),
            "confidence_score": 72,
            "surge_level": trajectory["T+20_mins"]["level"],
            "forecast": trajectory,
            "actionable_recommendations": [
                f"Pre-position 2 staff at {location_id} within 10 minutes.",
                "Update digital signage to redirect flow via alternate route.",
                "Alert Gate Supervisor for auxiliary gate pre-authorization.",
            ],
            "raw_response": result_text,
        }
