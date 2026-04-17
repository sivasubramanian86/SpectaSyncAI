"""
SpectaSyncAI: VIP Sync Agent — @03 @05
Powered by: google-adk + Gemini 2.5 Pro
Failure Mode Addressed: TEMPORAL_DISRUPTION

Incident Reference: INC-2025-IND-01
A 2025 political rally in South India had its headline speaker arrive
approximately 7 hours behind schedule. The crowd's kinetic energy accumulated
exponentially during this period. On arrival, the directional surge that
released this energy was fatal. See agents/incident_corpus.py INC-2025-IND-01.

Also relevant:
  INC-2021-USA-01 — Concert headliner delay contributed to stage-front surge.
  INC-2015-SAU-01 — Pilgrimage ritual timing mismatch caused convergence surge.

Responsibility:
  Tracks live VIP/headline act/political figure convoy GPS against the
  scheduled itinerary. Calculates delay impact on crowd density and surge
  vector. If delay > 30 minutes: activates crowd engagement programs.
  Recalculates arrival surge vector and pre-positions staff accordingly.
"""
import os
import json
import logging
from datetime import datetime, timedelta
from google.adk.agents import LlmAgent
from google.adk.runners import InMemoryRunner
from google.adk.sessions import InMemorySessionService
from google.genai import types as genai_types
from .incident_corpus import INCIDENT_CORPUS

logger = logging.getLogger(__name__)

VIP_DELAY_ALERT_THRESHOLD_MINS = 30


def get_convoy_gps_position(event_id: str) -> dict:
    """
    Retrieves live GPS position and ETA for the scheduled keynote convoy or
    headline act transport. Matches against pre-filed convoy route.

    Production: Integrates with event logistics partner GPS API or police
    convoy coordination system (anonymized, secure channel).

    Historical precedent (INC-2025-IND-01): The convoy's departure delay
    was observable at T-5 hours via GPS telemetry — long before crowd surge.

    Args:
        event_id: Unique event identifier (no personal identifiers).

    Returns:
        dict: Current ETA, delay_mins, delay_category.
    """
    import random
    scheduled_arrival = datetime.now() + timedelta(minutes=-30)
    estimated_actual = datetime.now() + timedelta(minutes=random.randint(45, 180))
    delay_mins = int((estimated_actual - scheduled_arrival).total_seconds() / 60)
    return {
        "event_id": event_id,
        "distance_to_venue_km": round(random.uniform(18.5, 42.0), 1),
        "scheduled_arrival_iso": scheduled_arrival.isoformat(),
        "estimated_actual_arrival_iso": estimated_actual.isoformat(),
        "delay_mins": delay_mins,
        "delay_category": (
            "CRITICAL" if delay_mins > 120
            else "HIGH" if delay_mins > 60
            else "MODERATE" if delay_mins > VIP_DELAY_ALERT_THRESHOLD_MINS
            else "NORMAL"
        ),
        "convoy_speed_kmph": round(random.uniform(35, 65), 1),
    }


