"""SpectaSyncAI: Pre-Event Strategic Analyst Agent
Powered by Gemini 2.5 Pro
Responsibility: Forecasting crowd risk based on bookings, weather, and scheduling.
"""

import os
import json
import logging
import time
from google.adk.agents import LlmAgent
from google.adk.runners import InMemoryRunner
from google.genai import types as genai_types

from api.services.observability_service import observability_service

logger = logging.getLogger(__name__)


def build_pre_event_agent(cache_name: str | None = None) -> LlmAgent:
    """Constructs the Strategic Pre-Event Analyst."""
    instruction = (
        "You are the SpectaSyncAI Pre-Event Strategic Analyst. "
        "Your task is to analyze reservation bookings, weather forecasts, "
        "and event schedules to provide a safety audit before the gates open. "
        "Format your output as a structured JSON report with fields: "
        "'risk_level', 'expected_crowd_peak', 'weather_impact', 'pro_con_summary', "
        "'precautionary_measures', and 'strategic_recommendation'. "
        "Be extremely analytical and identify 'Deadly Combos' e.g. Heat + Crowd Surge."
    )

    model = os.getenv("MODEL_PRO", "gemini-2.5-pro")

    # CRITICAL: When using cached_content, the model and instruction are already baked into the cache.
    # Re-specifying them in the request (which LlmAgent might do) causes a 400 error.
    agent_kwargs = {
        "model": model,
        "name": "pre_event_analyst",
        "description": "Strategic forecasting agent for SpectaSyncAI.",
    }
    # NOTE: Vertex cached content for this agent has been unstable in the
    # current ADK flow because the live request can still include prompt state
    # that conflicts with cached system/tool configuration. Keep the live
    # request explicit and cache-free for stability.
    _ = cache_name
    agent_kwargs["instruction"] = instruction

    return LlmAgent(**agent_kwargs)


async def run_pre_event_analysis(pre_event_data: dict) -> dict:
    """Runs a strategic analysis of the upcoming event with resilient fallback."""
    start = time.perf_counter()
    fallback = False
    status = "success"
    output_size = 0
    try:
        agent = build_pre_event_agent()
        runner = InMemoryRunner(agent=agent, app_name="spectasync_pre_event")

        session = await runner.session_service.create_session(
            app_name="spectasync_pre_event", user_id="system"
        )

        prompt = (
            f"PRE-EVENT INTEL:\n{json.dumps(pre_event_data, indent=2)}\n\n"
            "Analyze the upcoming event risk. Provide a detailed audit."
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

        clean_json = (
            result_text.strip().replace("```json", "").replace("```", "").strip()
        )
        parsed = json.loads(clean_json)

        if isinstance(parsed, list) and len(parsed) > 0:  # pragma: no cover
            parsed = parsed[0]

        if not isinstance(parsed, dict):  # pragma: no cover
            raise ValueError(f"Agent returned invalid JSON structure: {type(parsed)}")

        required_fields = [
            "risk_level",
            "expected_crowd_peak",
            "weather_impact",
            "pro_con_summary",
            "precautionary_measures",
            "strategic_recommendation",
        ]
        for field in required_fields:
            if field not in parsed:  # pragma: no cover
                parsed[field] = (
                    "Information not available"
                    if field != "precautionary_measures"
                    else []
                )

        output_size = len(json.dumps(parsed, ensure_ascii=False))
        return parsed

    except Exception as exc:  # pragma: no cover
        fallback = True
        status = "fallback"
        logger.error(f"Pre-Event Agent Error (Infrastructure or Parsing): {exc}")
        result = {
            "risk_level": "CRITICAL",
            "expected_crowd_peak": "142,000 (Local Forecast)",
            "weather_impact": "Extreme Heat (38°C) detected. High risk of dehydration-induced panic.",
            "pro_con_summary": (
                "STRENGTH: Full staff deployment. "
                "WEAKNESS: Potential transit strike synergy with gate congestion."
            ),
            "precautionary_measures": [
                "Stagger entry by 20-minute windows.",
                "Deploy mobile hydration teams to Gate North.",
                "Sync with VIPSyncAgent for high-profile arrival routing.",
            ],
            "strategic_recommendation": (
                "FORCE-START: Activate all auxiliary gates and disable "
                "automated turnstiles for faster egress."
            ),
            "is_fallback": True,
            "status": "Offline Processing (Mock Enabled)",
        }
        output_size = len(json.dumps(result, ensure_ascii=False))
        return result
    finally:
        observability_service.schedule_agent_run(
            "pre_event_analyst",
            (time.perf_counter() - start) * 1000,
            status=status,
            fallback=fallback,
            model_name=os.getenv("MODEL_PRO", "gemini-2.5-pro"),
            output_size_bytes=output_size,
        )
