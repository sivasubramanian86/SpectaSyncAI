"""SpectaSyncAI: Unit Tests for Incident RAG Agent."""

import pytest
from agents.incident_rag_agent import (
    _vectorize_incident,
    _cosine_similarity,
    search_similar_incidents,
    aggregate_intervention_strategies,
    run_incident_rag_query,
)
from agents.incident_corpus import IncidentRecord, INCIDENT_CORPUS
from unittest.mock import AsyncMock, patch, MagicMock


@pytest.fixture
def sample_record():
    """Generates a standardized IncidentRecord for RAG vectorization testing."""
    return IncidentRecord(
        incident_id="TEST-001",
        year=2025,
        country_iso2="TS",
        event_type="concert",
        estimated_attendance=10000,
        venue_capacity=10000,
        deaths=10,
        injuries=50,
        failure_modes=["EXOGENOUS_SURGE"],
        primary_trigger="Test",
        key_precursor_signals=[],
        interventions_that_would_have_helped=["Action"],
        time_of_day_category="during_event",
        venue_type="stadium",
        vip_delay_involved=False,
        infra_failure_involved=False,
        rumor_involved=False,
        lessons_learned=["Lesson"],
    )


def test_vectorize_incident(sample_record):
    """Validates that incident records are correctly transformed into numeric semantic vectors."""
    vec = _vectorize_incident(sample_record)
    assert len(vec) > 20
    assert vec[0] == 1.0  # EXOGENOUS_SURGE


def test_cosine_similarity():
    """Verifies the mathematical correctness of the internal cosine similarity implementation."""
    v1 = [1.0, 0.0, 0.0]
    v2 = [1.0, 0.0, 0.0]
    v3 = [0.0, 1.0, 0.0]
    assert _cosine_similarity(v1, v2) == 1.0
    assert _cosine_similarity(v1, v3) == 0.0
    assert _cosine_similarity([0, 0], [1, 1]) == 0.0


def test_search_similar_incidents():
    """Validates the forensic search capability against the historical incident corpus."""
    res = search_similar_incidents(["EXOGENOUS_SURGE"], "stadium", "sports", 1.0)
    assert "similar_incidents" in res
    assert len(res["similar_incidents"]) == 3


def test_aggregate_intervention_strategies():
    """Test functionality for test_aggregate_intervention_strategies."""
    ids = [INCIDENT_CORPUS[0].incident_id]
    res = aggregate_intervention_strategies(ids)
    assert res["incident_count"] == 1
    assert len(res["unified_interventions"]) > 0


@pytest.mark.asyncio
async def test_run_incident_rag_query_success():
    """Test functionality for test_run_incident_rag_query_success."""
    with patch("agents.incident_rag_agent.InMemoryRunner") as MockRunner:
        mock_runner = MagicMock()
        MockRunner.return_value = mock_runner

        # Setup session service within the runner
        mock_runner.session_service.create_session = AsyncMock(
            return_value=MagicMock(id="test")
        )

        mock_event = MagicMock()
        mock_event.is_final_response.return_value = True
        mock_event.content.parts = [
            MagicMock(text='{"matched_incidents": ["INC-001"]}')
        ]

        async def fake_run(*args, **kwargs):
            """Test functionality for fake_run."""
            yield mock_event

        mock_runner.run_async = fake_run

        res = await run_incident_rag_query(
            ["EXOGENOUS_SURGE"], "stadium", "sports", 1.0
        )
        assert res["matched_incidents"] == ["INC-001"]


@pytest.mark.asyncio
async def test_run_incident_rag_query_fallback():
    """Validates the local search fallback mechanism when agentic model parsing fails."""
    with patch("agents.incident_rag_agent.InMemoryRunner") as MockRunner:
        mock_runner = MagicMock()
        MockRunner.return_value = mock_runner

        # Setup session service within the runner
        mock_runner.session_service.create_session = AsyncMock(
            return_value=MagicMock(id="test")
        )

        mock_event = MagicMock()
        mock_event.is_final_response.return_value = True
        mock_event.content.parts = [MagicMock(text="invalid json")]

        async def fake_run(*args, **kwargs):
            """Test functionality for fake_run."""
            yield mock_event

        mock_runner.run_async = fake_run

        res = await run_incident_rag_query(
            ["EXOGENOUS_SURGE"], "stadium", "sports", 1.0
        )
        assert "matched_incidents" in res
        assert res["corpus_searched"] > 0
