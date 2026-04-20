"""SpectaSyncAI: Unit Tests for Core Orchestrator."""

import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from agents.orchestrator import build_orchestrator_agent, run_orchestration_cycle


@pytest.mark.asyncio
async def test_build_orchestrator():
    """Verifies that the orchestrator initializes correctly with dynamic MCP tool injection."""
    with patch("agents.orchestrator.MCPToolset") as MockToolset:
        mock_tool = MagicMock()
        MockToolset.return_value.load_tools = AsyncMock(return_value=[mock_tool])
        agent = await build_orchestrator_agent()
        assert agent.name == "core_orchestrator"
        assert len(agent.tools) == 1


@pytest.mark.asyncio
async def test_run_orchestration_cycle_with_tool_calls():
    """Tests the full orchestration loop including agent reasoning, tool selection, and execution."""
    with (
        patch(
            "agents.orchestrator.build_orchestrator_agent", new_callable=AsyncMock
        ) as mock_build,
        patch(
            "agents.orchestrator.AlloyDBMemory.get_historical_context",
            new_callable=AsyncMock,
        ) as mock_history,
        patch("agents.orchestrator.InMemoryRunner") as MockRunner,
    ):
        mock_history.return_value = [{"incident": "test"}]
        mock_build.return_value = MagicMock()

        # Mocking tool call events and final response
        class MockEvent:
            """Test functionality for MockEvent."""

            def __init__(self, tool_call=None, final_text=None):
                """Test functionality for __init__."""
                self.tool_call = tool_call
                self.content = MagicMock()
                self.content.parts = [MagicMock(text=final_text)] if final_text else []

            def is_final_response(self):
                """Test functionality for is_final_response."""
                return bool(self.content.parts)

        tool_call = MagicMock()
        tool_call.name = "test_tool"
        tool_call.args = {"a": 1}

        events = [
            MockEvent(tool_call=tool_call),
            MockEvent(final_text="Decision made."),
        ]

        async def fake_run(*args, **kwargs):
            """Test functionality for fake_run."""
            for e in events:
                yield e

        MockRunner.return_value.run_async = fake_run
        MockRunner.return_value.session_service.create_session = AsyncMock(
            return_value=MagicMock(id="test")
        )

        res = await run_orchestration_cycle({"location_id": "L1", "density_score": 0.9})
        assert len(res["action_taken"]) == 1
        assert res["action_taken"][0]["tool"] == "test_tool"
        assert "Decision" in res["agent_reasoning"]


@pytest.mark.asyncio
async def test_run_orchestration_cycle_high_risk_broadcast():
    """Validates that critical safety thresholds trigger automated high-priority Pub/Sub broadcasts."""
    with (
        patch(
            "agents.orchestrator.build_orchestrator_agent", new_callable=AsyncMock
        ) as mock_build,
        patch(
            "agents.orchestrator.AlloyDBMemory.get_historical_context",
            new_callable=AsyncMock,
        ) as mock_history,
        patch("agents.orchestrator.InMemoryRunner") as MockRunner,
        patch(
            "agents.orchestrator.pubsub_service.broadcast_risk", new_callable=AsyncMock
        ) as mock_broadcast,
    ):
        mock_history.return_value = []
        mock_build.return_value = MagicMock()

        # High-risk density report
        density_report = {
            "location_id": "L1",
            "density_score": 0.98,
            "risk_confidence": 0.85,
        }

        class MockEvent:
            """Test functionality for MockEvent."""

            def __init__(self, final_text):
                """Test functionality for __init__."""
                self.tool_call = None
                self.content = MagicMock()
                self.content.parts = [MagicMock(text=final_text)]

            def is_final_response(self):
                """Test functionality for is_final_response."""
                return True

        async def fake_run(*args, **kwargs):
            """Test functionality for fake_run."""
            yield MockEvent("High risk alert triggered.")

        MockRunner.return_value.run_async = fake_run
        MockRunner.return_value.session_service.create_session = AsyncMock(
            return_value=MagicMock(id="test")
        )

        await run_orchestration_cycle(density_report)
        # Broadcast should have been called (via create_task, but we mock the method)
        # Actually asyncio.create_task makes it hard to await here unless we mock the service itself nicely
        # But since we patched it as AsyncMock, we can check if it was called (eventually)
        # In unit tests, we can just check if it was awaited if we don't use create_task,
        # but since we DO use it, we check .called
        assert mock_broadcast.called


@pytest.mark.asyncio
async def test_run_orchestration_cycle_failure_exception():
    """Ensures robust error handling when dependency services (like AlloyDB) are unavailable."""
    with (
        patch("agents.orchestrator.build_orchestrator_agent", new_callable=AsyncMock),
        patch(
            "agents.orchestrator.AlloyDBMemory.get_historical_context",
            new_callable=AsyncMock,
        ) as mock_history,
        patch("agents.orchestrator.InMemoryRunner"),
    ):
        mock_history.side_effect = Exception("AlloyDB Down")

        res = await run_orchestration_cycle({"location_id": "L1"})
        assert "technical error" in res["agent_reasoning"]
        assert res["error"] == "AlloyDB Down"
