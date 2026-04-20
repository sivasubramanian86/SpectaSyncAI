"""SpectaSyncAI tests."""

import pytest
import os
from unittest.mock import MagicMock, patch, AsyncMock
from agents.failsafe_mesh_agent import (
    monitor_infrastructure_health,
    activate_ble_mesh_broadcast,
    dispatch_offline_staff_routing,
    request_emergency_generator,
    run_failsafe_monitoring,
)
from agents.perimeter_macro_agent import (
    query_cell_tower_load,
    query_transit_ridership_anomalies,
    calculate_capacity_breach_risk,
    activate_street_diversion_protocol,
    run_perimeter_assessment,
)
from agents.rumor_control_agent import (
    scan_social_media_for_rumors,
    classify_rumor_risk,
    broadcast_counter_narrative,
    run_rumor_monitoring,
)
from agents.vip_sync_agent import (
    get_convoy_gps_position,
    calculate_crowd_kinetic_energy,
    activate_crowd_engagement_program,
    calculate_arrival_surge_vector,
    run_vip_sync_monitoring,
)
from agents.queue_agent import run_queue_analysis
from agents.experience_agent import run_experience_recommendations
from agents.vision_agent import archive_to_gcs


@pytest.mark.asyncio
async def test_failsafe_agent_tools() -> None:
    """Test functionality for test_failsafe_agent_tools."""
    mock_rng = MagicMock()
    mock_rng.uniform.return_value = 1.5
    mock_rng.random.return_value = 0.1
    mock_rng.randint.return_value = 50

    with patch("secrets.SystemRandom", return_value=mock_rng):
        res = monitor_infrastructure_health("V1", ["Z1", "Z2"])
        assert res["overall_status"] == "DEGRADED"
        assert res["immediate_action_required"] is True

    res = activate_ble_mesh_broadcast("V1", ["Z1"], "SAFE_EGRESS_ROUTING")
    assert res["status"] == "BLE_MESH_ACTIVE"

    res = dispatch_offline_staff_routing("V1", {"Z1": 0.8, "Z2": 0.1})
    assert len(res["staff_assignments"]) == 1

    res = request_emergency_generator("V1", ["Z1"])
    assert res["status"] == "GENERATOR_REQUESTED"


@pytest.mark.asyncio
async def test_failsafe_agent_fallback() -> None:
    """Test functionality for test_failsafe_agent_fallback."""
    with patch("agents.failsafe_mesh_agent.InMemoryRunner") as MockRunner:
        mock_event = MagicMock()
        mock_event.is_final_response.return_value = True
        mock_event.content.parts = [MagicMock(text="MALFORMED")]

        async def fake_run(*args, **kwargs):
            """Test functionality for fake_run."""
            yield mock_event

        MockRunner.return_value.run_async = fake_run
        MockRunner.return_value.session_service.create_session = AsyncMock(
            return_value=MagicMock(id="test")
        )

        res = await run_failsafe_monitoring("V1", ["Z1"])
        assert "infra_status" in res


@pytest.mark.asyncio
async def test_perimeter_agent_tools() -> None:
    """Test functionality for test_perimeter_agent_tools."""
    mock_rng = MagicMock()
    mock_rng.uniform.side_effect = [4.0, 3.5, 3.5]  # for cell tower, then 2 stations

    with patch("secrets.SystemRandom", return_value=mock_rng):
        res = query_cell_tower_load("12345")
        assert res["avg_network_load_ratio"] == 4.0

        res = query_transit_ridership_anomalies(["S1", "S2"])
        # 3.5 * 12000 * 2 = 84000 (> 80000 = CRITICAL)
        assert res["aggregate_alert_level"] == "CRITICAL"

    res = calculate_capacity_breach_risk("concert_arena", 100000)
    assert res["risk_classification"] == "CRITICAL"

    res = activate_street_diversion_protocol("V1", ["C1"], ["D1"])
    assert res["status"] == "ACTIVATED"


@pytest.mark.asyncio
async def test_perimeter_agent_fallback() -> None:
    """Test functionality for test_perimeter_agent_fallback."""
    with patch("agents.perimeter_macro_agent.InMemoryRunner") as MockRunner:
        mock_event = MagicMock()
        mock_event.is_final_response.return_value = True
        mock_event.content.parts = [MagicMock(text="INVALID")]

        async def fake_run(*args, **kwargs):
            """Test functionality for fake_run."""
            yield mock_event

        MockRunner.return_value.run_async = fake_run
        MockRunner.return_value.session_service.create_session = AsyncMock(
            return_value=MagicMock(id="test")
        )
        res = await run_perimeter_assessment("G1", "12345", ["S1"])
        assert "venue_id" in res


@pytest.mark.asyncio
async def test_rumor_control_agent_tools() -> None:
    # scan_social_media_for_rumors
    """Test functionality for test_rumor_control_agent_tools."""
    res = scan_social_media_for_rumors("V1")
    assert res["venue_id"] == "V1"

    # classify_rumor_risk
    res = classify_rumor_risk("hash", "UNAUTHORIZED_ENTRY", 2000)
    assert res["risk_level"] == "HIGH"

    # broadcast_counter_narrative
    res = broadcast_counter_narrative("V1", ["PA"], "UNAUTHORIZED_ENTRY", ["en"])
    assert res["status"] == "BROADCAST_SENT"


