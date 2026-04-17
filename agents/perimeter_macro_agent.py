"""
SpectaSyncAI: Perimeter Macro Agent — @03 @05
Powered by: google-adk + Gemini 2.5 Pro
Failure Mode Addressed: EXOGENOUS_SURGE

Incident Reference: INC-2025-IND-02
A 2025 sports celebration venue had its official capacity overwhelmed by an
estimated 6x excess external crowd before gates opened. Traditional in-venue
CCTV was architecturally blind to this. No external crowd monitoring existed.
Cell tower network load showed elevated congestion 90 minutes before the crush —
a detectable signal that went unread. See: agents/incident_corpus.py INC-2025-IND-02.

Also relevant: INC-2022-KOR-01 (narrow street crush, 159 deaths — external crowds
with no monitoring), INC-2010-DEU-01 (tunnel bottleneck at festival).

Responsibility:
  Monitors telemetry EXTERNAL to the venue — cell tower network load,
  metro/bus ridership anomalies, traffic density APIs — to detect dangerous
  crowd accumulation BEFORE it reaches the perimeter.
"""
import os
import json
import logging
from google.adk.agents import LlmAgent
from google.adk.runners import InMemoryRunner
from google.adk.sessions import InMemorySessionService
from google.genai import types as genai_types
from .incident_corpus import INCIDENT_CORPUS

logger = logging.getLogger(__name__)

# Venue capacity register — keyed by venue identifier token (no proper nouns)
VENUE_CAPACITY_REGISTER: dict[str, int] = {
    "large_cricket_stadium": 50_000,
    "medium_cricket_stadium": 40_000,
    "football_stadium_xl": 66_000,
    "football_stadium_lg": 50_000,
    "concert_arena": 30_000,
    "outdoor_rally_ground": 10_000,
    "temple_grounds": 100_000,
    "civic_public_space": 20_000,
    "default": 30_000,
}


def query_cell_tower_load(area_code: str, radius_km: float = 2.0) -> dict:
    """
    Queries mobile network congestion metrics for cell towers within `radius_km`
    of the venue perimeter as a real-time crowd density proxy.

    Historical precedent (INC-2025-IND-02): Cell towers in the vicinity showed
    4x+ normal load 90 minutes before a fatal crowd crush — a fully detectable
    signal. Had this data been acted on, the incident was preventable.

    Production: Integrates with Telecom Operator Network Analytics API.
    Prototype: Returns calibrated simulation data.

    Args:
        area_code: Postal/area code of the venue's surrounding district.
        radius_km: Radius in km to query cell towers.

    Returns:
        dict: Network load ratio (1.0 = normal), estimated external crowd.
    """
    import random
    load_ratio = random.uniform(2.8, 6.5)
    estimated_people = int(load_ratio * 38_000)
    return {
        "area_code": area_code,
        "radius_km": radius_km,
        "cell_tower_count": 7,
        "avg_network_load_ratio": round(load_ratio, 2),
        "estimated_external_crowd": estimated_people,
        "peak_tower": f"TOWER_{area_code}_03",
        "load_vs_normal": f"{round((load_ratio - 1.0) * 100)}% above baseline",
        "confidence": "HIGH" if load_ratio > 3.0 else "MEDIUM",
    }


def query_transit_ridership_anomalies(station_ids: list[str]) -> dict:
    """
    Checks metro/bus station ridership against historical baseline for event day.
    Anomalous ridership at adjacent stations signals incoming crowd volume.

    Historical precedent (INC-2025-IND-02): Transit stations adjacent to the
    venue processed 3.8x normal ridership 60 minutes before the crush.

    Production: Connects to city transit Open Data APIs (e.g. metro authority feeds).

    Args:
        station_ids: List of transit station identifiers to query.

    Returns:
        dict: Per-station ridership ratios and aggregate crowd estimate.
    """
    import random
    stations = []
    for sid in station_ids:
        ratio = random.uniform(1.5, 4.2)
        stations.append({
            "station_id": sid,
            "ridership_vs_baseline": round(ratio, 2),
            "crowd_contribution_estimate": int(ratio * 12_000),
            "alert": ratio > 3.0,
        })
    total_incoming = sum(s["crowd_contribution_estimate"] for s in stations)
    return {
        "queried_stations": len(station_ids),
        "stations": stations,
        "total_incoming_crowd_estimate": total_incoming,
        "aggregate_alert_level": (
            "CRITICAL" if total_incoming > 80_000
            else "HIGH" if total_incoming > 40_000
            else "MODERATE"
        ),
    }


