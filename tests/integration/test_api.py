"""SpectaSyncAI tests."""

from unittest.mock import patch, AsyncMock
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app, raise_server_exceptions=False)


def test_api_root():
    """Test functionality for test_api_root."""
    response = client.get("/")
    assert response.status_code == 200


def test_health_check():
    """Test functionality for test_health_check."""
    response = client.get("/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_telemetry_endpoints():
    """Test standard telemetry ingestion."""
    p_vision = "api.routers.telemetry.run_vision_analysis"
    p_orch = "api.routers.telemetry.run_orchestration_cycle"
    with patch(p_vision, new_callable=AsyncMock) as mock_vision:
        mock_vision.return_value = {"location_id": "L1", "density_score": 0.5}
        with patch(p_orch, new_callable=AsyncMock) as mock_orch:
            mock_orch.return_value = {
                "density_report": {"density_score": 0.5},
                "action_taken": [],
                "agent_reasoning": "Test reasoning",
            }
            payload = {"location_id": "L1", "density_override": 0.5}
            response = client.post("/v1/telemetry", json=payload)
            assert response.status_code == 200
            assert response.json()["location_id"] == "L1"


def test_predictions_surge():
    """Test functionality for test_predictions_surge."""
    p_surge = "api.routers.predictions.run_surge_prediction"
    with patch(p_surge, new_callable=AsyncMock) as mock_run:
        mock_run.return_value = {"prediction": "No clear surge"}
        payload = {"location_id": "L1", "current_density": 0.5}
        response = client.post("/v1/predictions/surge", json=payload)
        assert response.status_code == 200


def test_queues_wait_time():
    """Test functionality for test_queues_wait_time."""
    p_queue = "api.routers.queues.run_queue_analysis"
    with patch(p_queue, new_callable=AsyncMock) as mock_run:
        mock_run.return_value = [{"zone_id": "Z1", "wait_time_minutes": 5}]
        response = client.get("/v1/queues")
        assert response.status_code == 200


def test_safety_audit():
    """Test functionality for test_safety_audit."""
    p_safety = "api.routers.safety.run_safety_assessment"
    with patch(p_safety, new_callable=AsyncMock) as mock_run:
        mock_run.return_value = {"risk_level": "LOW"}
        payload = {"location_id": "L1", "density_score": 0.5}
        response = client.post("/v1/safety/assess", json=payload)
        assert response.status_code == 200


def test_experience_engagement():
    """Test functionality for test_experience_engagement."""
    p_exp = "api.routers.experience.run_experience_recommendations"
    with patch(p_exp, new_callable=AsyncMock) as mock_run:
        mock_run.return_value = {"recommendations": []}
        url = "/v1/experience/recommendations?location_id=L1"
        response = client.get(url)
        assert response.status_code == 200


def test_crisis_endpoints():
    """Test crisis mesh status and perimeter."""
    response = client.get("/v1/crisis/status")
    assert response.status_code == 200

    p_perim = "api.routers.crisis.run_perimeter_assessment"
    with patch(p_perim, new_callable=AsyncMock) as mock_perim:
        mock_perim.return_value = {"external_load": "low"}
        payload = {"venue_id": "V1", "area_code": "560001", "station_ids": ["S1"]}
        response = client.post("/v1/crisis/perimeter", json=payload)
        assert response.status_code == 200


def test_incident_rag_endpoints():
    """Test incident RAG search and corpus."""
    p_rag = "api.routers.crisis.run_incident_rag_query"
    with patch(p_rag, new_callable=AsyncMock) as mock_rag:
        mock_rag.return_value = {"answer": "Test answer"}
        payload = {
            "active_failure_modes": ["EXOGENOUS_SURGE"],
            "venue_type": "stadium",
            "event_type": "sports",
            "capacity_ratio": 1.0,
            "vip_delay": False,
            "infra_failure": False,
            "rumor_detected": False,
        }
        response = client.post("/v1/crisis/incident-rag", json=payload)
        assert response.status_code == 200

    response = client.get("/v1/crisis/incident-corpus")
    assert response.status_code == 200
    assert len(response.json()["incidents"]) > 0


def test_lifespan_events():
    """Test functionality for test_lifespan_events."""
    with patch("agents.context_cache.warm_all_caches", new_callable=AsyncMock):
        with TestClient(app):
            pass


def test_lifespan_events_disabled():
    """Test functionality for test_lifespan_events_disabled."""
    with patch("os.getenv", return_value=None), TestClient(app):
        pass


def test_lifespan_exception():
    """Test functionality for test_lifespan_exception."""
    p_warm = "agents.context_cache.warm_all_caches"
    with patch(p_warm, side_effect=Exception("Cache error")):
        with patch("os.getenv", return_value="test-proj"):
            with TestClient(app):
                pass


def test_static_file_serving():
    """Test functionality for test_static_file_serving."""
    response = client.get("/")
    assert response.status_code == 200


def test_interventions_execute_not_found():
    """Test functionality for test_interventions_execute_not_found."""
    payload = {"intervention_id": "invalid", "params": {}}
    response = client.post("/v1/interventions/execute", json=payload)
    assert response.status_code == 404


def test_interventions_execute_failure():
    """Test functionality for test_interventions_execute_failure."""
    p_mem = "api.routers.interventions.AlloyDBMemory.get_historical_context"
    with patch(p_mem, new_callable=AsyncMock) as mock_get:
        mock_get.return_value = []
        response = client.get("/v1/interventions/history?location_id=L1")
        assert response.status_code == 200
        assert response.json()["location_id"] == "L1"


def test_telemetry_failures():
    """Test failure branches in telemetry."""
    p_orch = "api.routers.telemetry.run_orchestration_cycle"
    with patch(p_orch, side_effect=Exception("Orch Error")):
        payload = {"location_id": "L1", "density_override": 0.5}
        response = client.post("/v1/telemetry", json=payload)
        assert response.status_code == 200
        assert response.json()["action_taken"][0]["status"] == "PENDING"

    p_vision = "api.routers.telemetry.run_vision_analysis"
    with patch(p_vision, side_effect=Exception("Vision Error")):
        payload = {"location_id": "L1", "image_b64": "YmFzZTY0"}
        response = client.post("/v1/telemetry", json=payload)
        assert response.status_code == 200
        assert response.json()["density_report"]["is_fallback"] is True


def test_predictions_failure():
    """Test functionality for test_predictions_failure."""
    p_surge = "api.routers.predictions.run_surge_prediction"
    with patch(p_surge, side_effect=Exception("Pred Error")):
        payload = {"location_id": "L1", "current_density": 0.5}
        response = client.post("/v1/predictions/surge", json=payload)
        assert response.status_code == 200
        assert response.json()["is_fallback"] is True


def test_queues_invalid():
    """Test queue failure paths."""
    p_queue = "api.routers.queues.run_queue_analysis"
    with patch(p_queue, side_effect=Exception("Queue Error")):
        response = client.get("/v1/queues")
        assert response.status_code == 200
        assert response.json()[0]["is_fallback"] is True

    with patch(p_queue, side_effect=Exception("Individual Queue Error")):
        response = client.get("/v1/queues/ZONE_A")
        assert response.status_code == 200
        assert response.json()["is_fallback"] is True

    with patch(p_queue, new_callable=AsyncMock) as mock_run:
        mock_run.return_value = []
        response = client.get("/v1/queues/INVALID_ZONE")
        assert response.status_code == 200
        assert "error" in response.json()


def test_predictions_surge_get():
    """Test functionality for test_predictions_surge_get."""
    p_surge = "api.routers.predictions.run_surge_prediction"
    with patch(p_surge, new_callable=AsyncMock) as mock_run:
        mock_run.return_value = {"prediction": "Surge confirmed"}
        response = client.get("/v1/predictions/surge/ZONE_A?density=0.85")
        assert response.status_code == 200
        assert response.json()["prediction"] == "Surge confirmed"


def test_telemetry_get_single_success():
    """Test functionality for test_telemetry_get_single_success."""
    response = client.get("/v1/telemetry/ZONE_A")
    assert response.status_code == 200
    assert response.json()["location_id"] == "ZONE_A"


def test_pre_event_flow():
    # Clear the global cache to test initial state if possible
    # But since it's a module global, we might just check if it's there
    """Test functionality for test_pre_event_flow."""
    response = client.get("/v1/pre-event/analysis")
    assert response.status_code == 200
    # It might be SUCCESS from lifespan or pending if lifespan didn't finish
    assert "status" in response.json() or "risk_level" in response.json()

    # Test POST analysis (Success)
    p_pre = "api.routers.pre_event.run_pre_event_analysis"
    with patch(p_pre, new_callable=AsyncMock) as mock_analysis:
        mock_analysis.return_value = {"status": "SUCCESS", "risk_level": "LOW"}
        payload = {
            "event_name": "Test Event",
            "total_reservations": 100,
            "venue_capacity": 200,
            "expected_peak_time": "12:00",
            "weather_forecast": {"temp": 25},
        }
        response = client.post("/v1/pre-event/analysis", json=payload)
        assert response.status_code == 200
        assert response.json()["risk_level"] == "LOW"

    # Test GET analysis (Cached)
    response = client.get("/v1/pre-event/analysis")
    assert response.status_code == 200
    assert response.json()["risk_level"] == "LOW"

    # Test POST breakdown/failure
    with patch(p_pre, side_effect=Exception("Analyst went on strike")):
        response = client.post("/v1/pre-event/analysis", json=payload)
        assert response.status_code == 200
        assert "fallback" in response.json()["risk_level"].lower()


def test_runtime_config_js():
    """Test functionality for test_runtime_config_js."""
    response = client.get("/v1/runtime-config.js")
    assert response.status_code == 200
    assert "window.__SPECTASYNC_RUNTIME__" in response.text
    assert "application/javascript" in response.headers["content-type"]


def test_global_exception_handler():
    # Force a 500 by mocking memory in interventions to throw
    """Test functionality for test_global_exception_handler."""
    p_mem = "api.routers.interventions.AlloyDBMemory.get_historical_context"
    with patch(p_mem, side_effect=RuntimeError("AlloyDB Crash")):
        response = client.get("/v1/interventions/history?location_id=L1")
        assert response.status_code == 500
        assert "detail" in response.json()


def test_pre_event_mock_data():
    """Test functionality for test_pre_event_mock_data."""
    response = client.get("/v1/pre-event/mock-data")
    assert response.status_code == 200
    assert "event_name" in response.json()
