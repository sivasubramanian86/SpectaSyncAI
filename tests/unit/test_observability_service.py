import pytest
import os
import asyncio
from unittest.mock import MagicMock, patch
from api.services.observability_service import ObservabilityService

def test_observability_status():
    obs = ObservabilityService()
    status = obs.status()
    assert "enabled" in status
    assert status["metric_prefix"] == "custom.googleapis.com/spectasync"

def test_observability_disabled_behavior():
    with patch.dict(os.environ, {"OBSERVABILITY_ENABLED": "0"}):
        obs = ObservabilityService()
        assert obs.enabled is False
        assert obs._client_or_none() is None
        
        # Test write metric early return
        obs._write_metric("test", 1.0) # Should return None immediately

def test_observability_client_caching():
    with patch.dict(os.environ, {"GOOGLE_CLOUD_PROJECT": "p1", "OBSERVABILITY_ENABLED": "1"}):
        with patch("google.cloud.monitoring_v3.MetricServiceClient") as MockClient:
            obs = ObservabilityService()
            obs.enabled = True
            c1 = obs._client_or_none()
            c2 = obs._client_or_none()
            assert c1 == c2
            assert MockClient.call_count == 1

def test_observability_schedule_no_loop():
    # Covers lines 132-133
    obs = ObservabilityService()
    # If we run this in a thread with no loop, it should return
    import threading
    def target():
        obs.schedule_metric("test", 1.0)
    
    t = threading.Thread(target=target)
    t.start()
    t.join()

@pytest.mark.asyncio
async def test_observability_error_metric():
    # Covers line 153 (status_code >= 500)
    obs = ObservabilityService()
    with patch.object(obs, "schedule_metric") as mock_sched:
        obs.schedule_http_request("GET", "/test", 500, 100.0)
        # Should call schedule_metric for duration, count, and error_count
        calls = [c[0][0] for c in mock_sched.call_args_list]
        assert "http_server_error_count" in calls

def test_observability_agent_run():
    obs = ObservabilityService()
    with patch.object(obs, "schedule_metric") as mock_sched:
        obs.schedule_agent_run("test_agent", 50.0, status="success", fallback=True, output_size_bytes=100)
        calls = [c[0][0] for c in mock_sched.call_args_list]
        assert "agent_fallback_count" in calls
        assert "agent_output_size_bytes" in calls
