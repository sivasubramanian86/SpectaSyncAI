-- ============================================================
-- SpectaSyncAI: AlloyDB Schema
-- @11_database_architect compliant
-- Runtime: AlloyDB Omni (PostgreSQL 15) + pgvector
-- Apply: psql $DATABASE_URL -f db/schema.sql
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── events ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    venue_id        TEXT        NOT NULL,
    event_type      TEXT        NOT NULL DEFAULT 'generic',  -- sports|concert|religious|political|civic
    expected_attendance  INTEGER,
    venue_capacity  INTEGER,
    starts_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ends_at         TIMESTAMPTZ,
    status          TEXT        NOT NULL DEFAULT 'active'
                                CHECK (status IN ('pending','active','completed','cancelled')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    soft_deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_events_venue_id    ON events(venue_id);
CREATE INDEX IF NOT EXISTS idx_events_status      ON events(status) WHERE soft_deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_events_starts_at   ON events(starts_at DESC);

-- ── crowd_densities ──────────────────────────────────────────────────────────
-- High write volume — partitioning by month recommended in production
CREATE TABLE IF NOT EXISTS crowd_densities (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id        UUID        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    location_id     TEXT        NOT NULL,
    density_score   NUMERIC(4,3) NOT NULL CHECK (density_score BETWEEN 0 AND 1),
    bottleneck      BOOLEAN     NOT NULL DEFAULT FALSE,
    persons_m2      NUMERIC(5,2),           -- persons per m² (>7 = critical)
    failure_mode    TEXT,                    -- from INCIDENT_CORPUS taxonomy
    detected_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crowd_densities_event_id    ON crowd_densities(event_id);
CREATE INDEX IF NOT EXISTS idx_crowd_densities_location_id ON crowd_densities(location_id);
CREATE INDEX IF NOT EXISTS idx_crowd_densities_detected_at ON crowd_densities(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_crowd_densities_bottleneck  ON crowd_densities(bottleneck) WHERE bottleneck = TRUE;

-- ── interventions ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS interventions (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id            UUID        REFERENCES events(id) ON DELETE SET NULL,
    agent_name          TEXT        NOT NULL,
    action_type         TEXT        NOT NULL,  -- MCP tool name
    target_location     TEXT        NOT NULL,
    agent_reasoning     TEXT,
    failure_mode        TEXT,                  -- corpus taxonomy code
    hitl_required       BOOLEAN     NOT NULL DEFAULT FALSE,
    hitl_approved_at    TIMESTAMPTZ,
    hitl_approved_by    TEXT,
    duration_ms         INTEGER,
    status              TEXT        NOT NULL DEFAULT 'executed'
                                    CHECK (status IN ('executed','pending_approval','rejected','failed')),
    executed_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    soft_deleted_at     TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_interventions_event_id       ON interventions(event_id);
CREATE INDEX IF NOT EXISTS idx_interventions_agent_name     ON interventions(agent_name);
CREATE INDEX IF NOT EXISTS idx_interventions_executed_at    ON interventions(executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_interventions_hitl_required  ON interventions(hitl_required) WHERE hitl_required = TRUE;
CREATE INDEX IF NOT EXISTS idx_interventions_status         ON interventions(status) WHERE soft_deleted_at IS NULL;

-- ── agent_run_logs ───────────────────────────────────────────────────────────
-- Full audit trail per @10_security_governance / Responsible AI requirement
CREATE TABLE IF NOT EXISTS agent_run_logs (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id        UUID        REFERENCES events(id) ON DELETE SET NULL,
    agent_name      VARCHAR(100) NOT NULL,
    model_version   VARCHAR(100) NOT NULL,
    input_summary   TEXT,                       -- sanitized, no PII
    output_summary  TEXT,
    failure_mode    TEXT,
    confidence      NUMERIC(4,3) CHECK (confidence BETWEEN 0 AND 1),
    input_tokens    INTEGER,
    output_tokens   INTEGER,
    cached_tokens   INTEGER DEFAULT 0,          -- context cache hit tracking
    duration_ms     INTEGER,
    status          TEXT NOT NULL DEFAULT 'SUCCESS'
                    CHECK (status IN ('SUCCESS','FAILED','PARTIAL','CACHED')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    soft_deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_agent_run_logs_event_id    ON agent_run_logs(event_id);
CREATE INDEX IF NOT EXISTS idx_agent_run_logs_agent_name  ON agent_run_logs(agent_name);
CREATE INDEX IF NOT EXISTS idx_agent_run_logs_created_at  ON agent_run_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_run_logs_status      ON agent_run_logs(status) WHERE soft_deleted_at IS NULL;

-- ── incident_registry (RAG vector store) ─────────────────────────────────────
-- Stores embeddings of historical incident records for pgvector ANN search
-- Embedding model: text-embedding-004 (768 dimensions)
-- Index: HNSW (faster than ivfflat for <1M rows)
CREATE TABLE IF NOT EXISTS incident_registry (
    id                  UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id         TEXT    NOT NULL UNIQUE,   -- INC-YYYY-ISO2-NN corpus code
    year                INTEGER NOT NULL,
    country_iso2        CHAR(2) NOT NULL,
    event_type          TEXT    NOT NULL,
    venue_type          TEXT    NOT NULL,
    deaths              INTEGER NOT NULL DEFAULT 0,
    injuries            INTEGER NOT NULL DEFAULT 0,
    failure_modes       TEXT[]  NOT NULL,           -- array of taxonomy codes
    primary_trigger     TEXT    NOT NULL,
    interventions_json  TEXT,                       -- JSON array of intervention strings
    lessons_json        TEXT,                       -- JSON array of lesson strings
    description_text    TEXT    NOT NULL,           -- full-text for embedding source
    embedding           VECTOR(768),               -- text-embedding-004 output
    embedded_at         TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- HNSW index for cosine ANN search (production RAG)
-- Built CONCURRENTLY so it doesn't block inserts during seed
CREATE INDEX IF NOT EXISTS idx_incident_registry_embedding
    ON incident_registry USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_incident_registry_event_type   ON incident_registry(event_type);
CREATE INDEX IF NOT EXISTS idx_incident_registry_venue_type   ON incident_registry(venue_type);
CREATE INDEX IF NOT EXISTS idx_incident_registry_failure_modes ON incident_registry USING GIN(failure_modes);

-- ── Trigger: auto-update updated_at ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_events_updated_at
    BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── View: crisis_active_alerts ───────────────────────────────────────────────
-- Used by the Crisis Dashboard to show live Tier-2 agent activity
CREATE OR REPLACE VIEW crisis_active_alerts AS
SELECT
    i.id,
    i.agent_name,
    i.action_type,
    i.target_location,
    i.failure_mode,
    i.hitl_required,
    i.hitl_approved_at,
    i.status,
    i.executed_at,
    e.venue_id,
    e.event_type
FROM interventions i
LEFT JOIN events e ON e.id = i.event_id
WHERE i.soft_deleted_at IS NULL
  AND i.executed_at > NOW() - INTERVAL '24 hours'
ORDER BY i.executed_at DESC;