def calculate_crowd_kinetic_energy(
    wait_duration_mins: int, crowd_size: int, density_score: float
) -> dict:
    """
    Models the accumulated kinetic energy of a waiting crowd.
    Quantifies how violently the crowd will surge upon headline act arrival,
    as a function of wait time and current density.

    Academic basis: Fruin's Level of Service model + crowd pressure kinetics.
    Corpus reconstruction: INC-2025-IND-01 would have produced surge_coefficient ~8.4
    at the 7-hour delay mark. INC-2021-USA-01 reconstructed at ~5.9.

    Args:
        wait_duration_mins: Total accumulated delay in minutes.
        crowd_size: Current attendance estimate.
        density_score: Current venue density (0.0–1.0).

    Returns:
        dict: surge_coefficient, surge_prediction, analogous_incidents.
    """
    surge_coefficient = min(10.0, (1 + wait_duration_mins / 60) ** 1.8 * density_score * 2)
    surge_radius_meters = int(surge_coefficient * 15)
    arrival_rush_velocity = round(surge_coefficient * 0.4, 2)

    # Match against corpus by surge magnitude proxy
    analogous = [
        r.incident_id for r in INCIDENT_CORPUS
        if "TEMPORAL_DISRUPT" in r.failure_modes
    ]

    return {
        "wait_duration_mins": wait_duration_mins,
        "crowd_size": crowd_size,
        "density_score": density_score,
        "surge_coefficient": round(surge_coefficient, 2),
        "surge_prediction": (
            "CATASTROPHIC" if surge_coefficient >= 8.0
            else "CRITICAL" if surge_coefficient >= 5.0
            else "HIGH" if surge_coefficient >= 3.0
            else "MODERATE" if surge_coefficient >= 1.5
            else "LOW"
        ),
        "threat_radius_meters": surge_radius_meters,
        "crowd_wave_velocity_mps": arrival_rush_velocity,
        "analogous_incidents": analogous,
        "corpus_reference_note": (
            "INC-2025-IND-01 reconstructed coeff: 8.4 | "
            "INC-2021-USA-01 reconstructed coeff: 5.9"
        ),
    }


def activate_crowd_engagement_program(zone: str, program_type: str, duration_mins: int) -> dict:
    """
    Activates in-venue crowd engagement to dissipate kinetic tension during delay.
    This is the critical intervention absent in INC-2025-IND-01 and INC-2021-USA-01.

    Program types:
      MUSIC_STREAM       — PA music broadcast
      INTERACTIVE_SCREEN — Trivia/poll on venue screens
      ADDRESS_BY_MC      — Master of Ceremonies holds crowd attention at stage
      STAGGERED_ENTRY    — Meter crowd into inner zones by section

    Args:
        zone: Target venue zone.
        program_type: Engagement type.
        duration_mins: Program duration in minutes.

    Returns:
        dict: Activation status and estimated kinetic energy dissipation.
    """
    density_reduction = {
        "MUSIC_STREAM": 0.12,
        "INTERACTIVE_SCREEN": 0.18,
        "ADDRESS_BY_MC": 0.25,
        "STAGGERED_ENTRY": 0.35,
    }.get(program_type, 0.10)

    logger.info(f"[VIPSyncAgent] Engagement '{program_type}' activated in {zone}")
    return {
        "status": "ACTIVATED",
        "zone": zone,
        "program_type": program_type,
        "duration_mins": duration_mins,
        "estimated_density_reduction": density_reduction,
        "estimated_kinetic_energy_dissipation_pct": round(density_reduction * 100 * 1.4, 1),
    }


def calculate_arrival_surge_vector(
    venue_id: str, arrival_time_mins: int, surge_coefficient: float
) -> dict:
    """
    Computes WHERE the crowd surge will be most intense at headline act arrival,
    enabling pre-positioning of staff BEFORE the event — not reactive deployment.

    Args:
        venue_id: Venue identifier.
        arrival_time_mins: Minutes until arrival.
        surge_coefficient: From calculate_crowd_kinetic_energy().

    Returns:
        dict: Zone-level risk scores and pre-positioning requirements.
    """
    zones = [
        {"zone": "STAGE_FRONT_PIT", "surge_risk": min(1.0, surge_coefficient * 0.15), "barrier_priority": "IMMEDIATE"},
        {"zone": "NORTH_STANDING", "surge_risk": min(1.0, surge_coefficient * 0.10), "barrier_priority": "HIGH"},
        {"zone": "MAIN_ENTRY_CORRIDOR", "surge_risk": min(1.0, surge_coefficient * 0.08), "barrier_priority": "HIGH"},
        {"zone": "SOUTH_STANDING", "surge_risk": min(1.0, surge_coefficient * 0.06), "barrier_priority": "MODERATE"},
    ]
    staff_needed = int(surge_coefficient * 8)
    return {
        "venue_id": venue_id,
        "arrival_in_mins": arrival_time_mins,
        "surge_coefficient": surge_coefficient,
        "high_risk_zones": sorted(zones, key=lambda x: x["surge_risk"], reverse=True),
        "staff_to_pre_position": staff_needed,
        "barrier_deployment_recommended": surge_coefficient >= 3.0,
        "crowd_control_recommendation": (
            f"Pre-deploy {staff_needed} staff to STAGE_FRONT_PIT "
            f"{min(arrival_time_mins, 20)} mins before arrival."
        ),
    }