def calculate_capacity_breach_risk(venue_id: str, external_crowd_estimate: int) -> dict:
    """
    Computes capacity overage ratio and breach probability.
    Draws comparison against known incident signatures from the corpus.

    Historical precedent:
      INC-2025-IND-02: 6.25x capacity → certain crush.
      INC-2025-IND-01: 4–5x capacity → certain crush.
      INC-2022-KOR-01: Narrow street — no official capacity, density >9 persons/m².
      INC-2010-DEU-01: 5.6x capacity via single access tunnel.

    Args:
        venue_id: Venue identifier (from VENUE_CAPACITY_REGISTER).
        external_crowd_estimate: Estimated external crowd from telemetry.

    Returns:
        dict: Capacity ratio, crush probability, time-to-critical estimate.
    """
    capacity = VENUE_CAPACITY_REGISTER.get(venue_id, VENUE_CAPACITY_REGISTER["default"])
    ratio = external_crowd_estimate / capacity
    crush_probability = min(1.0, (ratio - 1.0) / 5.0) if ratio > 1.0 else 0.0
    approach_rate_per_min = 5_000
    time_to_critical = max(0, (capacity * 0.85 - external_crowd_estimate * 0.3) / approach_rate_per_min)

    # Find analogous incidents from corpus
    analogous = [
        r.incident_id for r in INCIDENT_CORPUS
        if "EXOGENOUS_SURGE" in r.failure_modes
        and abs(r.estimated_attendance / max(1, r.venue_capacity) - ratio) < 1.5
    ]

    return {
        "venue_id": venue_id,
        "official_capacity": capacity,
        "external_crowd_estimate": external_crowd_estimate,
        "capacity_ratio": round(ratio, 2),
        "crush_probability_pct": round(crush_probability * 100, 1),
        "minutes_to_critical_gate_density": round(time_to_critical, 1),
        "risk_classification": (
            "CATASTROPHIC" if ratio >= 5.0
            else "CRITICAL" if ratio >= 3.0
            else "HIGH" if ratio >= 2.0
            else "MODERATE" if ratio >= 1.5
            else "NORMAL"
        ),
        "analogous_incidents_in_corpus": analogous[:3],
    }


def activate_street_diversion_protocol(
    venue_id: str, approach_corridors: list[str], diversion_routes: list[str]
) -> dict:
    """
    Triggers street-level crowd diversion BEFORE gate breach.
    The critical intervention absent in INC-2025-IND-02, INC-2022-KOR-01,
    and INC-2010-DEU-01. Coordinates with traffic authority and city transit.

    Args:
        venue_id: Target venue.
        approach_corridors: Current high-density approach paths to restrict.
        diversion_routes: Alternate routes to activate.

    Returns:
        dict: Diversion activation confirmation.
    """
    logger.critical(
        f"[PerimeterMacroAgent] STREET DIVERSION ACTIVATED — "
        f"Venue: {venue_id} | Blocking: {approach_corridors}"
    )
    return {
        "status": "ACTIVATED",
        "venue_id": venue_id,
        "corridors_blocked": approach_corridors,
        "diversion_routes_active": diversion_routes,
        "police_notified": True,
        "city_transit_notified": True,
        "digital_hoarding_updated": True,
        "estimated_impact_mins": 8,
    }


def build_perimeter_macro_agent() -> LlmAgent:
    """Constructs the Perimeter Macro Agent for external crowd monitoring."""
    corpus_incidents = [r.incident_id for r in INCIDENT_CORPUS if "EXOGENOUS_SURGE" in r.failure_modes]
    return LlmAgent(
        model=os.getenv("MODEL_PRO", "gemini-2.5-pro"),
        name="perimeter_macro_agent",
        description=(
            "Monitors external crowd accumulation via cell-tower network load and "
            "transit ridership anomalies. Triggers street-level diversion protocols "
            "before crowds reach venue gates — preventing EXOGENOUS_SURGE incidents."
        ),
        instruction=(
            f"You are SpectaSyncAI's Perimeter Macro Agent.\n"
            f"Incident corpus reference (EXOGENOUS_SURGE): {corpus_incidents}\n\n"
            "Protocol:\n"
            "1. Call query_cell_tower_load(area_code, radius_km).\n"
            "2. Call query_transit_ridership_anomalies(station_ids).\n"
            "3. Call calculate_capacity_breach_risk(venue_id, external_crowd_estimate).\n"
            "4. If crush_probability_pct > 40%: activate_street_diversion_protocol().\n"
            "5. Return JSON: risk_level, external_crowd_estimate, capacity_ratio, "
            "   minutes_to_critical, diversion_activated (bool), street_actions_taken, "
            "   analogous_incident_ids, incident_prevention_summary.\n"
            "Do NOT reference any persons, brands, venues, or political entities by name."
        ),
        tools=[
            query_cell_tower_load,
            query_transit_ridership_anomalies,
            calculate_capacity_breach_risk,
            activate_street_diversion_protocol,
        ],
    )


async def run_perimeter_assessment(
    venue_id: str, area_code: str, station_ids: list[str]
) -> dict:
    """Runs the Perimeter Macro Agent for a venue ahead of an event."""
    agent = build_perimeter_macro_agent()
    session_service = InMemorySessionService()
    runner = InMemoryRunner(agent=agent, session_service=session_service)
    session = await session_service.create_session(
        app_name="spectasync_perimeter", user_id="system"
    )
    prompt = (
        f"PERIMETER ASSESSMENT — Venue: {venue_id} | Area: {area_code}\n"
        f"Transit stations: {', '.join(station_ids)}\n"
        "Assess external crowd pressure and activate street diversion if required."
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
        tower = query_cell_tower_load(area_code)
        transit = query_transit_ridership_anomalies(station_ids)
        breach = calculate_capacity_breach_risk(venue_id, tower["estimated_external_crowd"])
        result = {**breach, "cell_tower_data": tower, "transit_data": transit}
        if breach["crush_probability_pct"] > 40.0:
            result["diversion"] = activate_street_diversion_protocol(
                venue_id, ["MAIN_APPROACH_N", "MAIN_APPROACH_E"], ["ALT_ROUTE_S", "ALT_ROUTE_W"]
            )
            result["diversion_activated"] = True
        else:
            result["diversion_activated"] = False
        return result