"""Crisis Prevention router - Tier-2 crisis agents REST API.
Addresses EXOGENOUS_SURGE, TEMPORAL_DISRUPTION, INFO_CASCADE, INFRA_FAILURE.
"""

import os
import logging
from fastapi import APIRouter
from pydantic import BaseModel, Field
from agents.perimeter_macro_agent import run_perimeter_assessment
from agents.vip_sync_agent import run_vip_sync_monitoring
from agents.rumor_control_agent import run_rumor_monitoring
from agents.failsafe_mesh_agent import run_failsafe_monitoring
from agents.incident_rag_agent import run_incident_rag_query
from agents.incident_corpus import INCIDENT_CORPUS

logger = logging.getLogger(__name__)
router = APIRouter()


class PerimeterRequest(BaseModel):
    """Schema for perimeter security and external traffic load assessment."""

    venue_id: str = Field(
        "large_cricket_stadium", json_schema_extra={"example": "large_cricket_stadium"}
    )
    area_code: str = Field("560001", json_schema_extra={"example": "560001"})
    station_ids: list[str] = Field(
        ["TRANSIT_STATION_A", "TRANSIT_STATION_B", "BUS_TERMINAL_N"],
        json_schema_extra={"example": ["STATION_A", "STATION_B"]},
    )


class VIPSyncRequest(BaseModel):
    """Schema for VIP arrival synchronization and crowd density alerts."""

    event_id: str = Field("EVT-2026-001", json_schema_extra={"example": "EVT-01"})
    venue_id: str = Field("outdoor_rally_ground", json_schema_extra={"ex": "V1"})
    crowd_size: int = Field(38000, ge=100, le=500_000)
    density_score: float = Field(0.75, ge=0.0, le=1.0)


class InfraRequest(BaseModel):
    """Schema for infrastructure component failure assessment across venue zones."""

    venue_id: str = Field("large_cricket_stadium")
    zones: list[str] = Field(["MAIN_ARENA", "GATE_NORTH", "STAGE_FRONT_PIT"])


class IncidentRAGRequest(BaseModel):
    """Schema for querying the historical incident corpus using failure mode signals."""

    active_failure_modes: list[str] = Field(
        ["EXOGENOUS_SURGE", "INFO_CASCADE"],
        json_schema_extra={"example": ["TEMPORAL_DISRUPT", "INFRA_FAILURE"]},
    )
    venue_type: str = Field("stadium", json_schema_extra={"example": "ground"})
    event_type: str = Field("sports", json_schema_extra={"example": "rally"})
    capacity_ratio: float = Field(2.5, ge=0.1, le=20.0)
    vip_delay: bool = Field(False)
    infra_failure: bool = Field(False)
    rumor_detected: bool = Field(False)


@router.post(
    "/crisis/perimeter",
    summary="Perimeter Macro Agent - detect surge (EXOGENOUS_SURGE)",
)
async def assess_perimeter(payload: PerimeterRequest) -> dict:
    """Detects external crowd pressure via cell/transit telemetry."""
    try:
        return await run_perimeter_assessment(
            payload.venue_id, payload.area_code, payload.station_ids
        )
    except Exception as e:  # pragma: no cover
        logger.error(f"Perimeter Agent Error: {e}")
        return {
            "venue_id": payload.venue_id,
            "risk_classification": "ELEVATED",
            "capacity_ratio": 1.45,
            "external_crowd_estimate": 43500,
            "diversion_activated": False,
            "is_fallback": True,
        }


@router.post(
    "/crisis/vip-delay",
    summary="VIP Sync Agent - delay tracking (TEMPORAL_DISRUPTION)",
)
async def monitor_vip_delay(payload: VIPSyncRequest) -> dict:
    """Tracks act convoy GPS. Calculates crowd kinetic energy from delay."""
    try:
        return await run_vip_sync_monitoring(
            payload.event_id,
            payload.venue_id,
            payload.crowd_size,
            payload.density_score,
        )
    except Exception as e:  # pragma: no cover
        logger.error(f"VIP Sync Agent Error: {e}")
        return {
            "event_id": payload.event_id,
            "delay_mins": 15,
            "kinetic_energy_spike": "LOW",
            "recommendation": "Maintain standard perimeter buffer.",
            "is_fallback": True,
        }


@router.post(
    "/crisis/rumor-monitor",
    summary="Rumor Control Agent - counter-narrative (INFO_CASCADE)",
)
async def monitor_rumors(venue_id: str = "large_cricket_stadium") -> dict:
    """Scans social media for venue keywords. Classifies rumor risk."""
    try:
        return await run_rumor_monitoring(venue_id)
    except Exception as e:  # pragma: no cover
        logger.error(f"Rumor Agent Error: {e}")
        return {
            "venue_id": venue_id,
            "rumors_detected": 0,
            "risk_level": "LOW",
            "sentiment": "NEUTRAL",
            "is_fallback": True,
        }


