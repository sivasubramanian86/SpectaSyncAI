"""SpectaSyncAI: Occupational Safety & Compliance Agent.

Identifies physical hazards and ensures compliance with venue safety protocols.

Responsibility: Emergency detection from sensor anomalies, triggering
automated evacuation protocols and emergency service coordination.
Implements responsible AI - all critical decisions require human confirmation
in production. Prototype uses structured decision output only.
"""

import json
import logging
import os
import time
from typing import Any

from google.adk.agents import LlmAgent
from google.adk.runners import InMemoryRunner
from google.genai import types as genai_types

from api.services.observability_service import observability_service

logger = logging.getLogger(__name__)


# Safety thresholds (configurable per venue)
DENSITY_EMERGENCY_THRESHOLD = 0.95
DENSITY_CRITICAL_THRESHOLD = 0.88


def classify_safety_risk(density_score: float, rate_of_change: float) -> dict[str, Any]:
    """Classify safety risk level using density and rate-of-change analysis.

    High rate-of-change signals stampede-like conditions.

    Args:
    ----
        density_score: Current density (0.0-1.0).
        rate_of_change: Density increase per minute.

    Returns:
    -------
        dict: Risk classification with recommended response.

    """
    if density_score >= DENSITY_EMERGENCY_THRESHOLD or rate_of_change > 0.05:
        return {
            "risk_level": "EMERGENCY",
            "protocol": "EVACUATION",
            "immediate_actions": [
                "Activate evacuation PA announcement",
                "Open all auxiliary gates",
                "Notify emergency services (999/112)",
                "Deploy all available staff to zone",
            ],
            "human_approval_required": True,
        }
    if density_score >= DENSITY_CRITICAL_THRESHOLD:
        return {
            "risk_level": "CRITICAL",
            "protocol": "CROWD_CONTROL",
            "immediate_actions": [
                "Dispatch security team (HIGH priority)",
                "Reroute incoming crowd via digital signage",
                "Close ingress, allow egress only",
            ],
            "human_approval_required": False,
        }
    return {
        "risk_level": "ELEVATED",
        "protocol": "MONITOR",
        "immediate_actions": [
            "Dispatch 1 additional staff member",
            "Update signage with alternate routing",
        ],
        "human_approval_required": False,
    }


def get_emergency_contact_list() -> dict[str, str]:
    """Return the emergency contacts and escalation chain for the venue.

    Returns:
    -------
        dict: Emergency contacts categorized by type.

    """
    return {
        "venue_security_radio": "CH-7",
        "venue_operations_manager": "+91-98765-00001",
        "local_police": "100",
        "ambulance": "108",
        "fire_brigade": "101",
        "crowd_safety_officer": "+91-98765-00002",
    }


def build_safety_agent() -> LlmAgent:
    """Build the ADK Safety Agent using Gemini 2.5 Pro.

    Returns:
    -------
        LlmAgent: Configured safety monitoring agent.

    """
    return LlmAgent(
        model=os.getenv("MODEL_PRO", "gemini-2.5-pro"),
        name="safety_agent",
        description=(
            "Detects dangerous crowd conditions, classifies safety risk levels, "
            "and coordinates emergency response protocols with full audit trail."
        ),
        instruction=(
            "You are the SpectaSyncAI Safety Agent - responsible for crowd safety. "
            "When given density and rate_of_change data:\n"
            "1. Call classify_safety_risk(density_score, rate_of_change) to assess risk.\n"
            "2. Call get_emergency_contact_list() if risk is CRITICAL or EMERGENCY.\n"
            "3. Return a safety assessment JSON with: risk_level, protocol, "
            "immediate_actions, contacts (if applicable), and a brief plain-English "
            "summary for the operations manager. "
            "NOTE: Flag human_approval_required=True for EVACUATION protocols. "
            "Never autonomously trigger evacuation - only recommend it. "
            "This is a RESPONSIBLE AI safety constraint."
        ),
        tools=[classify_safety_risk, get_emergency_contact_list],
    )


async def run_safety_assessment(
    location_id: str, density_score: float, rate_of_change: float = 0.02
) -> dict[str, Any]:
    """Run the Safety Agent for emergency detection and coordination.

    Args:
    ----
        location_id: Venue zone identifier.
        density_score: Current density (0.0-1.0).
        rate_of_change: Density change per minute (positive = increasing).

    Returns:
    -------
        dict: Safety assessment with risk level, protocol, and actions.

    """
    start = time.perf_counter()
    fallback = False
    output_size = 0
    agent = build_safety_agent()
    runner = InMemoryRunner(agent=agent, app_name="spectasync_safety")

    session = await runner.session_service.create_session(
        app_name="spectasync_safety", user_id="system"
    )

    prompt = (
        f"SAFETY ASSESSMENT REQUEST\n"
        f"Location: {location_id}\n"
        f"Current density: {density_score}\n"
        f"Rate of change per minute: {rate_of_change}\n"
        "Classify risk level and provide the complete safety response protocol."
    )

    result_text = ""
    try:
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

        logger.info(f"[SafetyAgent] Assessment for {location_id}: {result_text}")

        try:
            clean = (
                result_text.strip().replace("```json", "").replace("```", "").strip()
            )
            result = json.loads(clean)
            output_size = len(json.dumps(result, ensure_ascii=False))
            return result
        except json.JSONDecodeError:  # pragma: no cover
            fallback = True
            classification = classify_safety_risk(density_score, rate_of_change)
            result = {
                "location_id": location_id,
                "density_score": density_score,
                "rate_of_change": rate_of_change,
                **classification,
                "summary": (
                    f"Zone {location_id} is at {classification['risk_level']} risk "
                    f"with density {density_score:.0%}. "
                    f"Protocol: {classification['protocol']}."
                ),
            }
            output_size = len(json.dumps(result, ensure_ascii=False))
            return result
    finally:
        observability_service.schedule_agent_run(
            "safety_agent",
            (time.perf_counter() - start) * 1000,
            status="fallback" if fallback else "success",
            fallback=fallback,
            model_name=os.getenv("MODEL_PRO", "gemini-2.5-pro"),
            output_size_bytes=output_size,
        )
