"""SpectaSyncAI: Unit Tests for MCP Server Tools."""

import pytest
from mcp_server.server import (
    update_digital_signage,
    dispatch_staff,
    open_auxiliary_gate,
    trigger_pa_announcement,
    trigger_evacuation_protocol,
    send_attendee_push_notification,
    adjust_concession_staffing,
)


@pytest.mark.asyncio
async def test_update_digital_signage() -> None:
    """Test functionality for test_update_digital_signage."""
    res = await update_digital_signage("GATE_1", "Redirecting now")
    assert res["status"] == "success"
    assert res["location_id"] == "GATE_1"


@pytest.mark.asyncio
async def test_dispatch_staff() -> None:
    """Test functionality for test_dispatch_staff."""
    res = await dispatch_staff("ZONE_A", "high", 5)
    assert res["status"] == "dispatched"
    assert res["eta"] == "2 mins"

    # Test default eta
    res = await dispatch_staff("ZONE_A", "unknown")
    assert res["eta"] == "5 mins"


@pytest.mark.asyncio
async def test_open_auxiliary_gate() -> None:
    """Test functionality for test_open_auxiliary_gate."""
    res = await open_auxiliary_gate("AUX_3", "exit")
    assert res["status"] == "gate_opened"
    assert res["gate_id"] == "AUX_3"


@pytest.mark.asyncio
async def test_trigger_pa_announcement() -> None:
    """Test functionality for test_trigger_pa_announcement."""
    res = await trigger_pa_announcement("MAIN_HALL", "Please move", ["en", "hi"])
    assert res["status"] == "broadcasted"
    assert "hi" in res["languages"]


@pytest.mark.asyncio
async def test_trigger_evacuation_protocol() -> None:
    """Test functionality for test_trigger_evacuation_protocol."""
    res = await trigger_evacuation_protocol("ZONE_C", "full")
    assert res["status"] == "pending_authorization"
    assert res["human_approval_required"] is True


@pytest.mark.asyncio
async def test_send_attendee_push_notification() -> None:
    """Test functionality for test_send_attendee_push_notification."""
    res = await send_attendee_push_notification("ZONE_B", "Stay alert", "warning")
    assert res["status"] == "sent"
    assert res["urgency"] == "warning"


@pytest.mark.asyncio
async def test_adjust_concession_staffing() -> None:
    """Test functionality for test_adjust_concession_staffing."""
    res = await adjust_concession_staffing("STAND_4", "emergency_boost")
    assert res["status"] == "requested"
    assert res["additional_staff"] == 4

    res = await adjust_concession_staffing("STAND_4", "decrease")
    assert res["additional_staff"] == -1

    res = await adjust_concession_staffing("STAND_4", "unknown")
    assert res["additional_staff"] == 1
