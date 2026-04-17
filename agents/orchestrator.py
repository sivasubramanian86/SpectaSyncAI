"""
SpectaSyncAI: Core Orchestrator Agent
Powered by Google ADK (google-adk) + Gemini 2.5 Pro
Responsibility: Spatial reasoning over venue telemetry, querying historical
AlloyDB memory, and invoking MCP tools via MCPToolset for real-world interventions.
"""
import json
import logging
import os

from google.adk.agents import LlmAgent
from google.adk.runners import InMemoryRunner
from google.adk.tools.mcp_tool.mcp_toolset import MCPToolset, SseConnectionParams
from google.genai import types as genai_types

from agents.memory import AlloyDBMemory
from .context_cache import get_cached_model_pro


logger = logging.getLogger(__name__)


MCP_SERVER_URL = os.getenv("MCP_SERVER_URL", "http://localhost:8001/sse")


async def build_orchestrator_agent(cache_name: str | None = None) -> LlmAgent:
    """
    Constructs the Core Orchestrator ADK Agent using Gemini 2.5 Pro.
    Connects to the FastMCP server via MCPToolset (SSE transport).

    Returns:
        LlmAgent: Fully configured orchestrator with MCP tools loaded.
    """
    # Load MCP Toolset — discovers tools from the running FastMCP server
    mcp_toolset = MCPToolset(
        connection_params=SseConnectionParams(url=MCP_SERVER_URL)
    )
    mcp_tools = await mcp_toolset.load_tools()
    logger.info(f"[Orchestrator] Loaded {len(mcp_tools)} tools from MCP server.")

    # Caching disabled for agents with tools to avoid Vertex AI 400 error
    # until tool baking in cache is fully verified.
    return LlmAgent(
        model=os.getenv("MODEL_PRO", "gemini-2.5-pro"),
        name="core_orchestrator",
        description=(
            "Core decision-making agent for SpectaSyncAI. "
            "It processes real-time venue state and historical patterns to "
            "dispatch venue interventions via MCP tools."
        ),
        instruction=(
            "You are the SpectaSyncAI Core Orchestrator. "
            "You receive live crowd density telemetry from the Vision Agent. "
            "You have access to historical incident patterns from AlloyDB. "
            "Your job is to decide whether intervention is needed. "
            "If density_score > 0.80 or bottleneck_detected is True, you MUST "
            "call an appropriate MCP tool (update_digital_signage or dispatch_staff). "
            "Always justify your decision and state the specific location and action taken."
        ),
        tools=mcp_tools
    )


async def run_orchestration_cycle(density_report: dict) -> dict:
    """
    Single orchestration cycle: takes a density report, retrieves historical
    context, and runs the ADK orchestrator agent to decide and act.

    Args:
        density_report: Output from VisionAgent containing density_score,
                        bottleneck_detected, and location_id.

    Returns:
        dict: Agent response with action taken and reasoning.
    """
    # 1. Retrieve historical AlloyDB context (RAG)
    memory = AlloyDBMemory()
    history = await memory.get_historical_context(density_report.get("location_id", "UNKNOWN"))

    # 2. Build the LlmAgent with live MCP tools
    cache_name = await get_cached_model_pro("core_orchestrator")
    agent = await build_orchestrator_agent(cache_name=cache_name)
    session_service = InMemorySessionService()
    runner = InMemoryRunner(agent=agent, session_service=session_service)

    session = await session_service.create_session(
        app_name="spectasync_orchestrator", user_id="system"
    )

    # 3. Compose prompt with state + history
    state_prompt = (
        f"LIVE TELEMETRY:\n{json.dumps(density_report, indent=2)}\n\n"
        f"HISTORICAL PATTERNS FROM ALLOYDB:\n{json.dumps(history, indent=2)}\n\n"
        "Based on the above, assess the situation and invoke the correct MCP tool if required."
    )

    result_text = ""
    tool_calls_made = []

    async for event in runner.run_async(
        user_id="system",
        session_id=session.id,
        new_message=genai_types.Content(
            role="user",
            parts=[genai_types.Part(text=state_prompt)],
        ),
    ):
        # Track tool invocations for the audit log
        if hasattr(event, "tool_call") and event.tool_call:
            tool_calls_made.append({
                "tool": event.tool_call.name,
                "args": dict(event.tool_call.args),
            })

        if event.is_final_response() and event.content:
            for part in event.content.parts:
                if part.text:
                    result_text += part.text

    logger.info(f"[Orchestrator] Final reasoning: {result_text}")
    logger.info(f"[Orchestrator] Tools invoked: {tool_calls_made}")

    return {
        "action_taken": tool_calls_made,
        "agent_reasoning": result_text,
        "density_report": density_report,
    }
