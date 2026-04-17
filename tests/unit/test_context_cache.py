"""
SpectaSyncAI: Unit Tests for Context Cache Module
"""
import pytest
import os
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
    with patch("vertexai.preview.caching.CachedContent.get") as mock_get:
        mock_get.return_value = MagicMock()
        res = await get_or_create_cache("vip_sync", "model_name")
        assert res is not None
        mock_get.assert_called_once()

@pytest.mark.asyncio
async def test_get_or_create_cache_miss_create():
    with patch("vertexai.preview.caching.CachedContent.get", side_effect=Exception("Miss")), \
         patch("vertexai.preview.caching.CachedContent.create") as mock_create:
        mock_create.return_value = MagicMock()
        res = await get_or_create_cache("vip_sync", "model_name")
        assert res is not None
        mock_create.assert_called_once()

@pytest.mark.asyncio
async def test_get_or_create_cache_import_error():
    with patch("builtins.__import__", side_effect=ImportError("test")):
        res = await get_or_create_cache("vip_sync", "model_name")
        assert res is None

@pytest.mark.asyncio
async def test_get_cached_model_success():
    with patch("agents.context_cache.get_or_create_cache", new_callable=AsyncMock) as mock_get_cache, \
         patch("vertexai.generative_models.GenerativeModel.from_cached_content") as mock_from_cached:
        
        mock_get_cache.return_value = MagicMock()
        mock_from_cached.return_value = MagicMock()
        
        res = await get_cached_model("vip_sync", "model")
        assert res is not None

@pytest.mark.asyncio
async def test_get_cached_model_fallback():
    with patch("agents.context_cache.get_or_create_cache", new_callable=AsyncMock) as mock_get_cache, \
         patch("vertexai.generative_models.GenerativeModel") as mock_gen_model:
        
        mock_get_cache.return_value = None
        mock_gen_model.return_value = MagicMock()
        
        res = await get_cached_model("vip_sync", "model")
        assert res is not None

@pytest.mark.asyncio
async def test_warm_all_caches():
    with patch("agents.context_cache.get_or_create_cache", new_callable=AsyncMock) as mock_get_cache:
        await warm_all_caches()
        assert mock_get_cache.call_count >= 5

@pytest.mark.asyncio
async def test_context_cache_failures():
    with patch("vertexai.init"), \
         patch("vertexai.preview.caching.CachedContent.get", side_effect=Exception("Get Error")), \
         patch("vertexai.preview.caching.CachedContent.create", side_effect=Exception("Create Error")), \
         patch.dict(os.environ, {"GOOGLE_CLOUD_PROJECT": "p"}):
        
        # get_or_create_cache returns None on dual failure
        res = await get_or_create_cache("core_orchestrator", "model")
        assert res is None
        
    with patch("agents.context_cache.get_or_create_cache", side_effect=Exception("Outer Error")):
        # get_cached_model returns None on outer exception
        res = await get_cached_model("key", "model")
        assert res is None

@pytest.mark.asyncio
async def test_warm_all_caches_failure():
    with patch("agents.context_cache.get_or_create_cache", side_effect=Exception("Warm failure")):
        # Should not raise
        await warm_all_caches()
