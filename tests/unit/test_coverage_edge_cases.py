"""
Edge case tests to achieve 100% code coverage.
Targets: Fallback blocks in crisis, telemetry, and main.
@14_quality_assurance_engineer
"""
import pytest
import os
import json
import base64
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app, raise_server_exceptions=False)

# ── Crisis Router Fallbacks ──────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_assess_perimeter_fallback():
    with patch("api.routers.crisis.run_perimeter_assessment", side_effect=Exception("Simulated error")):
        response = client.post(
            "/v1/crisis/perimeter",
            json={"venue_id": "stadium", "area_code": "123", "station_ids": []}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["is_fallback"] is True

@pytest.mark.asyncio
async def test_monitor_vip_delay_fallback():
    with patch("api.routers.crisis.run_vip_sync_monitoring", side_effect=Exception("Simulated error")):
        response = client.post(
            "/v1/crisis/vip-delay",
            json={"event_id": "evt-1", "venue_id": "v-1", "crowd_size": 1000, "density_score": 0.5}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["is_fallback"] is True

@pytest.mark.asyncio
async def test_monitor_rumors_fallback():
    with patch("api.routers.crisis.run_rumor_monitoring", side_effect=Exception("Simulated error")):
        response = client.post("/v1/crisis/rumor-monitor?venue_id=stadium")
        assert response.status_code == 200
        data = response.json()
        assert data["is_fallback"] is True

@pytest.mark.asyncio
async def test_check_infrastructure_fallback():
    with patch("api.routers.crisis.run_failsafe_monitoring", side_effect=Exception("Simulated error")):
        response = client.post(
            "/v1/crisis/infra-failsafe",
            json={"venue_id": "v1", "zones": ["Z1"]}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["is_fallback"] is True

@pytest.mark.asyncio
async def test_query_incident_rag_fallback():
    with patch("api.routers.crisis.run_incident_rag_query", side_effect=Exception("Simulated error")):
        response = client.post(
            "/v1/crisis/incident-rag",
            json={
                "active_failure_modes": ["EXOGENOUS_SURGE"],
                "venue_type": "stadium",
                "event_type": "sports"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["is_fallback"] is True

# ── Telemetry Router Fallbacks ───────────────────────────────────────────────

@pytest.mark.asyncio
async def test_ingest_telemetry_fallback():
    with patch("api.routers.telemetry.run_vision_analysis", side_effect=Exception("Vision error")):
        # Ensure it hits the 400 error for invalid base64 first to cover line 76-77
        response = client.post(
            "/v1/telemetry",
            json={"location_id": "v1", "image_b64": "!!!invalid!!!"}
        )
        assert response.status_code == 400

        # Now test the Vision analysis failure fallback (Line 83-91)
        # Using valid-looking base64
        response = client.post(
            "/v1/telemetry",
            json={"location_id": "v1", "image_b64": "YmFzZTY0"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["density_report"]["is_fallback"] is True

@pytest.mark.asyncio
async def test_orchestration_fallback():
    # Covers Lines 107-117 in telemetry.py (Orchestration failure)
    with patch("api.routers.telemetry.run_orchestration_cycle", side_effect=Exception("Orchestration Down")):
        response = client.post(
            "/v1/telemetry",
            json={"location_id": "v1", "density_override": 0.5}
        )
        assert response.status_code == 200
        data = response.json()
        assert "fail-safe mode" in data["agent_reasoning"]

# ── API Main Edge Cases ──────────────────────────────────────────────────────

def test_global_exception_handler():
    # Inject an error into the app dynamically to hit the global handler
    @app.get("/_force_error")
    async def force_error():
        raise Exception("Fatal Pipeline Failure")

    response = client.get("/_force_error")
    assert response.status_code == 500
    assert "error" in response.json()

def test_favicon():
    response = client.get("/favicon.ico")
    assert response.status_code == 200

def test_serve_dashboard_missing_index():
    with patch("os.path.exists", side_effect=lambda p: False if "index.html" in p else True):
        response = client.get("/")
        assert response.status_code == 200
        assert "Frontend not found" in response.text

# ── Agent Edge Cases ─────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_vision_agent_gcs_failure():
    from agents.vision_agent import archive_to_gcs
    with patch.dict(os.environ, {"GOOGLE_CLOUD_PROJECT": "p", "GCS_ENABLED": "1"}):
        with patch("google.cloud.storage.Client", side_effect=Exception("GCS Error")):
            res = archive_to_gcs("v1", b"data")
            assert "Local Sandbox" in res

@pytest.mark.asyncio
async def test_vision_agent_json_error():
    from agents.vision_agent import run_vision_analysis
    # We need to mock runner.run_async to yield a non-JSON response
    mock_event = MagicMock()
    mock_event.is_final_response.return_value = True
    mock_event.content.parts = [MagicMock(text="Not a JSON string")]

    async def mock_run_async(*args, **kwargs):
        yield mock_event

    with patch("google.adk.runners.InMemoryRunner.run_async", side_effect=mock_run_async):
        res = await run_vision_analysis("v1", b"data")
        assert res["density_score"] == 0.5 # Fallback value

@pytest.mark.asyncio
async def test_pre_event_agent_error():
    from agents.pre_event_agent import run_pre_event_analysis
    with patch("google.adk.runners.InMemoryRunner.run_async", side_effect=Exception("Fatal GenAI Error")):
        res = await run_pre_event_analysis({"venue_id": "v1"})
        assert res["is_fallback"] is True

@pytest.mark.asyncio
async def test_context_cache_warmer_failure():
    from agents.context_cache import warm_all_caches
    # Patch the get_or_create_cache inside warm_all_caches to trigger except block
    with patch("agents.context_cache.get_or_create_cache", side_effect=Exception("Warmup Fail")):
        await warm_all_caches()
        # Should not raise exception
