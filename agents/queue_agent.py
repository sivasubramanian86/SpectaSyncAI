"""
SpectaSyncAI: Queue Agent — @03 @05
Powered by: google-adk + Gemini 2.5 Flash
Responsibility: Real-time wait time estimation across all venue service points
(entry gates, food concessions, restrooms, merchandise stands).
Surfaces per-zone wait times for the Command Center dashboard.
"""
import json
import logging
from google.adk.agents import LlmAgent
from google.adk.runners import InMemoryRunner
from google.adk.sessions import InMemorySessionService
from google.genai import types as genai_types

logger = logging.getLogger(__name__)

# Venue service point registry (production: loaded from AlloyDB venue config)
VENUE_ZONES = {
    "GATE_NORTH": {"capacity": 500, "staff_count": 4, "service_rate_per_min": 45},
    "GATE_SOUTH": {"capacity": 500, "staff_count": 3, "service_rate_per_min": 36},
    "GATE_EAST": {"capacity": 300, "staff_count": 2, "service_rate_per_min": 24},
    "GATE_WEST": {"capacity": 300, "staff_count": 2, "service_rate_per_min": 24},
    "FOOD_STAND_A": {"capacity": 80, "staff_count": 3, "service_rate_per_min": 12},
    "FOOD_STAND_B": {"capacity": 80, "staff_count": 2, "service_rate_per_min": 8},
    "FOOD_STAND_C": {"capacity": 60, "staff_count": 2, "service_rate_per_min": 8},
    "RESTROOM_NORTH": {"capacity": 40, "staff_count": 0, "service_rate_per_min": 20},
    "RESTROOM_SOUTH": {"capacity": 40, "staff_count": 0, "service_rate_per_min": 20},
    "MERCH_STAND": {"capacity": 100, "staff_count": 4, "service_rate_per_min": 6},
}


def get_zone_queue_snapshot(zone_id: str) -> dict:
    """
    Retrieves current queue length and density snapshot for a venue zone.
    Production: queries IoT sensor API or POS transaction rate.

    Args:
        zone_id: The venue service zone identifier.

    Returns:
        dict: Queue snapshot including queue_length, density_ratio, and zone config.
    """
    import random
    config = VENUE_ZONES.get(zone_id, {"capacity": 100, "staff_count": 2, "service_rate_per_min": 10})
    queue_length = random.randint(5, int(config["capacity"] * 0.9))
    return {
        "zone_id": zone_id,
        "queue_length": queue_length,
        "density_ratio": round(queue_length / config["capacity"], 2),
        "staff_count": config["staff_count"],
        "service_rate_per_min": config["service_rate_per_min"],
        "capacity": config["capacity"],
    }


def calculate_wait_time(queue_length: int, service_rate_per_min: int) -> dict:
    """
    Calculates estimated wait time using M/D/1 queuing model.

    Args:
        queue_length: Number of people currently in queue.
        service_rate_per_min: Number of people served per minute.

    Returns:
        dict: Estimated wait time and priority level.
    """
    if service_rate_per_min <= 0:
        wait_mins = 99
    else:
        wait_mins = round(queue_length / service_rate_per_min, 1)

    if wait_mins >= 20:
        priority = "CRITICAL"
    elif wait_mins >= 12:
        priority = "HIGH"
    elif wait_mins >= 6:
        priority = "MODERATE"
    else:
        priority = "NORMAL"

    return {
        "estimated_wait_mins": wait_mins,
        "priority": priority,
        "recommendation": (
            "Immediate additional staff required" if priority == "CRITICAL"
            else "Monitor closely" if priority == "HIGH"
            else "No action needed"
        ),
    }


def build_queue_agent() -> LlmAgent:
    """
    Constructs the ADK Queue Agent using Gemini 2.5 Flash (high-speed).

    Returns:
        LlmAgent: Configured queue monitoring agent.
    """
    return LlmAgent(
        model="gemini-2.5-flash-preview-04-17",
        name="queue_agent",
        description=(
            "Monitors all venue service points in real-time, estimates wait times "
            "using queuing theory, and surfaces actionable staffing recommendations."
        ),
        instruction=(
            "You are the SpectaSyncAI Queue Agent. For each service zone provided:\n"
            "1. Call get_zone_queue_snapshot(zone_id) for current queue data.\n"
            "2. Call calculate_wait_time(queue_length, service_rate_per_min) for ETA.\n"
            "3. Return a JSON array of zone wait time objects. "
            "Each object must have: zone_id, estimated_wait_mins, priority, queue_length, recommendation.\n"
            "Prioritize CRITICAL zones first in your output."
        ),
        tools=[get_zone_queue_snapshot, calculate_wait_time],
    )


async def run_queue_analysis(zone_ids: list[str] | None = None) -> list[dict]:
    """
    Runs the Queue Agent across all venue zones or a subset.

    Args:
        zone_ids: Optional list of zone IDs to analyze. Defaults to all zones.

    Returns:
        list[dict]: Wait time analysis per zone sorted by priority.
    """
    targets = zone_ids or list(VENUE_ZONES.keys())
    agent = build_queue_agent()
    session_service = InMemorySessionService()
    runner = InMemoryRunner(agent=agent, session_service=session_service)

    session = await session_service.create_session(
        app_name="spectasync_queue", user_id="system"
    )

    zone_list = ", ".join(targets)
    prompt = (
        f"Analyze the current queue situation for these venue zones: {zone_list}. "
        "For each zone, get the queue snapshot and calculate wait time. "
        "Return all results as a valid JSON array."
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

    logger.info(f"[QueueAgent] Analysis complete for {len(targets)} zones.")

    try:
        clean = result_text.strip().lstrip("```json").rstrip("```").strip()
        return json.loads(clean)
    except json.JSONDecodeError:
        # Fallback: compute directly using tools
        results = []
        for zone_id in targets:
            snapshot = get_zone_queue_snapshot(zone_id)
            wait = calculate_wait_time(snapshot["queue_length"], snapshot["service_rate_per_min"])
            results.append({
                "zone_id": zone_id,
                "queue_length": snapshot["queue_length"],
                "estimated_wait_mins": wait["estimated_wait_mins"],
                "priority": wait["priority"],
                "recommendation": wait["recommendation"],
            })
        return sorted(results, key=lambda x: x["estimated_wait_mins"], reverse=True)
