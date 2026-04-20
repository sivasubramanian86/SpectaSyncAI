"""SpectaSyncAI tests."""

import pytest
from unittest.mock import MagicMock, patch
from api.services.pubsub_service import PubSubService


@pytest.mark.asyncio
async def test_pubsub_service_initialization() -> None:
    # Test initialization when K_SERVICE is not set (Local/Dev)
    """Test functionality for test_pubsub_service_initialization."""
    with patch.dict("os.environ", {}, clear=True):
        service = PubSubService()
        assert service.enabled is False
        assert service.publisher is None


@pytest.mark.asyncio
async def test_pubsub_service_broadcast_mock() -> None:
    # Test broadcast in mock mode (enabled=False)
    """Test functionality for test_pubsub_service_broadcast_mock."""
    service = PubSubService()
    service.enabled = False

    risk_data = {"test": "data"}
    result = await service.broadcast_risk(risk_data)
    assert result is True


@pytest.mark.asyncio
async def test_pubsub_service_broadcast_enabled() -> None:
    # Test broadcast when enabled
    """Test functionality for test_pubsub_service_broadcast_enabled."""
    with patch("google.cloud.pubsub_v1.PublisherClient") as mock_client_class:
        mock_client = MagicMock()
        mock_client_class.return_value = mock_client
        mock_client.topic_path.return_value = "projects/test/topics/test"

        # Mock the future returned by publish
        mock_future = MagicMock()
        mock_future.result.return_value = "msg-123"
        mock_client.publish.return_value = mock_future

        with patch.dict(
            "os.environ",
            {"K_SERVICE": "test-service", "GOOGLE_CLOUD_PROJECT": "test-project"},
        ):
            service = PubSubService()
            assert service.enabled is True

            risk_data = {"key": "value"}
            result = await service.broadcast_risk(risk_data)

            assert result is True
            mock_client.publish.assert_called_once()


@pytest.mark.asyncio
async def test_pubsub_service_broadcast_not_found() -> None:
    # Test broadcast when topic is missing
    """Test functionality for test_pubsub_service_broadcast_not_found."""
    from google.api_core import exceptions

    with patch("google.cloud.pubsub_v1.PublisherClient") as mock_client_class:
        mock_client = MagicMock()
        mock_client_class.return_value = mock_client
        mock_client.topic_path.return_value = "projects/test/topics/missing"

        # Mock publish to raise NotFound
        mock_client.publish.side_effect = exceptions.NotFound("Topic not found")

        with patch.dict("os.environ", {"K_SERVICE": "test-service"}):
            service = PubSubService()
            result = await service.broadcast_risk({"test": "data"})
            assert result is False


@pytest.mark.asyncio
async def test_pubsub_service_initialization_error() -> None:
    # Test initialization failure
    """Test functionality for test_pubsub_service_initialization_error."""
    with (
        patch(
            "google.cloud.pubsub_v1.PublisherClient",
            side_effect=Exception("Auth error"),
        ),
        patch.dict("os.environ", {"K_SERVICE": "test-service"}),
    ):
        service = PubSubService()
        assert service.enabled is False
