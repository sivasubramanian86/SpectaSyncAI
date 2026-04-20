"""SpectaSyncAI: Final 100% Coverage Hardening
Closes all remaining pragma: no cover gaps across:
  - api/routers/observability.py  (line 27 — full endpoint body)
  - api/routers/pre_event.py      (lines 34-37 — GET fallback path)
  - api/routers/queues.py         (line 46 — zone not found)
  - agents/experience_agent.py    (lines 29, 52 — tool return values + JSON decode)
  - agents/rumor_control_agent.py (line 165 — viral_velocity > 5000 channel branch).

@14_quality_assurance_engineer — hardening sprint final pass.
"""

import pytest
from typing import AsyncIterator
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi.testclient import TestClient

from api.main import app

client = TestClient(app, raise_server_exceptions=False)


# ── observability.py: Line 27 — endpoint body coverage ──────────────────────


def test_observability_status_endpoint() -> None:
    """Hit the full body of observability_status() including service calls."""
    mock_status = {"enabled": True, "metrics_exported": 42}
    with patch("api.routers.observability.observability_service") as mock_obs:
        mock_obs.status.return_value = mock_status
        mock_obs.project_id = "test-proj"
        mock_obs.service_name = "spectasync-api"

        response = client.get("/v1/observability/status")
        assert response.status_code == 200
        data = response.json()
        assert data["cloud_logging"]["project_id"] == "test-proj"
        assert data["cloud_logging"]["service_name"] == "spectasync-api"
        assert data["cloud_logging"]["enabled"] is True
        mock_obs.status.assert_called_once()


# ── pre_event.py: Lines 34-37 — GET fallback when no analysis cached ─────────


def test_pre_event_get_returns_pending_when_no_cache() -> None:
    """Validate that the GET endpoint returns pending status when cache is empty.

    Covers lines 34-37 of pre_event.py.
    """
    # Patch the in-memory cache to be empty
    with patch(
        "api.routers.pre_event._LATEST_ANALYSIS", {"data": None, "last_updated": None}
    ):
        response = client.get("/v1/pre-event/analysis")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "pending_or_failed"
        assert data["risk_level"] == "UNKNOWN"


def test_pre_event_get_returns_cached_when_present() -> None:
    """Validate that the GET endpoint returns cached analysis when present.

    Covers the early-return branch at line 29-30.
    """
    cached = {"risk_level": "LOW", "strategic_recommendation": "All clear"}
    with patch(
        "api.routers.pre_event._LATEST_ANALYSIS",
        {"data": cached, "last_updated": "2026-04-20T00:00:00"},
    ):
        response = client.get("/v1/pre-event/analysis")
        assert response.status_code == 200
        data = response.json()
        assert data["risk_level"] == "LOW"


# ── queues.py: Line 46 — zone_id not found in result set ────────────────────


def test_get_zone_queue_not_found() -> None:
    """Validate the zone-not-found error branch in queue assessment.

    Covers line 44-45 of queues.py.
    """
    with patch(
        "api.routers.queues.run_queue_analysis",
        new=AsyncMock(return_value=[{"zone_id": "ZONE_X", "wait": 5}]),
    ):
        response = client.get("/v1/queues/ZONE_MISSING")
        assert response.status_code == 200
        data = response.json()
        assert data["error"] == "No data for zone"
        assert data["zone_id"] == "ZONE_MISSING"


def test_get_zone_queue_found() -> None:
    """Positive path: zone found in results — covers line 46."""
    with patch(
        "api.routers.queues.run_queue_analysis",
        new=AsyncMock(
            return_value=[{"zone_id": "GATE_NORTH", "estimated_wait_mins": 12}]
        ),
    ):
        response = client.get("/v1/queues/GATE_NORTH")
        assert response.status_code == 200
        data = response.json()
        assert data["zone_id"] == "GATE_NORTH"
        assert data["estimated_wait_mins"] == 12


# ── experience_agent.py: Lines 29, 52 — tool return values ───────────────────


def test_experience_agent_get_low_density_zones() -> None:
    """Directly call get_low_density_zones() to cover line 29 return block."""
    from agents.experience_agent import get_low_density_zones

    result = get_low_density_zones()
    assert "low_density_zones" in result
    zones = result["low_density_zones"]
    assert len(zones) == 4
    assert zones[0]["zone_id"] == "GATE_EAST"
    assert zones[0]["density"] == 0.28


def test_experience_agent_get_venue_event_schedule() -> None:
    """Directly call get_venue_event_schedule() to cover line 52 return block."""
    from agents.experience_agent import get_venue_event_schedule

    result = get_venue_event_schedule()
    assert "upcoming_events" in result
    events = result["upcoming_events"]
    assert len(events) == 3
    assert events[0]["event"] == "Halftime"
    assert events[0]["expected_crowd_surge"] == "HIGH"


def test_experience_agent_get_venue_event_schedule_custom_n() -> None:
    """Covers the next_n_events parameter path."""
    from agents.experience_agent import get_venue_event_schedule

    result = get_venue_event_schedule(next_n_events=1)
    # Returns fixed seed data regardless — just ensure it's callable
    assert "upcoming_events" in result


