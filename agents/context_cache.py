"""
SpectaSyncAI: Gen AI Context Cache Manager
@19_cost_efficiency_architect - Framework Update (google-genai)

Migrated from deprecated vertexai.preview.caching (Removal date: June 24, 2026).
Uses the unified Google Gen AI SDK (google-genai) for high-fidelity context caching.

Usage:
    from agents.context_cache import warm_all_caches
    # Caches are applied during LlmAgent execution via google-adk coordination.
"""
from __future__ import annotations

import logging
import os
from google import genai
from google.genai import types

from dotenv import load_dotenv

# Ensure .env is loaded before creating any clients
load_dotenv(override=True)

logger = logging.getLogger(__name__)

# Cache TTL - refreshed every 6 hours
_CACHE_TTL_HOURS = 6


def get_client() -> genai.Client:
    """Returns a GenAI client configured for Vertex AI mode."""
    project = os.getenv("GOOGLE_CLOUD_PROJECT")
    location = os.getenv("GOOGLE_CLOUD_LOCATION", "asia-southeast1")
    logger.info(f"[ContextCache] Initializing GenAI Client: project={project}, location={location}")
    return genai.Client(
        vertexai=True,
        project=project,
        location=location
    )


# Corpus summary injected into all agent system prompts for grounding
_CORPUS_SYSTEM_BLOCK = """
# SpectaSyncAI - Global Incident Corpus & Strategic Response SOP
You are an AI safety agent grounded in forensic analysis of 18 crowd crush incidents
from 2003-2025, across 9 countries, resulting in 6,142 deaths.

## 1. Failure Mode Taxonomy
- EXOGENOUS_SURGE      External crowd volume exceeds venue absorption rate
- TEMPORAL_DISRUPT     VIP/headliner delay creates pent-up crowd kinetic energy
- INFO_CASCADE         Unverified rumor triggers simultaneous mass movement
- INFRA_FAILURE        Power/comms collapse disables all digital coordination
- EGRESS_FAILURE       Exits locked, blocked, or capacity-mismatched
- NARROW_CORRIDOR      Physical geometry creates fatal bottleneck pressure
- PANIC_TRIGGER        External stimuli (sound/projectile) causes counter-surge
- BRIDGE_BOTTLENECK    Single elevated structure becomes choke point under load
- TICKETING_CHAOS      Late/contradictory entry info causes simultaneous rush
- TEMPLE_SURGE         Religious gathering density exceeds all safe limits
- GHAT_CRUSH           River-bank bathing platform overwhelmed on auspicious date
- STAIRWAY_COLLAPSE    Pedestrian failure on temple/bridge steps under crowd load

## 2. Strategic Response Protocols (SOPs)
### SOP-01: Surge Absorption (EXOGENOUS_SURGE)
1. Detect approach rate > 50 persons/minute via transit telemetry.
2. Trigger update_digital_signage: "Zone A at capacity. Please use North Entrance."
3. Dispatch staff to Section 4 for manual redirection.
4. Objective: Prevent "Shock Load" on secondary entry gates.

### SOP-02: Delay Mitigation (TEMPORAL_DISRUPT)
1. Monitor headliner act GPS. If delay > 15m, alert crowd engagement.
2. Trigger send_attendee_push_notification: Urgency=INFO. "Sound check in progress. Act starts in 20m."
3. Objective: De-escalate kinetic energy by managing expectations.

### SOP-03: Informational Hygiene (INFO_CASCADE)
1. Detect "Run", "Bomb", "Fire", "Exit" keyword spikes in social feeds.
2. Trigger trigger_pa_announcement: "Factual update: All exits are clear. Please proceed calmly."
3. Objective: Immediate counter-narrative to prevent "Phantom Panic."

### SOP-04: Resilience Strategy (INFRA_FAILURE)
1. Detect heart-beat loss from Primary Grid.
2. Initiate BLE 5.0 mesh broadcast to attendee handsets.
3. Pulse low-frequency guidance signage on auxiliary battery power.

## 3. Key Incident References
INC-2025-IND-01: Political rally, 41 deaths - TEMPORAL_DISRUPT + INFRA_FAILURE
INC-2025-IND-02: Sports celebration, 11 deaths - EXOGENOUS_SURGE + INFO_CASCADE
INC-2025-IND-03: Kumbh Mela amavasya, 30 deaths - GHAT_CRUSH + BRIDGE_BOTTLENECK
INC-2022-KOR-01: Civic gathering, 159 deaths - NARROW_CORRIDOR + EXOGENOUS_SURGE
INC-2022-IDN-01: Stadium post-match, 131 deaths - PANIC_TRIGGER + EGRESS_FAILURE
INC-2015-SAU-01: Religious pilgrimage, 2411 deaths - EXOGENOUS_SURGE + NARROW_CORRIDOR
INC-2013-IND-02: Kumbh Mela bridge, 36 deaths - BRIDGE_BOTTLENECK + STAIRWAY_COLLAPSE
INC-2008-IND-01: Mountain shrine, 162 deaths - TEMPLE_SURGE + PANIC_TRIGGER + STAIRWAY_COLLAPSE
INC-2013-IND-01: Religious bridge, 115 deaths - TEMPLE_SURGE + INFO_CASCADE
INC-2010-KHM-01: Festival bridge, 347 deaths - BRIDGE_BOTTLENECK + PANIC_TRIGGER
INC-2010-DEU-01: Festival tunnel, 21 deaths - NARROW_CORRIDOR + EGRESS_FAILURE

## 4. Non-Negotiable Operational Rules
1. Always cite the most analogous incident ID when making an intervention recommendation.
2. Always state the detected failure mode code in your reasoning.
3. If density_score > 0.80 OR persons_m2 > 7.0: MANDATORY intervention via MCP tool.
4. Evacuation protocols always require HITL (Human-in-the-loop) confirmation.
5. All reasoning must be stored in the audit log.
"""


