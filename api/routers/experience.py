"""Experience router - attendee recommendations via Experience Agent."""

import logging
from typing import Any

from fastapi import APIRouter, Query

from agents.experience_agent import run_experience_recommendations

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get(
    "/experience/recommendations", summary="Get personalized attendee recommendations"
)
async def get_recommendations(
    zone: str = Query("SECTION_101", examples=["SECTION_101"]),
) -> dict[str, Any]:
    """Invoke Experience Agent for venue navigation.

    Provide timing recommendations for an attendee in a specific zone.

    Args:
    ----
        zone: Current attendee location zone.

    Returns:
    -------
        dict[str, Any]: Personalized recommendations and timing data.

    """
    return await run_experience_recommendations(zone)
