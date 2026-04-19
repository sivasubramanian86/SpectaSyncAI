"""SpectaSyncAI: Unit Tests for Vision Agent
Tests use mock runner to avoid actual Vertex AI calls in CI.
"""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from agents.vision_agent import build_vision_agent, run_vision_analysis


def test_build_vision_agent_returns_agent():
    """Agents should be constructable without I/O."""
    agent = build_vision_agent()
    assert agent.name == "vision_agent"
    assert "gemini-2.5-flash" in agent.model


@pytest.mark.asyncio
async def test_run_vision_analysis_with_mock_runner():
    """Vision agent pipeline should parse density JSON from the model response."""
    mock_event = MagicMock()
    mock_event.is_final_response.return_value = True
    mock_event.content.parts = [
        MagicMock(
            text='{"density_score": 0.87, "bottleneck_detected": true, "location_id": "GATE_3"}'
        )
    ]

    with (
        patch("agents.vision_agent.InMemoryRunner") as MockRunner,
        patch("agents.vision_agent.InMemorySessionService") as MockSession,
    ):
        mock_session = AsyncMock()
        mock_session.id = "test-session-001"
        MockSession.return_value.create_session = AsyncMock(return_value=mock_session)

        async def fake_run(*args, **kwargs):
            """Test functionality for fake_run."""
            yield mock_event

        MockRunner.return_value.run_async = fake_run

        result = await run_vision_analysis("GATE_3", b"fake-image-bytes")

    assert result["density_score"] == 0.87
    assert result["bottleneck_detected"] is True
    assert result["location_id"] == "GATE_3"


def test_analyze_cctv_frame_tool():
    """Test the tool function directly."""
    from agents.vision_agent import analyze_cctv_frame

    res = analyze_cctv_frame("ZONE_1", "base64data")
    assert res["location_id"] == "ZONE_1"
    assert "density_score" in res


@pytest.mark.asyncio
async def test_run_vision_analysis_malformed_json_fallback():
    """Test fallback when JSON is malformed."""
    mock_event = MagicMock()
    mock_event.is_final_response.return_value = True
    mock_event.content.parts = [MagicMock(text="Not a JSON")]

    with (
        patch("agents.vision_agent.InMemoryRunner") as MockRunner,
        patch("agents.vision_agent.InMemorySessionService") as MockSession,
    ):
        mock_session = AsyncMock()
        mock_session.id = "test-session-002"
        MockSession.return_value.create_session = AsyncMock(return_value=mock_session)

        async def fake_run(*args, **kwargs):
            """Test functionality for fake_run."""
            yield mock_event

        MockRunner.return_value.run_async = fake_run

        result = await run_vision_analysis("ZONE_ERROR", b"bytes")

    assert result["location_id"] == "ZONE_ERROR"
    assert result["density_score"] == 0.5
    assert result["bottleneck_detected"] is False
