"""
SpectaSyncAI: Unit Tests for Core Orchestrator
"""
import pytest
import json
from unittest.mock import AsyncMock, patch, MagicMock
from agents.orchestrator import build_orchestrator_agent, run_orchestration_cycle

@pytest.mark.asyncio
async def test_build_orchestrator():
    with patch("agents.orchestrator.MCPToolset") as MockToolset:
        mock_tool = MagicMock()
        MockToolset.return_value.load_tools = AsyncMock(return_value=[mock_tool])
        agent = await build_orchestrator_agent()
        assert agent.name == "core_orchestrator"
        assert len(agent.tools) == 1

@pytest.mark.asyncio
async def test_run_orchestration_cycle_with_tool_calls():
    with patch("agents.orchestrator.build_orchestrator_agent", new_callable=AsyncMock) as mock_build, \
         patch("agents.orchestrator.AlloyDBMemory.get_historical_context", new_callable=AsyncMock) as mock_history, \
         patch("agents.orchestrator.InMemoryRunner") as MockRunner, \
         patch("agents.orchestrator.InMemorySessionService") as MockSession:
        
        mock_history.return_value = [{"incident": "test"}]
        mock_build.return_value = MagicMock()
        
        # Mocking tool call events and final response
        class MockEvent:
            def __init__(self, tool_call=None, final_text=None):
                self.tool_call = tool_call
                self.content = MagicMock()
                self.content.parts = [MagicMock(text=final_text)] if final_text else []
            def is_final_response(self):
                return bool(self.content.parts)

        tool_call = MagicMock()
        tool_call.name = "test_tool"
        tool_call.args = {"a": 1}
        
        events = [
            MockEvent(tool_call=tool_call),
            MockEvent(final_text="Decision made.")
        ]
        
        async def fake_run(*args, **kwargs):
            for e in events:
                yield e
                
        MockRunner.return_value.run_async = fake_run
        MockSession.return_value.create_session = AsyncMock(return_value=MagicMock(id="test"))
        
        res = await run_orchestration_cycle({"location_id": "L1", "density_score": 0.9})
        assert len(res["action_taken"]) == 1
        assert res["action_taken"][0]["tool"] == "test_tool"
        assert "Decision" in res["agent_reasoning"]