@pytest.mark.asyncio
async def test_experience_agent_json_decode_fallback() -> None:
    """Force a JSONDecodeError in run_experience_recommendations to cover
    lines 154-194 (the fallback recommendation block).
    """

    async def _mock_runner_gen(mock_event: MagicMock) -> AsyncIterator[MagicMock]:
        """Simulate agent run yielding mock event."""
        yield mock_event

    mock_event = MagicMock()
    mock_event.is_final_response.return_value = True
    mock_event.content.parts = [MagicMock(text="NOT_VALID_JSON {{{")]

    with patch("agents.experience_agent.InMemoryRunner") as MockRunner:
        mock_runner = MagicMock()
        MockRunner.return_value = mock_runner
        mock_runner.session_service.create_session = AsyncMock(
            return_value=MagicMock(id="sess_1")
        )
        mock_runner.run_async = MagicMock(return_value=_mock_runner_gen(mock_event))
        with patch("agents.experience_agent.observability_service") as mock_obs:
            mock_obs.schedule_agent_run = MagicMock()
            from agents.experience_agent import run_experience_recommendations

            result = await run_experience_recommendations("SECTION_101")

    assert "recommendations" in result
    assert result["best_time_to_move"] == "Now (before halftime surge in 18 mins)"
    assert "GATE_NORTH" in result["avoid_zones"]
    # Verify observability was called with fallback=True
    mock_obs.schedule_agent_run.assert_called_once()
    call_kwargs = mock_obs.schedule_agent_run.call_args[1]
    assert call_kwargs["fallback"] is True
    assert call_kwargs["status"] == "fallback"


# ── rumor_control_agent.py: Line 165 — viral_velocity > 5000 branch ──────────


def test_classify_rumor_risk_sms_broadcast_channel() -> None:
    """Validate that high velocity rumors trigger critical broadcast channels.

    Covers line 165 of rumor_control_agent.py.
    """
    from agents.rumor_control_agent import classify_rumor_risk

    result = classify_rumor_risk(
        rumor_text="gates are open",
        category="UNAUTHORIZED_ENTRY",
        viral_velocity=6000,  # > 5000 triggers line 165
    )
    assert "SMS_BROADCAST" in result["required_channels"]
    assert "VENUE_APP" in result["required_channels"]
    assert result["risk_level"] == "CRITICAL"
    assert result["counter_broadcast_urgency_secs"] == 12


def test_classify_rumor_risk_moderate_velocity() -> None:
    """viral_velocity between 1000-5000 — HIGH risk, no SMS."""
    from agents.rumor_control_agent import classify_rumor_risk

    result = classify_rumor_risk(
        rumor_text="everyone come in",
        category="PANIC_CONTAGION",
        viral_velocity=2000,
    )
    assert "MOBILE_PUSH" in result["required_channels"]
    assert "SMS_BROADCAST" not in result["required_channels"]
    assert result["risk_level"] == "HIGH"


def test_classify_rumor_risk_low_velocity() -> None:
    """viral_velocity <= 1000 — MODERATE risk, only PA_SYSTEM."""
    from agents.rumor_control_agent import classify_rumor_risk

    result = classify_rumor_risk(
        rumor_text="small crowd",
        category="CAPACITY_MISINFORMATION",
        viral_velocity=500,
    )
    assert result["required_channels"] == ["PA_SYSTEM_ALL_ZONES"]
    assert result["risk_level"] == "MODERATE"
    assert result["counter_broadcast_urgency_secs"] == 60


@pytest.mark.asyncio
async def test_rumor_control_json_decode_fallback_with_high_danger() -> None:
    """Validate the fallback mechanism for rumor monitoring during high danger scenarios.

    Exercises the full fallback block including broadcast path.
    """

    async def _mock_gen(mock_event: MagicMock) -> AsyncIterator[MagicMock]:
        """Simulate rumor scan result generator."""
        yield mock_event

    mock_event = MagicMock()
    mock_event.is_final_response.return_value = True
    # Non-JSON text forces json.loads to raise JSONDecodeError
    mock_event.content.parts = [MagicMock(text="UNPARSEABLE")]

    with patch("agents.rumor_control_agent.InMemoryRunner") as MockRunner:
        mock_runner = MagicMock()
        MockRunner.return_value = mock_runner
        mock_runner.session_service = MagicMock()
        mock_runner.session_service.create_session = AsyncMock(
            return_value=MagicMock(id="sess_rumor")
        )
        mock_runner.run_async = MagicMock(return_value=_mock_gen(mock_event))

        # Force scan to return a high-danger scenario so broadcast is triggered
        high_danger_scan = {
            "venue_id": "VENUE_1",
            "scan_timestamp_utc": "2026-04-20T10:00:00+00:00",
            "posts_scanned": 2840,
            "rumors_detected": [
                {
                    "category": "STRUCTURAL_PANIC",
                    "severity": 0.95,
                    "viral_velocity_per_5min": 6500,  # > 5000
                    "sample_text_hash": "0xabc123",
                    "platform": "platform_A",
                }
            ],
            "max_danger_score": 0.95,
            "danger_level": "CRITICAL",
            "analogous_incidents": ["INC-2013-IND-01"],
        }

        with (
            patch(
                "agents.rumor_control_agent.scan_social_media_for_rumors",
                return_value=high_danger_scan,
            ),
            patch(
                "agents.rumor_control_agent.get_cached_model_flash",
                new=AsyncMock(return_value=None),
            ),
            patch("agents.rumor_control_agent.observability_service") as mock_obs,
        ):
            mock_obs.schedule_agent_run = MagicMock()
            from agents.rumor_control_agent import run_rumor_monitoring

            result = await run_rumor_monitoring("VENUE_1")

    assert result["venue_id"] == "VENUE_1"
    assert result["broadcast_activated"] is True
    assert result["max_danger_score"] == 0.95
    # Observability called with fallback=True
    call_kwargs = mock_obs.schedule_agent_run.call_args[1]
    assert call_kwargs["fallback"] is True
