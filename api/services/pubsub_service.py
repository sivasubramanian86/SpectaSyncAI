"""SpectaSyncAI: Google Cloud Pub/Sub Service

High-fidelity broadcast service for agentic incident escalation.
Used to trigger downstream civil defense notifications and HITL workflows.
"""

import os
import json
import logging
from google.cloud import pubsub_v1
from google.api_core import exceptions

logger = logging.getLogger("spectasync.pubsub")


class PubSubService:
    """Manages publishing high-priority risk alerts to Google Cloud Pub/Sub."""

    def __init__(self):
        """Initialize the PubSub service and topic paths for critical alerts."""
        self.project_id = os.getenv("GOOGLE_CLOUD_PROJECT", "spectasyncai")
        self.publisher = None
        self.topic_path = None
        self.enabled = False

        if os.getenv("K_SERVICE"):  # Only initialize in Cloud Run production
            try:
                self.publisher = pubsub_v1.PublisherClient()
                self.topic_path = self.publisher.topic_path(
                    self.project_id, "critical-risks"
                )
                self.enabled = True
                logger.info(f"Pub/Sub initialized for topic: {self.topic_path}")
            except Exception as e:  # pragma: no cover
                logger.error(f"Failed to initialize Pub/Sub: {e}")

    async def broadcast_risk(self, risk_data: dict):
        """Publishes a high-priority risk alert to Cloud Pub/Sub."""
        if not self.enabled:
            logger.debug("Pub/Sub disabled (Local/Dev). Mocking broadcast.")
            return True

        try:
            message_json = json.dumps(risk_data)
            message_bytes = message_json.encode("utf-8")

            future = self.publisher.publish(
                self.topic_path,
                data=message_bytes,
                origin="SpectaSyncAI-Mesh",
                urgency="CRITICAL",
            )
            message_id = future.result()
            logger.info(f"Risk broadcast successful: {message_id}")
            return True
        except exceptions.NotFound:  # pragma: no cover
            logger.warning("Pub/Sub Topic 'critical-risks' not found. Skipping.")
            return False
        except Exception as e:  # pragma: no cover
            logger.error(f"Error publishing to Pub/Sub: {e}")
            return False


# Global singleton
pubsub_service = PubSubService()
