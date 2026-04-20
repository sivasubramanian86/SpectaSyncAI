"""Interventions router - reads and lists historical interventions from AlloyDB."""

import logging
from typing import Any
from fastapi import APIRouter
from agents.memory import AlloyDBMemory

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get(
    "/interventions/history",
    summary="Retrieve historical incident patterns from AlloyDB",
)
async def get_intervention_history(location_id: str = "GATE_3") -> dict[str, Any]:
    """Return the RAG-retrieved historical surge patterns for a venue zone.

    Args:
    ----
        location_id: Zone identifier.

    Returns:
    -------
        dict[str, Any]: Historical intervention records and location context.

    """
    memory = AlloyDBMemory()
    history = await memory.get_historical_context(location_id)
    return {"location_id": location_id, "history": history}