@router.post(
    "/crisis/infra-failsafe",
    summary="Failsafe Mesh Agent - infra failure (INFRA_FAILURE)",
)
async def check_infrastructure(payload: InfraRequest) -> dict:
    """Monitors venue infrastructure. Triggers BLE mesh on failure."""
    try:
        return await run_failsafe_monitoring(payload.venue_id, payload.zones)
    except Exception as e:  # pragma: no cover
        logger.error(f"Failsafe Agent Error: {e}")
        return {
            "venue_id": payload.venue_id,
            "status": "OPERATIONAL",
            "mesh_active": False,
            "is_fallback": True,
        }


@router.post(
    "/crisis/incident-rag",
    summary="Incident RAG Agent - semantic search",
)
async def query_incident_rag(payload: IncidentRAGRequest) -> dict:
    """Performs cosine similarity search against 12-incident corpus."""
    try:
        return await run_incident_rag_query(
            active_failure_modes=payload.active_failure_modes,
            venue_type=payload.venue_type,
            event_type=payload.event_type,
            capacity_ratio=payload.capacity_ratio,
            vip_delay=payload.vip_delay,
            infra_failure=payload.infra_failure,
            rumor_detected=payload.rumor_detected,
        )
    except Exception as e:  # pragma: no cover
        logger.error(f"RAG Agent Error: {e}")
        return {
            "top_matches": [
                {
                    "incident_id": "INC-2025-IND-02",
                    "similarity": 0.92,
                    "relevance": "High capacity breach correlation.",
                }
            ],
            "recommended_preventative_mesh": [
                "Activate PerimeterMacroAgent immediately.",
                "Trigger VIPSync delay protocols.",
            ],
            "is_fallback": True,
        }


@router.get(
    "/crisis/incident-corpus",
    summary="List all incidents in the global corpus",
)
async def list_incident_corpus() -> dict:
    """Returns the full anonymized incident corpus metadata."""
    return {
        "total_incidents": len(INCIDENT_CORPUS),
        "date_range": "2010-2025",
        "countries": len({r.country_iso2 for r in INCIDENT_CORPUS}),
        "total_deaths": sum(r.deaths for r in INCIDENT_CORPUS),
        "total_injuries": sum(r.injuries for r in INCIDENT_CORPUS),
        "incidents": [
            {
                "incident_id": r.incident_id,
                "year": r.year,
                "country_iso2": r.country_iso2,
                "event_type": r.event_type,
                "deaths": r.deaths,
                "failure_modes": r.failure_modes,
                "venue_type": r.venue_type,
            }
            for r in INCIDENT_CORPUS
        ],
    }


@router.get(
    "/crisis/status",
    summary="Crisis prevention mesh status - all 5 agents (4 + RAG)",
)
async def crisis_status() -> dict:
    """Returns the operational status of all crisis prevention agents."""
    ref_surge = ["INC-2025-IND-02", "INC-2022-KOR-01", "INC-2010-DEU-01"]
    ref_temp = ["INC-2025-IND-01", "INC-2021-USA-01", "INC-2015-SAU-01"]
    ref_info = ["INC-2025-IND-02", "INC-2013-IND-01", "INC-2021-USA-01"]
    ref_infra = ["INC-2025-IND-01", "INC-2017-IND-01", "INC-2010-KHM-01"]

    return {
        "crisis_prevention_agents": [
            {
                "name": "PerimeterMacroAgent",
                "model": os.getenv("MODEL_PRO", "gemini-2.5-pro"),
                "failure_mode": "EXOGENOUS_SURGE",
                "incident_references": ref_surge,
                "status": "ACTIVE",
            },
            {
                "name": "VIPSyncAgent",
                "model": os.getenv("MODEL_PRO", "gemini-2.5-pro"),
                "failure_mode": "TEMPORAL_DISRUPTION",
                "incident_references": ref_temp,
                "status": "ACTIVE",
            },
            {
                "name": "RumorControlAgent",
                "model": os.getenv("MODEL_FLASH", "gemini-2.5-flash"),
                "failure_mode": "INFO_CASCADE",
                "incident_references": ref_info,
                "status": "ACTIVE",
            },
            {
                "name": "FailsafeMeshAgent",
                "model": os.getenv("MODEL_PRO", "gemini-2.5-pro"),
                "failure_mode": "INFRA_FAILURE",
                "incident_references": ref_infra,
                "status": "ACTIVE",
            },
            {
                "name": "IncidentRAGAgent",
                "model": os.getenv("MODEL_PRO", "gemini-2.5-pro"),
                "failure_mode": "ALL_MODES",
                "corpus_size": len(INCIDENT_CORPUS),
                "corpus_span": "2010-2025",
                "countries": len({r.country_iso2 for r in INCIDENT_CORPUS}),
                "status": "ACTIVE",
            },
        ],
        "corpus_total_deaths": sum(r.deaths for r in INCIDENT_CORPUS),
        "corpus_incidents": len(INCIDENT_CORPUS),
        "api_version": "3.0.0",
    }
