"""SpectaSyncAI: Unit Tests for Safety Agent."""

import pytest
import json
from unittest.mock import AsyncMock, MagicMock, patch
from agents.safety_agent import (
    build_safety_agent,
    run_safety_assessment,
    classify_safety_risk,
    get_emergency_contact_list,
)


def test_build_safety_agent() -> None:
    """Test functionality for test_build_safety_agent."""
    agent = build_safety_agent()
    assert agent.name == "safety_agent"
    assert "gemini-2.5-pro" in agent.model


def test_classify_safety_risk_emergency() -> None:
    # Emergency by density
    """Test functionality for test_classify_safety_risk_emergency."""
    res = classify_safety_risk(0.96, 0.01)
    assert res["risk_level"] == "EMERGENCY"
    assert res["human_approval_required"] is True

    # Emergency by rate
    res = classify_safety_risk(0.5, 0.06)
    assert res["risk_level"] == "EMERGENCY"


def test_classify_safety_risk_critical() -> None:
    """Test functionality for test_classify_safety_risk_critical."""
    res = classify_safety_risk(0.89, 0.01)
    assert res["risk_level"] == "CRITICAL"
    assert res["human_approval_required"] is False


def test_classify_safety_risk_elevated() -> None:
    """Test functionality for test_classify_safety_risk_elevated."""
    res = classify_safety_risk(0.5, 0.01)
    assert res["risk_level"] == "ELEVATED"


def test_get_emergency_contact_list() -> None:
    """Test functionality for test_get_emergency_contact_list."""
    res = get_emergency_contact_list()
    assert "local_police" in res
    assert "ambulance" in res


@pytest.mark.asyncio
async def test_run_safety_assessment_success() -> None:
    """Test functionality for test_run_safety_assessment_success."""
    mock_event = MagicMock()
    mock_event.is_final_response.return_value = True
    response_data = {
        "risk_level": "MODERATE",
        "protocol": "MONITOR",
        "immediate_actions": ["test"],
        "summary": "all good",
    }
    mock_event.content.parts = [MagicMock(text=json.dumps(response_data))]

    with patch("agents.safety_agent.InMemoryRunner") as MockRunner:
        mock_session = AsyncMock()
        mock_session.id = "test-session"
        MockRunner.return_value.session_service.create_session = AsyncMock(
            return_value=mock_session
        )

        async def fake_run(*args, **kwargs):
            """Test functionality for fake_run."""
            yield mock_event

        MockRunner.return_value.run_async = fake_run

        result = await run_safety_assessment("ZONE_1", 0.5, 0.01)

    assert result["risk_level"] == "MODERATE"


@pytest.mark.asyncio
async def test_run_safety_assessment_fallback() -> None:
    """Test functionality for test_run_safety_assessment_fallback."""
    mock_event = MagicMock()
    mock_event.is_final_response.return_value = True
    mock_event.content.parts = [MagicMock(text="Bad JSON")]

    with patch("agents.safety_agent.InMemoryRunner") as MockRunner:
        mock_session = AsyncMock()
        mock_session.id = "test-session-fallback"
        MockRunner.return_value.session_service.create_session = AsyncMock(
            return_value=mock_session
        )

        async def fake_run(*args, **kwargs):
            """Test functionality for fake_run."""
            yield mock_event

        MockRunner.return_value.run_async = fake_run

        result = await run_safety_assessment("ZONE_EMERGENCY", 0.96)

    assert result["risk_level"] == "EMERGENCY"
    assert "summary" in result
