"""Interventions router - reads and lists historical interventions from AlloyDB."""

import logging
from fastapi import APIRouter
from agents.memory import AlloyDBMemory

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get(
    "/interventions/history",
    summary="Retrieve historical incident patterns from AlloyDB",
)
async def get_intervention_history(location_id: str = "GATE_3") -> dict:
    """Returns the RAG-retrieved historical surge patterns for a venue zone."""
    memory = AlloyDBMemory()
    history = await memory.get_historical_context(location_id)
    return {"location_id": location_id, "history": history}
