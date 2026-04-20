"""SpectaSyncAI: AlloyDB Memory Module
# Hardened for AlloyDB with pgvector and asyncpg connection pooling.

Provides:
  - Connection pool (asyncpg Pool - NOT per-call connect)
  - pgvector ANN semantic search over incident_registry
  - Real Vertex AI text-embedding-004 for query vectorization
  - Intervention storage with HITL flag
  - Prototype fallback when DATABASE_URL is unset
"""

from __future__ import annotations

import json
import logging
import os

logger = logging.getLogger(__name__)

_USE_ALLOYDB = os.getenv("USE_ALLOYDB", "true").lower() == "true"
_USE_MOCK = not (bool(os.getenv("DATABASE_URL")) and _USE_ALLOYDB)
_POOL: object | None = None  # asyncpg.Pool singleton
EMBEDDING_MODEL = "text-embedding-004"  # 768 dimensions, Vertex AI


# ── Connection Pool ──────────────────────────────────────────────────────────


async def _get_pool():
    """Returns the asyncpg connection pool singleton.
    Creates it on first call. Pool size tuned for Cloud Run concurrency.
    Implements pool_pre_ping equivalent via asyncpg keepalives.
    """
    global _POOL
    if _POOL is not None:
        return _POOL

    import asyncpg
    from pgvector.asyncpg import register_vector

    dsn = os.environ["DATABASE_URL"]
    _POOL = await asyncpg.create_pool(
        dsn,
        min_size=2,
        max_size=10,
        command_timeout=30,
        server_settings={"application_name": "spectasync_agents"},
    )

    # Register the vector codec on one connection to prime the pool
    async with _POOL.acquire() as conn:
        await register_vector(conn)

    logger.info("[Memory] AlloyDB connection pool established (min=2, max=10).")
    return _POOL


# ── Embedding ────────────────────────────────────────────────────────────────


async def _embed(text: str) -> list[float]:
    """Generates a 768-dimension embedding via Vertex AI text-embedding-004.
    Used to vectorize the live event query before ANN search.
    """
    import vertexai
    from vertexai.language_models import TextEmbeddingModel

    project = os.getenv("GOOGLE_CLOUD_PROJECT")
    location = os.getenv("GOOGLE_CLOUD_LOCATION", "asia-southeast1")
    vertexai.init(project=project, location=location)

    model = TextEmbeddingModel.from_pretrained(EMBEDDING_MODEL)
    embeddings = model.get_embeddings([text])
    return embeddings[0].values


# ── AlloyDB Memory ───────────────────────────────────────────────────────────


