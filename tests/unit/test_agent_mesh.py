"""
SpectaSyncAI: Unit Tests for 12-Agent Mesh
Tests build and run functions for all Tier-1 and Tier-2 agents.
Normalized for Google ADK Async/Await patterns.
"""
import pytest
import json
from unittest.mock import AsyncMock, MagicMock, patch
from agents import (
    build_vision_agent, run_vision_analysis,
    build_orchestrator_agent, run_orchestration_cycle,
    build_prediction_agent, run_surge_prediction,
    build_queue_agent, run_queue_analysis,
    build_safety_agent, run_safety_assessment,
    build_experience_agent, run_experience_recommendations,
    build_perimeter_macro_agent, run_perimeter_assessment,
    build_vip_sync_agent, run_vip_sync_monitoring,
    build_rumor_control_agent, run_rumor_monitoring,
    build_failsafe_mesh_agent, run_failsafe_monitoring,
    build_incident_rag_agent, run_incident_rag_query
)

@pytest.mark.parametrize("build_fn, expected_name", [
    (build_vision_agent, "vision_agent"),
    (build_prediction_agent, "prediction_agent"),
    (build_queue_agent, "queue_agent"),
    (build_safety_agent, "safety_agent"),
    (build_experience_agent, "experience_agent"),
    (build_perimeter_macro_agent, "perimeter_macro_agent"),
    (build_vip_sync_agent, "vip_sync_agent"),
    (build_rumor_control_agent, "rumor_control_agent"),
    (build_failsafe_mesh_agent, "failsafe_mesh_agent"),
    (build_incident_rag_agent, "incident_rag_agent"),
])
def test_agent_builders(build_fn, expected_name):
    agent = build_fn()
    assert agent.name == expected_name

@pytest.mark.asyncio
async def test_build_orchestrator_agent():
    with patch("agents.orchestrator.MCPToolset") as MockToolset:
        MockToolset.return_value.load_tools = AsyncMock(return_value=[])
        agent = await build_orchestrator_agent()
        assert agent.name == "core_orchestrator"

async def mock_runner_gen(mock_event):
    yield mock_event

def setup_mock_runner(MockRunner, response_text):
    mock_runner = MagicMock()
    MockRunner.return_value = mock_runner
    
    mock_runner.session_service.create_session = AsyncMock(return_value=MagicMock(id="test_session"))
    
    mock_event = MagicMock()
    mock_event.is_final_response.return_value = True
    mock_event.content.parts = [MagicMock(text=response_text)]
    
    mock_runner.run_async = MagicMock(return_value=mock_runner_gen(mock_event))
    return mock_runner

@pytest.mark.asyncio
async def test_run_queue_analysis():
    with patch("agents.queue_agent.InMemoryRunner") as MockRunner:
        setup_mock_runner(MockRunner, '[{"wait_time": 15}]')
        result = await run_queue_analysis(["STAND_1"])
        assert result[0]["wait_time"] == 15

@pytest.mark.asyncio
async def test_run_experience_recommendations():
    with patch("agents.experience_agent.InMemoryRunner") as MockRunner:
        setup_mock_runner(MockRunner, '{"engagement_score": 0.9}')
        result = await run_experience_recommendations("EVENT_1")
        assert result["engagement_score"] == 0.9

@pytest.mark.asyncio
async def test_run_perimeter_assessment():
    with patch("agents.perimeter_macro_agent.InMemoryRunner") as MockRunner:
        setup_mock_runner(MockRunner, '{"breach_probability": 0.2}')
        result = await run_perimeter_assessment("VENUE_1", "560001", ["STATION_1"])
        assert result["breach_probability"] == 0.2

@pytest.mark.asyncio
async def test_run_vip_sync_monitoring():
    with patch("agents.vip_sync_agent.InMemoryRunner") as MockRunner:
        setup_mock_runner(MockRunner, '{"kinetic_energy": 0.5}')
        result = await run_vip_sync_monitoring("EVT_1", "VENUE_1", 1000, 0.5)
        assert result["kinetic_energy"] == 0.5

@pytest.mark.asyncio
async def test_run_rumor_monitoring():
    with patch("agents.rumor_control_agent.InMemoryRunner") as MockRunner:
        setup_mock_runner(MockRunner, '{"rumor_detected": true}')
        result = await run_rumor_monitoring("VENUE_1")
        assert result["rumor_detected"] is True

@pytest.mark.asyncio
async def test_run_failsafe_monitoring():
    with patch("agents.failsafe_mesh_agent.InMemoryRunner") as MockRunner:
        setup_mock_runner(MockRunner, '{"failsafe_active": false}')
        result = await run_failsafe_monitoring("VENUE_1", ["ZONE_1"])
        assert result["failsafe_active"] is False
