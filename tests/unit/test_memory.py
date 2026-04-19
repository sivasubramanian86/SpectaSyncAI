"""SpectaSyncAI: Unit Tests for Memory Module."""

import pytest
import os
from unittest.mock import AsyncMock, patch, MagicMock
from agents.memory import AlloyDBMemory, _get_pool, _embed


@pytest.mark.asyncio
async def test_alloydb_memory_mock_mode():
    # Ensure DATABASE_URL is not set to trigger mock mode
    """Test functionality for test_alloydb_memory_mock_mode."""
    with patch.dict(os.environ, {}, clear=True):
        import agents.memory

        agents.memory._USE_MOCK = True

        mem = AlloyDBMemory()
        ctx = await mem.get_historical_context("GATE_3")
        assert len(ctx) > 0
        assert ctx[0]["incident_id"] == "INC-2025-IND-02"

        await mem.store_intervention("GATE_3", "action", "reasoning")
        await mem.log_agent_run("test_agent", "v1", 100, 50)


@pytest.mark.asyncio
async def test_get_pool_singleton():
    """Test functionality for test_get_pool_singleton."""
    with (
        patch("asyncpg.create_pool", new_callable=AsyncMock) as mock_create_pool,
        patch("pgvector.asyncpg.register_vector", new_callable=AsyncMock),
        patch.dict(os.environ, {"DATABASE_URL": "postgresql://user:pass@host/db"}),
    ):
        # Reset global _POOL for testing
        import agents.memory

        agents.memory._POOL = None

        mock_pool = MagicMock()
        mock_conn = AsyncMock()
        mock_pool.acquire.return_value.__aenter__.return_value = mock_conn
        mock_create_pool.return_value = mock_pool

        pool = await _get_pool()
        assert pool is not None
        mock_create_pool.assert_called_once()

        # Call again, should return singleton
        pool2 = await _get_pool()
        assert pool2 is pool
        assert mock_create_pool.call_count == 1


@pytest.mark.asyncio
async def test_embed_mock():
    """Test functionality for test_embed_mock."""
    with (
        patch("vertexai.init"),
        patch(
            "vertexai.language_models.TextEmbeddingModel.from_pretrained"
        ) as mock_from_pre,
    ):
        mock_model = MagicMock()
        mock_emb = MagicMock()
        mock_emb.values = [0.1, 0.2, 0.3]
        mock_model.get_embeddings.return_value = [mock_emb]
        mock_from_pre.return_value = mock_model

        res = await _embed("test text")
        assert res == [0.1, 0.2, 0.3]


@pytest.mark.asyncio
async def test_alloydb_memory_real_mode_query_failure():
    """Test functionality for test_alloydb_memory_real_mode_query_failure."""
    with (
        patch.dict(os.environ, {"DATABASE_URL": "postgresql://user:pass@host/db"}),
        patch("agents.memory._USE_MOCK", False),
        patch("agents.memory._embed", new_callable=AsyncMock) as mock_embed,
        patch("agents.memory._get_pool", new_callable=AsyncMock) as mock_get_pool,
    ):
        mock_embed.return_value = [0.1] * 768
        mock_pool = MagicMock()
        mock_pool.acquire.return_value.__aenter__.side_effect = Exception("DB Error")
        mock_get_pool.return_value = mock_pool

        mem = AlloyDBMemory()
        res = await mem.get_historical_context("GATE_3")
        assert res == []


@pytest.mark.asyncio
async def test_store_intervention_failure():
    """Test functionality for test_store_intervention_failure."""
    with (
        patch.dict(os.environ, {"DATABASE_URL": "postgresql://user:pass@host/db"}),
        patch("agents.memory._USE_MOCK", False),
        patch("agents.memory._get_pool", new_callable=AsyncMock) as mock_get_pool,
    ):
        mock_pool = MagicMock()
        mock_pool.acquire.return_value.__aenter__.side_effect = Exception("Store Error")
        mock_get_pool.return_value = mock_pool

        mem = AlloyDBMemory()
        # Should not raise exception, just log it
        await mem.store_intervention("GATE_3", "action", "reasoning")


@pytest.mark.asyncio
async def test_log_agent_run_failure():
    """Test functionality for test_log_agent_run_failure."""
    with (
        patch.dict(os.environ, {"DATABASE_URL": "postgresql://user:pass@host/db"}),
        patch("agents.memory._USE_MOCK", False),
        patch("agents.memory._get_pool", new_callable=AsyncMock) as mock_get_pool,
    ):
        mock_pool = MagicMock()
        mock_pool.acquire.return_value.__aenter__.side_effect = Exception("Log Error")
        mock_get_pool.return_value = mock_pool

        mem = AlloyDBMemory()
        await mem.log_agent_run("test", "v1", 1, 1)


@pytest.mark.asyncio
async def test_alloydb_memory_real_mode_success():
    """Test functionality for test_alloydb_memory_real_mode_success."""
    with (
        patch.dict(os.environ, {"DATABASE_URL": "postgresql://user:pass@host/db"}),
        patch("agents.memory._USE_MOCK", False),
        patch("agents.memory._embed", new_callable=AsyncMock) as mock_embed,
        patch("agents.memory._get_pool", new_callable=AsyncMock) as mock_get_pool,
    ):
        mock_embed.return_value = [0.1] * 768
        mock_pool = MagicMock()
        mock_conn = AsyncMock()
        mock_conn.fetch.return_value = [
            {
                "incident_id": "I1",
                "description_text": "D1",
                "interventions_json": "[]",
                "failure_modes": ["M1"],
                "similarity_score": 0.9,
            }
        ]
        mock_pool.acquire.return_value.__aenter__.return_value = mock_conn
        mock_get_pool.return_value = mock_pool

        mem = AlloyDBMemory()

        # Test Success Query
        res = await mem.get_historical_context("GATE_3")
        assert len(res) == 1
        assert res[0]["incident_id"] == "I1"

        # Test Success Store
        await mem.store_intervention("GATE_3", "A", "R")
        mock_conn.execute.assert_called()

        # Test Success Log
        await mem.log_agent_run("T", "v1", 1, 1)
        assert mock_conn.execute.call_count >= 2
