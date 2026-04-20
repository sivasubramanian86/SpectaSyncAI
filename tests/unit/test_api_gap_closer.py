from unittest.mock import patch, AsyncMock
import pytest
from fastapi.testclient import TestClient

from api.main import app

@pytest.fixture(autouse=True)
def mock_startup_tasks():
    with patch(
        "api.routers.pre_event.trigger_pre_event_analysis", new_callable=AsyncMock
    ), patch("agents.context_cache.warm_all_caches", new_callable=AsyncMock):
        yield


def test_api_gaps():
    client = TestClient(app)
    # Mock agent calls to avoid quota issues and latency
    with patch(
        "api.routers.pre_event.run_pre_event_analysis", new_callable=AsyncMock
    ) as mock_pre, patch(
        "api.routers.predictions.run_surge_prediction", new_callable=AsyncMock
    ) as mock_pred, patch(
        "api.routers.safety.run_safety_assessment", new_callable=AsyncMock
    ) as mock_safe:

        mock_pre.return_value = {"analysis": "mock"}
        mock_pred.return_value = {"surge_detected": False}
        mock_safe.return_value = {"risk_level": "low"}

        # Health Router
        response = client.get("/v1/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"

        # Crisis Router
        response = client.get("/v1/crisis/incident-corpus")
        assert response.status_code == 200

        response = client.get("/v1/crisis/status")
        assert response.status_code == 200

        # Experience Router
        with patch(
            "api.routers.experience.run_experience_recommendations",
            new_callable=AsyncMock,
        ) as mock_exp:
            mock_exp.return_value = {"recommendations": []}
            response = client.get("/v1/experience/recommendations?zone=SECTION_101")
            assert response.status_code == 200

        # Interventions Router
        response = client.get("/v1/interventions/history?location_id=GATE_3")
        assert response.status_code == 200

        # Pre-Event Router
        response = client.get("/v1/pre-event/analysis")
        assert response.status_code == 200

        response = client.post(
            "/v1/pre-event/analysis",
            json={
                "event_name": "Test Event",
                "total_reservations": 10000,
                "venue_capacity": 15000,
                "expected_peak_time": "18:00",
                "weather_forecast": {"temp": 25, "precip": 0},
            },
        )
        assert response.status_code == 200

        # Predictions Router
        response = client.post(
            "/v1/predictions/surge",
            json={"location_id": "GATE_NORTH", "current_density": 0.5},
        )
        assert response.status_code == 200

        response = client.get("/v1/predictions/surge/GATE_NORTH")
        assert response.status_code == 200

        # Queues Router
        response = client.get("/v1/queues")
        assert response.status_code == 200

        # Safety Router
        response = client.post(
            "/v1/safety/assess",
            json={
                "location_id": "GATE_NORTH",
                "density_score": 0.5,
                "rate_of_change": 0.01,
            },
        )
        assert response.status_code == 200

        # Telemetry Router
        response = client.get("/v1/telemetry/GATE_3")
        assert response.status_code == 200


def test_exception_handler():
    client = TestClient(app)
    response = client.get("/v1/non-existent-endpoint")
    assert response.status_code == 404


def test_internal_error_handler():
    assert Exception in app.exception_handlers


@pytest.mark.asyncio
async def test_lifespan():
    # Verify lifespan shell works without side effects
    with TestClient(app) as local_client:
        response = local_client.get("/v1/health")
        assert response.status_code == 200
