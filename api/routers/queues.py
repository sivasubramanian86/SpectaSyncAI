"""Queues router — surfaces real-time wait times via Queue Agent."""
import logging
from fastapi import APIRouter, HTTPException
from agents.queue_agent import run_queue_analysis

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get(
    "/queues",
    summary="Get wait times for all venue service zones"
)
async def get_all_queues() -> list[dict]:
    """Runs Queue Agent across all venue zones."""
    try:
        data = await run_queue_analysis()
        return data
    except Exception as e:
        logger.error(f"Queue Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/queues/{zone_id}",
    summary="Get wait time for a specific zone"
)
async def get_zone_queue(zone_id: str) -> dict:
    """Runs Queue Agent for a single venue zone."""
    try:
        data = await run_queue_analysis()
        zone_data = [d for d in data if d.get("zone_id") == zone_id]
        if not zone_data:
            return {"zone_id": zone_id, "error": "No data for zone"}
        return zone_data[0]
    except Exception as e:
        logger.error(f"Zone Queue Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