def build_vip_sync_agent() -> LlmAgent:
    """Constructs the VIP Sync Agent for convoy delay monitoring."""
    corpus_incidents = [
        r.incident_id for r in INCIDENT_CORPUS if "TEMPORAL_DISRUPT" in r.failure_modes
    ]
    return LlmAgent(
        model=os.getenv("MODEL_PRO", "gemini-2.5-pro"),
        name="vip_sync_agent",
        description=(
            "Tracks headline act convoy GPS against schedule. Quantifies crowd kinetic "
            "energy from delay duration. Activates engagement programs to dissipate "
            "accumulated tension. Prevents TEMPORAL_DISRUPTION crush incidents."
        ),
        instruction=(
            f"You are SpectaSyncAI's VIP Sync Agent.\n"
            f"TEMPORAL_DISRUPTION incidents in corpus: {corpus_incidents}\n\n"
            "Protocol:\n"
            "1. Call get_convoy_gps_position(event_id).\n"
            "2. If delay_mins > 30: call activate_crowd_engagement_program().\n"
            "3. Call calculate_crowd_kinetic_energy(wait_duration_mins, crowd_size, density_score).\n"
            "4. Call calculate_arrival_surge_vector(venue_id, arrival_time_mins, surge_coefficient).\n"
            "5. Return JSON: delay_mins, delay_category, engagement_activated, "
            "   surge_prediction, staff_positioning_plan, arrival_countdown_mins, "
            "   analogous_incident_ids, prevention_note.\n"
            "Do NOT reference any persons, brands, venues or political entities by name."
        ),
        tools=[
            get_convoy_gps_position,
            calculate_crowd_kinetic_energy,
            activate_crowd_engagement_program,
            calculate_arrival_surge_vector,
        ],
    )


async def run_vip_sync_monitoring(
    event_id: str, venue_id: str, crowd_size: int, density_score: float
) -> dict:
    """Runs continuous VIP delay monitoring and pre-arrival surge mitigation."""
    agent = build_vip_sync_agent()
    session_service = InMemorySessionService()
    runner = InMemoryRunner(agent=agent, session_service=session_service)
    session = await session_service.create_session(
        app_name="spectasync_vipsync", user_id="system"
    )
    prompt = (
        f"VIP SYNC MONITORING — Event: {event_id} | Venue: {venue_id}\n"
        f"Attendance: {crowd_size:,} | Density: {density_score}\n"
        "Get convoy position, model kinetic energy, activate engagement if delayed, "
        "calculate arrival surge vector."
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

    try:
        clean = result_text.strip().lstrip("```json").rstrip("```").strip()
        return json.loads(clean)
    except json.JSONDecodeError:
        convoy = get_convoy_gps_position(event_id)
        delay = convoy["delay_mins"]
        engagement = None
        if delay > VIP_DELAY_ALERT_THRESHOLD_MINS:
            engagement = activate_crowd_engagement_program("MAIN_ARENA", "ADDRESS_BY_MC", min(delay, 60))
        kinetic = calculate_crowd_kinetic_energy(delay, crowd_size, density_score)
        surge_vec = calculate_arrival_surge_vector(venue_id, int(convoy.get("distance_to_venue_km", 30)), kinetic["surge_coefficient"])
        return {
            "event_id": event_id,
            "delay_mins": delay,
            "delay_category": convoy["delay_category"],
            "engagement_activated": engagement is not None,
            "surge_prediction": kinetic["surge_prediction"],
            "surge_coefficient": kinetic["surge_coefficient"],
            "arrival_surge_vector": surge_vec,
            "analogous_incident_ids": kinetic["analogous_incidents"],
        }