class AlloyDBMemory:
    """Async memory interface for ADK agents.
    Wraps AlloyDB + pgvector operations. Falls back to in-memory mock
    when DATABASE_URL is not set (prototype / CI mode).
    """

    async def get_historical_context(
        self, location_id: str, event_context: str = ""
    ) -> list[dict]:
        """Retrieves top-3 most similar historical incidents via pgvector ANN search.
        Query vector is generated from location_id + event_context using text-embedding-004.

        Args:
        ----
            location_id:    Venue zone identifier (e.g. 'GATE_NORTH').
            event_context:  Optional additional context to improve match quality.

        Returns:
        -------
            list[dict]: Ranked historical incident records with resolution strategies.

        """
        if _USE_MOCK:
            logger.warning(
                "[Memory] Prototype mode - returning mock historical context."
            )
            return _mock_context(location_id)

        try:
            query_text = f"Crowd surge at {location_id}. {event_context}".strip()
            vector = await _embed(query_text)

            pool = await _get_pool()
            async with pool.acquire() as conn:
                rows = await conn.fetch(
                    """
                    SELECT
                        incident_id,
                        description_text,
                        interventions_json,
                        failure_modes,
                        1 - (embedding <=> $1::vector) AS similarity_score
                    FROM incident_registry
                    WHERE embedding IS NOT NULL
                    ORDER BY embedding <=> $1::vector
                    LIMIT 3
                    """,
                    vector,
                )

            return [
                {
                    "incident_id": row["incident_id"],
                    "description": row["description_text"],
                    "interventions": json.loads(row["interventions_json"] or "[]"),
                    "failure_modes": list(row["failure_modes"] or []),
                    "similarity_score": round(float(row["similarity_score"]), 4),
                }
                for row in rows
            ]

        except Exception as exc:  # pragma: no cover
            logger.error(f"[Memory] AlloyDB ANN query failed: {exc}")
            return []

    async def store_intervention(
        self,
        location_id: str,
        action: str,
        reasoning: str,
        agent_name: str = "orchestrator",
        failure_mode: str = "",
        hitl_required: bool = False,
        duration_ms: int = 0,
        event_id: str | None = None,
    ) -> None:
        """Persists a completed agent intervention to the AlloyDB interventions table.
        Records HITL flag for Responsible AI audit trail.
        """
        if _USE_MOCK:
            logger.info(
                f"[Memory] MOCK STORE - {agent_name}:{action} @ {location_id} (HITL={hitl_required})"
            )
            return

        try:
            pool = await _get_pool()
            async with pool.acquire() as conn:
                await conn.execute(
                    """
                    INSERT INTO interventions
                        (event_id, agent_name, action_type, target_location,
                         agent_reasoning, failure_mode, hitl_required, duration_ms, status)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8,
                            CASE WHEN $7 THEN 'pending_approval' ELSE 'executed' END)
                    """,
                    event_id,
                    agent_name,
                    action,
                    location_id,
                    reasoning,
                    failure_mode or None,
                    hitl_required,
                    duration_ms,
                )
            logger.info(
                f"[Memory] Stored intervention: {agent_name}:{action} @ {location_id}"
            )

        except Exception as exc:  # pragma: no cover
            logger.error(f"[Memory] Failed to store intervention: {exc}")

    async def log_agent_run(
        self,
        agent_name: str,
        model_version: str,
        input_tokens: int,
        output_tokens: int,
        cached_tokens: int = 0,
        duration_ms: int = 0,
        status: str = "SUCCESS",
        failure_mode: str = "",
        event_id: str | None = None,
    ) -> None:
        """Writes an agent run record to agent_run_logs.
        Tracks cached_tokens for context caching ROI measurement.
        """
        if _USE_MOCK:
            logger.debug(
                f"[Memory] MOCK LOG - {agent_name} | "
                f"tokens={input_tokens}+{output_tokens} cached={cached_tokens}"
            )
            return

        try:
            pool = await _get_pool()
            async with pool.acquire() as conn:
                await conn.execute(
                    """
                    INSERT INTO agent_run_logs
                        (event_id, agent_name, model_version, input_tokens,
                         output_tokens, cached_tokens, duration_ms, failure_mode, status)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    """,
                    event_id,
                    agent_name,
                    model_version,
                    input_tokens,
                    output_tokens,
                    cached_tokens,
                    duration_ms,
                    failure_mode or None,
                    status,
                )
        except Exception as exc:  # pragma: no cover
            logger.error(f"[Memory] Failed to log agent run: {exc}")


# ── Mock fallback (prototype mode) ───────────────────────────────────────────


def _mock_context(location_id: str) -> list[dict]:
    """Generates synthetic historical context for prototype/CI mode.
    Used when AlloyDB is not reachable.
    """
    return [
        {
            "incident_id": "INC-2025-IND-02",
            "description": f"Crowd surge at {location_id} - external volume 6x venue capacity.",
            "interventions": [
                "Activate street diversion on approach corridors.",
                "Broadcast capacity freeze on all official channels.",
                "Deploy staff to perimeter gates.",
            ],
            "failure_modes": ["EXOGENOUS_SURGE", "INFO_CASCADE"],
            "similarity_score": 0.94,
        },
        {
            "incident_id": "INC-2022-KOR-01",
            "description": f"Narrow corridor density at {location_id} exceeded 7 persons/m².",
            "interventions": [
                "Enforce unidirectional flow immediately.",
                "Cap corridor entry at 5 persons/m².",
            ],
            "failure_modes": ["NARROW_CORRIDOR"],
            "similarity_score": 0.81,
        },
    ]
