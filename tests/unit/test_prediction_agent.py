"""SpectaSyncAI: Unit Tests for Prediction Agent."""

import pytest
import json
from unittest.mock import AsyncMock, MagicMock, patch
from agents.prediction_agent import (
    build_prediction_agent,
    run_surge_prediction,
    get_historical_surge_data,
    calculate_surge_trajectory,
)


def test_build_prediction_agent() -> None:
    """Test functionality for test_build_prediction_agent."""
    agent = build_prediction_agent()
    assert agent.name == "prediction_agent"
    assert "gemini-2.5-pro" in agent.model


def test_get_historical_surge_data() -> None:
    """Test functionality for test_get_historical_surge_data."""
    res = get_historical_surge_data("GATE_1", 30)
    assert res["location_id"] == "GATE_1"
    assert res["window_minutes"] == 30
    assert len(res["historical_surges"]) > 0


def test_calculate_surge_trajectory() -> None:
    # Test normal
    """Test functionality for test_calculate_surge_trajectory."""
    res = calculate_surge_trajectory(0.3, 0.01)
    assert res["T+10_mins"]["level"] == "NORMAL"

    # Test critical
    res = calculate_surge_trajectory(0.85, 0.02)
    assert res["T+10_mins"]["level"] == "CRITICAL"

    # Test moderate/high
    res = calculate_surge_trajectory(0.5, 0.01)
    assert res["T+10_mins"]["level"] == "MODERATE"
    res = calculate_surge_trajectory(0.7, 0.01)
    assert res["T+10_mins"]["level"] == "HIGH"

    # Test zero buildup
    res = calculate_surge_trajectory(0.5, 0.0)
    assert res["peak_expected_at_mins"] is None


@pytest.mark.asyncio
async def test_run_surge_prediction_success() -> None:
    """Test functionality for test_run_surge_prediction_success."""
    mock_event = MagicMock()
    mock_event.is_final_response.return_value = True
    response_data = {
        "location_id": "GATE_1",
        "current_density": 0.5,
        "predicted_peak_time_mins": 15,
        "confidence_score": 85,
        "surge_level": "MODERATE",
        "forecast": {},
        "actionable_recommendations": ["test"],
    }
    mock_event.content.parts = [
        MagicMock(text=f"```json\n{json.dumps(response_data)}\n```")
    ]

    with patch("agents.prediction_agent.InMemoryRunner") as MockRunner:
        mock_session = AsyncMock()
        mock_session.id = "test-session"
        MockRunner.return_value.session_service.create_session = AsyncMock(
            return_value=mock_session
        )

        async def fake_run(*args, **kwargs):
            """Test functionality for fake_run."""
            yield mock_event

        MockRunner.return_value.run_async = fake_run

        result = await run_surge_prediction("GATE_1", 0.5)

    assert result["location_id"] == "GATE_1"
    assert result["confidence_score"] == 85


@pytest.mark.asyncio
async def test_run_surge_prediction_fallback() -> None:
    """Test functionality for test_run_surge_prediction_fallback."""
    mock_event = MagicMock()
    mock_event.is_final_response.return_value = True
    mock_event.content.parts = [MagicMock(text="Error in model output")]

    with patch("agents.prediction_agent.InMemoryRunner") as MockRunner:
        mock_session = AsyncMock()
        mock_session.id = "test-session-fallback"
        MockRunner.return_value.session_service.create_session = AsyncMock(
            return_value=mock_session
        )

        async def fake_run(*args, **kwargs):
            """Test functionality for fake_run."""
            yield mock_event

        MockRunner.return_value.run_async = fake_run

        result = await run_surge_prediction("GATE_FALLBACK", 0.8)

    assert result["location_id"] == "GATE_FALLBACK"
    assert "actionable_recommendations" in result
    assert result["surge_level"] == "CRITICAL"
