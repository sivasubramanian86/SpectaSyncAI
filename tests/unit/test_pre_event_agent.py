"""Unit tests for Agent 12: Pre-Event Strategic Analyst."""

import pytest
import json
from agents.pre_event_agent import run_pre_event_analysis, build_pre_event_agent
from unittest.mock import AsyncMock, MagicMock, patch


@pytest.mark.asyncio
async def test_run_pre_event_analysis_mock():
    """Verify pre-event analysis logic and JSON parsing."""
    mock_response = {
        "risk_level": "High",
        "expected_crowd_peak": 95000,
        "weather_impact": "None",
        "pro_con_summary": "Good",
        "precautionary_measures": ["None"],
        "strategic_recommendation": "Activate auxiliary gate North.",
    }

    with patch("agents.pre_event_agent.InMemoryRunner") as MockRunner:
        mock_runner = MagicMock()
        MockRunner.return_value = mock_runner
        mock_runner.session_service.create_session = AsyncMock(
            return_value=MagicMock(id="test")
        )

        mock_event = MagicMock()
        mock_event.is_final_response.return_value = True
        mock_event.content.parts = [MagicMock(text=json.dumps(mock_response))]

        async def fake_run(*args, **kwargs):
            """Test functionality for fake_run."""
            yield mock_event

        mock_runner.run_async = fake_run

        mock_data = {
            "occupancy": 85000,
            "capacity": 100000,
            "weather": {"temp": 38, "condition": "Sunny"},
        }

        res = await run_pre_event_analysis(mock_data)
        assert res["risk_level"] == "High"
        assert res["expected_crowd_peak"] == 95000


@pytest.mark.asyncio
async def test_pre_event_data_structure():
    """Verify the agent can be built and has correct instruction."""
    # build_pre_event_agent is a sync function
    agent = build_pre_event_agent()
    assert agent.name == "pre_event_analyst"
    assert "strategic analyst" in agent.instruction.lower()
