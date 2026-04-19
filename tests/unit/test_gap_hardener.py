"""SpectaSyncAI: Comprehensive Testing for MCP Tools & PubSub Logic
@14_quality_assurance_engineer: Closing coverage gaps for 100% score.
"""

import pytest
from unittest.mock import patch, MagicMock
from mcp_server.server import search_missing_person, adjust_concession_staffing
from api.services.pubsub_service import PubSubService


@pytest.mark.asyncio
async def test_search_missing_person_critical():
    """Test specialized vulnerability priority in MCP missing person search."""
    # Test child (vulnerable)
    res = await search_missing_person("ref_123", "ZONE_A", "child")
    assert res["status"] == "active_search"
    assert res["priority_level"] == "CRITICAL"

    # Test general
    res = await search_missing_person("ref_123", "ZONE_A", "general")
    assert res["priority_level"] == "HIGH"


@pytest.mark.asyncio
async def test_adjust_concession_staffing_variants():
    """Test all staffing action variants."""
    res = await adjust_concession_staffing("S1", "increase")
    assert res["additional_staff"] == 2

    res = await adjust_concession_staffing("S1", "decrease")
    assert res["additional_staff"] == -1

    res = await adjust_concession_staffing("S1", "emergency_boost")
    assert res["additional_staff"] == 4
    assert res["eta_mins"] == 3


@pytest.mark.asyncio
async def test_pubsub_service_production_mock():
    """Test PubSubService internal mechanics by forcing production mode."""
    with patch("os.getenv") as mock_env:

        def getenv_side_effect(key, default=None):
            """Test functionality for getenv_side_effect."""
            if key == "K_SERVICE":
                return "spectasync-api"
            if key == "GOOGLE_CLOUD_PROJECT":
                return "test-proj"
            return default

        mock_env.side_effect = getenv_side_effect

        with patch("google.cloud.pubsub_v1.PublisherClient"):
            # Test successful init
            service = PubSubService()
            assert service.enabled is True

            # Test successful broadcast
            mock_future = MagicMock()
            mock_future.result.return_value = "msg_123"
            service.publisher.publish.return_value = mock_future

            res = await service.broadcast_risk({"id": "risk_1"})
            assert res is True
            service.publisher.publish.assert_called_once()

            # Test NotFound exception
            from google.api_core import exceptions

            service.publisher.publish.side_effect = exceptions.NotFound(
                "Topic not found"
            )
            res = await service.broadcast_risk({"id": "risk_1"})
            assert res is False


@pytest.mark.asyncio
async def test_pubsub_init_failure():
    """Test PubSub initialization failure path."""
    with (
        patch("os.getenv", return_value="PROD"),
        patch(
            "google.cloud.pubsub_v1.PublisherClient",
            side_effect=Exception("Auth Error"),
        ),
    ):
        service = PubSubService()
        assert service.enabled is False
