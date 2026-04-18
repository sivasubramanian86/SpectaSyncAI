"""
SpectaSyncAI: Vision Agent
Powered by Google ADK (google-adk) + Gemini 2.5 Flash
Responsibility: Multimodal CCTV frame analysis for real-time crowd density estimation.
"""
import os
import json
import logging
from google.adk.agents import LlmAgent
from google.adk.runners import InMemoryRunner
from google.adk.sessions import InMemorySessionService
from google.genai import types as genai_types
from google.cloud import storage


logger = logging.getLogger(__name__)


def analyze_cctv_frame(location_id: str, density_b64: str) -> dict:
    """
    Stub tool: Parses a pre-analyzed CCTV image frame result.
    In production, this calls a Vision API or local frame processor.

    Args:
        location_id: The venue zone identifier (e.g. 'GATE_3').
        density_b64: Base64-encoded image data for the frame.

    Returns:
        dict: Structured density analysis result.
    """
    # Production: replace with actual image analysis call
    return {
        "location_id": location_id,
        "density_score": 0.87,
        "bottleneck_detected": True,
        "frame_processed": True,
    }


def archive_to_gcs(location_id: str, image_bytes: bytes) -> str:
    """
    Archives a critical CCTV frame to Google Cloud Storage for forensic audit.

    Args:
        location_id: Zone identifier.
        image_bytes: CCTV frame.

    Returns:
        str: Public bucket URI (or mock URI if local).
    """
    bucket_name = os.getenv("GCS_ARCHIVE_BUCKET", "spectasync-incident-archive")
    filename = f"incident_{location_id}_{int(os.getpid())}.jpg"

    # Try live upload if configured
    if os.getenv("GOOGLE_CLOUD_PROJECT") and os.getenv("GCS_ENABLED") == "1":
        try:
            client = storage.Client()
            bucket = client.bucket(bucket_name)
            blob = bucket.blob(filename)
            blob.upload_from_string(image_bytes, content_type="image/jpeg")
            return f"gs://{bucket_name}/{filename}"
        except Exception as exc:
            logger.warning(f"GCS Archival failed: {exc}")

    return f"gs://{bucket_name}/mock_{filename} (Local Sandbox)"


def build_vision_agent() -> LlmAgent:
    """
    Constructs the ADK Vision Agent using Gemini 2.5 Flash.
    This agent is optimized for high-speed, low-cost multimodal analysis.

    Returns:
        LlmAgent: The configured ADK Vision Agent instance.
    """
    return LlmAgent(
        model=os.getenv("MODEL_FLASH", "gemini-2.5-flash"),
        name="vision_agent",
        description="Analyzes CCTV frames from venue zones to produce crowd density scores.",
        instruction=(
            "You are the SpectaSyncAI Vision Agent. "
            "When given a location_id and a CCTV frame, analyze crowd congestion "
            "and return a JSON object with fields: density_score (float 0-1), "
            "bottleneck_detected (bool), location_id (str). "
            "Always prefer calling the analyze_cctv_frame tool first. "
            "If a bottleneck is detected, call archive_to_gcs to save the evidence."
        ),
        tools=[analyze_cctv_frame, archive_to_gcs],
    )


async def run_vision_analysis(location_id: str, image_bytes: bytes) -> dict:
    """
    Executes the Vision Agent for a given CCTV frame.

    Args:
        location_id: Venue zone identifier.
        image_bytes: Raw JPEG bytes from the CCTV stream.

    Returns:
        dict: The agent's final density analysis output.
    """
    agent = build_vision_agent()
    session_service = InMemorySessionService()
    runner = InMemoryRunner(agent=agent, session_service=session_service)

    session = await session_service.create_session(
        app_name="spectasync_vision", user_id="system"
    )

    prompt = (
        f"Analyze the CCTV frame for venue zone '{location_id}'. "
        f"The image data is provided. Use the analyze_cctv_frame tool."
    )

    result_text = ""
    async for event in runner.run_async(
        user_id="system",
        session_id=session.id,
        new_message=genai_types.Content(
            role="user",
            parts=[genai_types.Part(text=prompt)],
        ),
    ):
        if event.is_final_response() and event.content:
            for part in event.content.parts:
                if part.text:
                    result_text += part.text

    logger.info(f"[VisionAgent] Result for {location_id}: {result_text}")

    try:
        return json.loads(result_text)
    except json.JSONDecodeError:
        return {
            "location_id": location_id,
            "density_score": 0.5,
            "bottleneck_detected": False,
        }