def build_system_prompt(agent_key: str) -> str:
    """Returns the full system prompt for a given agent (corpus + role)."""
    # Role mapping for Tier-2 and key Tier-1 agents
    roles = {
        "core_orchestrator": "## Role: Core Orchestrator\nSynthesize telemetry and dispatch MCP tools.",
        "pre_event_analyst": "## Role: Pre-Event Strategic Analyst\nForecast crowd risk based on bookings and weather.",
        "perimeter_macro": "## Role: Perimeter Macro\nMonitor external approach corridors.",
        "vip_sync": "## Role: VIP Sync\nManage crowd kinetic energy during VIP delays.",
        "rumor_control": "## Role: Rumor Control\nNeutralize INFO_CASCADE risks on social media.",
        "failsafe_mesh": "## Role: Failsafe Mesh\nCoordination via BLE mesh during INFRA_FAILURE.",
        "prediction_agent": "## Role: Prediction Agent\nReal-time crowd flow forecasting.",
        "safety_agent": "## Role: Safety Agent\nPhysical venue safety and egress monitoring.",
        "queue_agent": "## Role: Queue Agent\nOptimization of entry/exit bottlenecks.",
        "vision_agent": "## Role: Vision Agent\nCCTV/Video analytics for density detection.",
        "experience_agent": "## Role: Experience Agent\nSentiment and attendee comfort tracking.",
    }
    return _CORPUS_SYSTEM_BLOCK + roles.get(agent_key, "")


# ── Google Gen AI Context Cache ──────────────────────────────────────────────


async def get_or_create_cache(agent_key: str, model_name: str, tools: list | None = None) -> types.CachedContent | None:
    """
    Returns a CachedContent for the given agent's system prompt (and optional tools).
    Migrated to client.caches namespace.
    """
    try:
        client = get_client()
        # Ensure model name is relative for cache creation if it has prefixes
        short_model = model_name.split('/')[-1]

        # Unique cache ID based on agent and model.
        # Note: If tools change, we might want a different ID.
        cache_id = f"specta-{agent_key}-{short_model}"
        # 1. Try to retrieve
        try:
            all_caches = client.caches.list()
            for c in all_caches:
                if c.display_name == cache_id:
                    logger.info(f"[ContextCache] Cache HIT: {cache_id}")
                    return c
        except Exception:
            pass

        # 2. Create if absent
        logger.info(f"[ContextCache] Creating cache: {cache_id}...")

        # Convert ADK/GenAI tools to Types if they aren't already
        # (Assuming they are already in the correct format or LlmAgent handled them)

        cached = client.caches.create(
            model=model_name,
            config=types.CreateCachedContentConfig(
                display_name=cache_id,
                system_instruction=build_system_prompt(agent_key),
                tools=tools,  # Pass tools to be baked into the cache
                ttl=f"{_CACHE_TTL_HOURS * 3600}s",
            )
        )
        logger.info(f"[ContextCache] Cache CREATED: {cache_id}")
        return cached

    except Exception as exc:
        logger.warning(f"[ContextCache] Cache failed for {agent_key}: {exc}")
        return None


async def get_cached_model(agent_key: str, model_name: str, tools: list | None = None) -> str | None:
    """
    Wrapper for backward compatibility.
    Returns the cache name (string) instead of a model object,
    matching the expected input for newer LlmAgent/Model configurations.
    """
    cache = await get_or_create_cache(agent_key, model_name, tools=tools)
    return cache.name if cache else None


async def get_cached_model_pro(agent_key: str, tools: list | None = None) -> str | None:
    """Returns Gemini 2.5 Pro cache name."""
    model_name = os.getenv("MODEL_PRO", "gemini-2.5-pro")
    return await get_cached_model(agent_key, model_name, tools=tools)


async def get_cached_model_flash(agent_key: str) -> str | None:
    """Returns Gemini 2.5 Flash cache name."""
    model_name = os.getenv("MODEL_FLASH", "gemini-2.5-flash")
    return await get_cached_model(agent_key, model_name)


# ── Cache warm-up ────────────────────────────────────────────────────────────


async def warm_all_caches() -> None:
    """Pre-warms caches for the crisis prevention mesh."""
    agents = [
        ("core_orchestrator", os.getenv("MODEL_PRO", "gemini-2.5-pro")),
        ("perimeter_macro", os.getenv("MODEL_PRO", "gemini-2.5-pro")),
        ("vip_sync", os.getenv("MODEL_PRO", "gemini-2.5-pro")),
        ("rumor_control", os.getenv("MODEL_FLASH", "gemini-2.5-flash")),
        ("failsafe_mesh", os.getenv("MODEL_PRO", "gemini-2.5-pro")),
        ("pre_event_analyst", os.getenv("MODEL_PRO", "gemini-2.5-pro")),
        ("incident_rag", os.getenv("MODEL_PRO", "gemini-2.5-pro")),
    ]
    for key, model in agents:
        try:
            await get_or_create_cache(key, model)
        except Exception as exc:
            logger.warning(f"[ContextCache] Warm-up failed for {key}: {exc}")

    logger.info("[ContextCache] All agent caches warmed.")
