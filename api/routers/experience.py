"""
Experience router — attendee recommendations via Experience Agent.
"""
import logging
from fastapi import APIRouter, Query
from agents.experience_agent import run_experience_recommendations

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get(
    "/experience/recommendations",
    summary="Get personalized attendee recommendations"
)
async def get_recommendations(
    zone: str = Query("SECTION_101", examples=["SECTION_101"])
) -> dict:
    """
    Invokes Experience Agent for venue navigation
    and timing recommendations for an attendee in a specific zone.
    """
    return await run_experience_recommendations(zone)