@pytest.mark.asyncio
async def test_rumor_control_agent_fallback() -> None:
    """Test functionality for test_rumor_control_agent_fallback."""
    with patch("agents.rumor_control_agent.InMemoryRunner") as MockRunner:
        mock_event = MagicMock()
        mock_event.is_final_response.return_value = True
        mock_event.content.parts = [MagicMock(text="INVALID")]

        async def fake_run(*args, **kwargs):
            """Test functionality for fake_run."""
            yield mock_event

        MockRunner.return_value.run_async = fake_run
        MockRunner.return_value.session_service.create_session = AsyncMock(
            return_value=MagicMock(id="test")
        )
        res = await run_rumor_monitoring("V1")
        assert "venue_id" in res


@pytest.mark.asyncio
async def test_vip_sync_agent_tools() -> None:
    # get_convoy_gps_position
    """Test functionality for test_vip_sync_agent_tools."""
    res = get_convoy_gps_position("E1")
    assert "delay_mins" in res

    # calculate_crowd_kinetic_energy
    res = calculate_crowd_kinetic_energy(60, 50000, 0.8)
    assert res["surge_coefficient"] > 0

    # activate_crowd_engagement_program
    res = activate_crowd_engagement_program("Z1", "MUSIC_STREAM", 30)
    assert res["status"] == "ACTIVATED"

    # calculate_arrival_surge_vector
    res = calculate_arrival_surge_vector("V1", 20, 5.0)
    assert len(res["high_risk_zones"]) > 0


@pytest.mark.asyncio
async def test_vip_sync_agent_fallback() -> None:
    """Test functionality for test_vip_sync_agent_fallback."""
    with patch("agents.vip_sync_agent.InMemoryRunner") as MockRunner:
        mock_event = MagicMock()
        mock_event.is_final_response.return_value = True
        mock_event.content.parts = [MagicMock(text="INVALID")]

        async def fake_run(*args, **kwargs):
            """Test functionality for fake_run."""
            yield mock_event

        MockRunner.return_value.run_async = fake_run
        MockRunner.return_value.session_service.create_session = AsyncMock(
            return_value=MagicMock(id="test")
        )
        res = await run_vip_sync_monitoring("E1", "V1", 50000, 0.7)
        assert "event_id" in res


@pytest.mark.asyncio
async def test_queue_agent_tools() -> None:
    """Test functionality for test_queue_agent_tools."""
    from agents.queue_agent import get_zone_queue_snapshot, calculate_wait_time

    # get_zone_queue_snapshot
    res = get_zone_queue_snapshot("GATE_NORTH")
    assert res["zone_id"] == "GATE_NORTH"
    assert "queue_length" in res

    # calculate_wait_time
    res = calculate_wait_time(45, 45)
    assert res["estimated_wait_mins"] == 1.0
    assert res["priority"] == "NORMAL"


@pytest.mark.asyncio
async def test_queue_agent_fallback() -> None:
    """Test functionality for test_queue_agent_fallback."""
    with patch("agents.queue_agent.InMemoryRunner") as MockRunner:
        mock_event = MagicMock()
        mock_event.is_final_response.return_value = True
        mock_event.content.parts = [MagicMock(text="INVALID")]

        async def fake_run(*args, **kwargs):
            """Test functionality for fake_run."""
            yield mock_event

        MockRunner.return_value.run_async = fake_run
        MockRunner.return_value.session_service.create_session = AsyncMock(
            return_value=MagicMock(id="test")
        )
        res = await run_queue_analysis(["Z1"])
        assert isinstance(res, list)


@pytest.mark.asyncio
async def test_experience_agent_fallback() -> None:
    """Test functionality for test_experience_agent_fallback."""
    with patch("agents.experience_agent.InMemoryRunner") as MockRunner:
        mock_event = MagicMock()
        mock_event.is_final_response.return_value = True
        mock_event.content.parts = [MagicMock(text="MALFORMED_JSON")]

        async def fake_run(*args, **kwargs):
            """Test functionality for fake_run."""
            yield mock_event

        MockRunner.return_value.run_async = fake_run

        # Mock session service creation which is nested in runner in this agent
        MockRunner.return_value.session_service.create_session = AsyncMock(
            return_value=MagicMock(id="test")
        )

        res = await run_experience_recommendations("ZONE_A")
        assert "recommendations" in res
        assert res["attendee_zone"] == "ZONE_A"


@pytest.mark.asyncio
async def test_rumor_control_agent_cache_failure() -> None:
    # Covers lines 265-266 where get_cached_model_flash fails
    """Test functionality for test_rumor_control_agent_cache_failure."""
    with (
        patch(
            "agents.rumor_control_agent.get_cached_model_flash",
            side_effect=Exception("Cache down"),
        ),
        patch("agents.rumor_control_agent.InMemoryRunner") as MockRunner,
    ):
        mock_event = MagicMock()
        mock_event.is_final_response.return_value = True
        mock_event.content.parts = [MagicMock(text='{"risk": "LOW"}')]

        async def fake_run(*args, **kwargs):
            """Test functionality for fake_run."""
            yield mock_event

        MockRunner.return_value.run_async = fake_run
        MockRunner.return_value.session_service.create_session = AsyncMock(
            return_value=MagicMock(id="test")
        )

        res = await run_rumor_monitoring("V1")
        assert res is not None


def test_vision_agent_archive_gcs_failure() -> None:
    # Covers lines 65-67 where storage.Client() or upload fails
    """Test functionality for test_vision_agent_archive_gcs_failure."""
    with (
        patch.dict(os.environ, {"GOOGLE_CLOUD_PROJECT": "p1", "GCS_ENABLED": "1"}),
        patch(
            "agents.vision_agent.storage.Client", side_effect=Exception("Auth error")
        ),
    ):
        res = archive_to_gcs("Z1", b"fake_image")
        assert "mock_" in res
        assert "(Local Sandbox)" in res
