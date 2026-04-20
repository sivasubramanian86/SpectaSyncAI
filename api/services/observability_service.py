"""SpectaSyncAI observability helpers.

Best-effort request and agent metrics for Google Cloud Monitoring.
The service is intentionally non-blocking and degrades to no-op mode when the
Monitoring client or credentials are not available.
"""

from __future__ import annotations

import asyncio
import logging
import os
from typing import Any

from google.api import metric_pb2, monitored_resource_pb2
from google.cloud import monitoring_v3
from google.cloud.monitoring_v3.types import Point, TimeInterval, TimeSeries, TypedValue
from google.protobuf.timestamp_pb2 import Timestamp

logger = logging.getLogger(__name__)


class ObservabilityService:
    """Write lightweight custom metrics to Google Cloud Monitoring."""

    def __init__(self) -> None:
        """Initialize the observability service with Google Cloud credentials."""
        self.project_id = os.getenv("GOOGLE_CLOUD_PROJECT")
        self.location = os.getenv("GOOGLE_CLOUD_LOCATION", "asia-south1")
        self.service_name = os.getenv("K_SERVICE") or "spectasync-local"
        self.revision_name = os.getenv("K_REVISION") or "local"
        self.enabled = bool(
            monitoring_v3
            and self.project_id
            and os.getenv("OBSERVABILITY_ENABLED", "1").lower()
            not in {"0", "false", "no"}
        )
        self._client: monitoring_v3.MetricServiceClient | None = None
        self._client_disabled = False

    def status(self) -> dict[str, Any]:
        """Return a small status payload for diagnostics/UI visibility."""
        return {
            "enabled": self.enabled and not self._client_disabled,
            "project_id": self.project_id,
            "location": self.location,
            "service_name": self.service_name,
            "revision_name": self.revision_name,
            "metric_prefix": "custom.googleapis.com/spectasync",
        }

    def _metric_type(self, suffix: str) -> str:
        return f"custom.googleapis.com/spectasync/{suffix}"

    def _resource(self) -> monitored_resource_pb2.MonitoredResource:
        return monitored_resource_pb2.MonitoredResource(
            type="global",
            labels={"project_id": self.project_id or "local"},
        )

    def _client_or_none(self) -> monitoring_v3.MetricServiceClient | None:
        if not self.enabled or self._client_disabled:
            return None
        if self._client is not None:
            return self._client

        try:
            self._client = monitoring_v3.MetricServiceClient()
        except Exception as exc:  # pragma: no cover - environment dependent
            self._client_disabled = True
            logger.debug("Cloud Monitoring client unavailable: %s", exc)
            return None

        return self._client

    def _build_series(
        self,
        suffix: str,
        value: float,
        labels: dict[str, str] | None = None,
    ) -> TimeSeries:
        series = TimeSeries()
        series.metric = metric_pb2.Metric(type=self._metric_type(suffix))
        if labels:
            series.metric.labels.update({k: str(v) for k, v in labels.items()})

        series.resource = self._resource()

        end_time = Timestamp()
        end_time.GetCurrentTime()
        point = Point()
        point.interval = TimeInterval(end_time=end_time)
        point.value = TypedValue(double_value=float(value))
        series.points.append(point)
        return series

    def _write_metric(
        self,
        suffix: str,
        value: float,
        labels: dict[str, str] | None = None,
    ) -> None:
        client = self._client_or_none()
        if client is None:
            return

        try:
            series = self._build_series(suffix, value, labels)
            client.create_time_series(
                name=f"projects/{self.project_id}",
                time_series=[series],
            )
        except Exception as exc:  # pragma: no cover - remote auth/runtime dependent
            logger.debug("Cloud Monitoring write skipped for %s: %s", suffix, exc)

    async def record_metric(
        self,
        suffix: str,
        value: float,
        labels: dict[str, str] | None = None,
    ) -> None:
        """Record a single numeric metric without blocking request handling."""
        await asyncio.to_thread(self._write_metric, suffix, value, labels)

    def schedule_metric(
        self,
        suffix: str,
        value: float,
        labels: dict[str, str] | None = None,
    ) -> None:
        """Fire-and-forget helper for async call sites."""
        try:
            loop = asyncio.get_running_loop()
        except RuntimeError:  # pragma: no cover
            return

        loop.create_task(self.record_metric(suffix, value, labels))

    def schedule_http_request(
        self,
        method: str,
        route: str,
        status_code: int,
        duration_ms: float,
    ) -> None:
        """Emit request duration and count metrics for the dashboard."""
        labels = {
            "method": method.upper(),
            "route": route,
            "status_code": str(status_code),
        }
        self.schedule_metric("http_request_duration_ms", duration_ms, labels)
        self.schedule_metric("http_request_count", 1.0, labels)
        if status_code >= 500:
            self.schedule_metric("http_server_error_count", 1.0, labels)

    def schedule_agent_run(
        self,
        agent_name: str,
        duration_ms: float,
        *,
        status: str,
        fallback: bool = False,
        model_name: str | None = None,
        output_size_bytes: int | None = None,
    ) -> None:
        """Track agent execution time, result size, and fallback usage."""
        labels = {
            "agent_name": agent_name,
            "status": status,
        }
        if model_name:
            labels["model_name"] = model_name

        self.schedule_metric("agent_duration_ms", duration_ms, labels)
        self.schedule_metric("agent_run_count", 1.0, labels)

        if output_size_bytes is not None:
            self.schedule_metric(
                "agent_output_size_bytes", float(output_size_bytes), labels
            )
        if fallback:
            self.schedule_metric("agent_fallback_count", 1.0, labels)


observability_service = ObservabilityService()
