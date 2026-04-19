"""SpectaSyncAI: Agents Package
Exports the full ADK Agent Mesh - 12 agents across 2 tiers.

Tier 1 - Operational Agents (real-time venue monitoring):
  VisionAgent, CoreOrchestrator, PredictionAgent, QueueAgent, SafetyAgent, ExperienceAgent

Tier 2 - Crisis Prevention Agents (incident precursor interception):
  PerimeterMacroAgent  → EXOGENOUS_SURGE      (INC-2025-IND-02, INC-2022-KOR-01)
  VIPSyncAgent         → TEMPORAL_DISRUPT     (INC-2025-IND-01, INC-2021-USA-01)
  RumorControlAgent    → INFO_CASCADE         (INC-2013-IND-01, INC-2008-IND-01)
  FailsafeMeshAgent    → INFRA_FAILURE        (INC-2025-IND-01, INC-2010-KHM-01)

Infrastructure:
  AlloyDBMemory        → Connection pool + pgvector ANN search
  ContextCache         → Vertex AI CachedContent (6-hour TTL, ~60-75% token savings)
  IncidentRAGAgent     → 18-incident global corpus (2003-2025)
"""

# Tier 1 - Operational Agents
from .vision_agent import build_vision_agent, run_vision_analysis
from .orchestrator import build_orchestrator_agent, run_orchestration_cycle
from .prediction_agent import build_prediction_agent, run_surge_prediction
from .queue_agent import build_queue_agent, run_queue_analysis
from .safety_agent import build_safety_agent, run_safety_assessment
from .experience_agent import build_experience_agent, run_experience_recommendations
from .memory import AlloyDBMemory

# Infrastructure - Context Cache
from .context_cache import (
    build_system_prompt,
    get_cached_model,
    get_cached_model_pro,
    get_cached_model_flash,
    warm_all_caches,
)

# Tier 2 - Crisis Prevention Agents
from .perimeter_macro_agent import build_perimeter_macro_agent, run_perimeter_assessment
from .vip_sync_agent import build_vip_sync_agent, run_vip_sync_monitoring
from .rumor_control_agent import build_rumor_control_agent, run_rumor_monitoring
from .failsafe_mesh_agent import build_failsafe_mesh_agent, run_failsafe_monitoring

# Tier 2 - Incident RAG (global corpus)
from .incident_rag_agent import (
    build_incident_rag_agent,
    run_incident_rag_query,
    search_similar_incidents,
)
from .incident_corpus import INCIDENT_CORPUS, IncidentRecord

__all__ = [
    # Tier 1
    "build_vision_agent",
    "run_vision_analysis",
    "build_orchestrator_agent",
    "run_orchestration_cycle",
    "build_prediction_agent",
    "run_surge_prediction",
    "build_queue_agent",
    "run_queue_analysis",
    "build_safety_agent",
    "run_safety_assessment",
    "build_experience_agent",
    "run_experience_recommendations",
    "AlloyDBMemory",
    # Tier 2 - Crisis Prevention
    "build_perimeter_macro_agent",
    "run_perimeter_assessment",
    "build_vip_sync_agent",
    "run_vip_sync_monitoring",
    "build_rumor_control_agent",
    "run_rumor_monitoring",
    "build_failsafe_mesh_agent",
    "run_failsafe_monitoring",
    # Tier 2 - Incident RAG
    "build_incident_rag_agent",
    "run_incident_rag_query",
    "search_similar_incidents",
    "INCIDENT_CORPUS",
    "IncidentRecord",
    # Infrastructure
    "build_system_prompt",
    "get_cached_model",
    "get_cached_model_pro",
    "get_cached_model_flash",
    "warm_all_caches",
]
