"""
SpectaSyncAI: Unit Tests for Context Cache Module (google-genai SDK)
"""
import pytest
from unittest.mock import MagicMock, patch, AsyncMock
from agents.context_cache import (
    build_system_prompt,
    get_or_create_cache,
    get_cached_model,
    warm_all_caches
)

def test_build_system_prompt():
    prompt = build_system_prompt("core_orchestrator")
    assert "Core Orchestrator" in prompt
    assert "SpectaSyncAI" in prompt

@pytest.mark.asyncio
async def test_get_or_create_cache_hit():
    """Test that existing cache is returned if found in list()."""
    mock_client = MagicMock()
    mock_cache = MagicMock()
    mock_cache.display_name = "specta-vip_sync-gemini-2.1-pro"
    mock_client.caches.list.return_value = [mock_cache]
    
    with patch("agents.context_cache.get_client", return_value=mock_client):
        res = await get_or_create_cache("vip_sync", "models/gemini-2.1-pro")
        assert res == mock_cache
        mock_client.caches.list.assert_called()
        mock_client.caches.create.assert_not_called()

@pytest.mark.asyncio
async def test_get_or_create_cache_miss_create():
    """Test that new cache is created if not found in list()."""
    mock_client = MagicMock()
    mock_client.caches.list.return_value = [] # Empty list = Miss
    mock_client.caches.create.return_value = MagicMock(display_name="new-cache")
    
    with patch("agents.context_cache.get_client", return_value=mock_client):
        res = await get_or_create_cache("vip_sync", "models/gemini-2.5-pro")
        assert res is not None
        mock_client.caches.create.assert_called_once()

@pytest.mark.asyncio
async def test_get_cached_model_success():
    """Test that get_cached_model returns the string name of the cache."""
    mock_cache = MagicMock()
    mock_cache.name = "projects/p/locations/l/cachedContents/c1"
    
    with patch("agents.context_cache.get_or_create_cache", new_callable=AsyncMock) as mock_get_cache:
        mock_get_cache.return_value = mock_cache
        res = await get_cached_model("vip_sync", "model")
        assert res == "projects/p/locations/l/cachedContents/c1"

@pytest.mark.asyncio
async def test_warm_all_caches():
    """Test that warm_all_caches triggers cache creation for all agents."""
    with patch("agents.context_cache.get_or_create_cache", new_callable=AsyncMock) as mock_get_cache:
        await warm_all_caches()
        # Adjusted for 12-agent mesh (7 warmed in the list)
        assert mock_get_cache.call_count >= 7

@pytest.mark.asyncio
async def test_context_cache_failures():
    """Test resilience when client or cache creation fails."""
    mock_client = MagicMock()
    mock_client.caches.list.side_effect = Exception("API Error")
    mock_client.caches.create.side_effect = Exception("Create Error")
    
    with patch("agents.context_cache.get_client", return_value=mock_client):
        # Should return None instead of raising
        res = await get_or_create_cache("core_orchestrator", "model")
        assert res is None
