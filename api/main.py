"""Provide the FastAPI entry point for the 12-Agent real-time crowd intelligence mesh.

@07_modern_polyglot_standards | @19_cost_efficiency_architect.

Startup sequence:
  1. Context cache warm-up   (Vertex AI CachedContent, 6-hour TTL)
  2. Router registration     (Tier 1 + Tier 2)
"""

from __future__ import annotations

import asyncio
import json
import logging
import os
import sys
import traceback
from time import perf_counter
from contextlib import asynccontextmanager

try:
    import google.cloud.logging
except ImportError:  # pragma: no cover
    google.cloud.logging = None

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from api.services.observability_service import observability_service
from api.routers import (
    health,
    telemetry,
    interventions,
    predictions,
    queues,
    safety,
    experience,
    crisis,
    pre_event,
    observability,
)

# Force override to ensure .env values take precedence
load_dotenv(override=True)

# Structured logging - stdout for Cloud Logging
logging.basicConfig(
    level=getattr(logging, os.getenv("LOG_LEVEL", "INFO")),
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
    stream=sys.stdout,
)
logger = logging.getLogger(__name__)
DEBUG_MODE = os.getenv("DEBUG", "false").lower() in {"1", "true", "yes", "on"}
cloud_logging_client = None

# ── Google Cloud Logging Integration ──────────────────────────────────────────
if (
    google.cloud.logging
    and os.getenv("GOOGLE_CLOUD_PROJECT")
    and os.getenv("K_SERVICE")
):
    try:  # pragma: no cover
        cloud_logging_client = google.cloud.logging.Client()
        cloud_logging_client.setup_logging()
        logger.info("Google Cloud Logging handler attached.")
    except Exception as exc:  # pragma: no cover
        logger.warning(f"Google Cloud Logging initialization skipped: {exc}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Warm Vertex AI context caches for all 5 Tier-2 agents during startup.

    Cache warm-up runs as a background task.
    """
    logger.info(
        "SpectaSyncAI v3.1.0 - 12-Agent Mesh starting "
        "(Tier 1: 6 Operational | Tier 2: 6 Crisis Prevention & RAG)."
    )

    # Warm context caches in background (non-blocking)
    if os.getenv("GOOGLE_GENAI_USE_VERTEXAI") == "1":
        try:
            from agents.context_cache import warm_all_caches

            asyncio.create_task(warm_all_caches())
            logger.info("Context cache warm-up task scheduled.")
        except Exception as exc:  # pragma: no cover
            logger.warning(f"Context cache warm-up skipped: {exc}")
    else:
        logger.info("Vertex AI not configured - context caching disabled.")

    # ── 2. Pre-Event Analysis Pre-Computation ─────────────────────────────
    async def precompute_pre_event():
        try:
            from api.routers.pre_event import (
                get_mock_pre_event,
                trigger_pre_event_analysis,
                PreEventData,
            )

            mock_data = await get_mock_pre_event()
            # Ensure proper schema before trigger
            pydantic_data = PreEventData(**mock_data)
            logger.info("[Lifespan] Pre-computing Pre-Event Analysis...")
            await trigger_pre_event_analysis(pydantic_data)
            logger.info("[Lifespan] Pre-Event Analysis ready.")
        except Exception as e:  # pragma: no cover
            logger.warning(f"[Lifespan] Pre-event failed: {e}")

    # Initialize Strategic Pre-Event Analysis in Background
    asyncio.create_task(precompute_pre_event())
    try:
        yield
    finally:
        if cloud_logging_client is not None:
            try:  # pragma: no cover
                cloud_logging_client.close()
            except Exception as exc:  # pragma: no cover
                logger.debug(f"Cloud Logging client close skipped: {exc}")
        logger.info("SpectaSyncAI - graceful shutdown complete.")


app = FastAPI(
    title="SpectaSyncAI",
    description=(
        "12-Agent Real-Time Crowd Intelligence Mesh. "
        "Grounded in forensic analysis of 18 incident corpora. "
        "Tier 1: 6 Operational Agents. "
        "Tier 2: 6 Crisis Prevention Agents & Incident RAG. "
        "Powered by ADK, Gemini, AlloyDB, FastMCP, Vertex AI."
    ),
    version="3.1.0",
    lifespan=lifespan,
    debug=DEBUG_MODE,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ─────────────────────────────────────────────────────────────────────
_default_origins = (
    "http://localhost:5173,http://localhost:5174,http://localhost:3000,"
    "http://127.0.0.1:5173,http://127.0.0.1:5174"
)
ALLOWED_ORIGINS = os.getenv("CORS_ORIGINS", _default_origins).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Requested-With", "Accept"],
)


# ── Tier 1 - Operational Agents ──────────────────────────────────────────────
@app.middleware("http")
async def add_auth_popup_headers(request: Request, call_next):
    """Middleware for security headers and observability tracing."""
    start = perf_counter()
    response = await call_next(request)
    response.headers.setdefault(
        "Cross-Origin-Opener-Policy", "same-origin-allow-popups"
    )
    route = request.scope.get("route")
    route_path = getattr(route, "path", request.url.path)
    duration_ms = (perf_counter() - start) * 1000
    logger.info(
        "[HTTP] %s %s -> %s in %.1fms",
        request.method,
        route_path,
        response.status_code,
        duration_ms,
    )
    observability_service.schedule_http_request(
        request.method,
        route_path,
        response.status_code,
        duration_ms,
    )
    return response


app.include_router(health.router, prefix="/v1", tags=["Health"])
app.include_router(telemetry.router, prefix="/v1", tags=["Telemetry & Vision"])
app.include_router(interventions.router, prefix="/v1", tags=["Interventions"])
app.include_router(predictions.router, prefix="/v1", tags=["AI Predictions"])
app.include_router(queues.router, prefix="/v1", tags=["Queue Management"])
app.include_router(safety.router, prefix="/v1", tags=["Safety & Emergency"])
app.include_router(experience.router, prefix="/v1", tags=["Attendee Experience"])

# ── Tier 2 - Crisis Prevention Agents + Incident RAG ─────────────────────────
app.include_router(crisis.router, prefix="/v1", tags=["Crisis Prevention Mesh"])
app.include_router(
    pre_event.router, prefix="/v1/pre-event", tags=["Pre-Event Forecasting"]
)
app.include_router(
    observability.router, prefix="/v1", tags=["Observability & Diagnostics"]
)


def _runtime_firebase_config() -> dict[str, str | None]:
    """Return the public Firebase client config for the frontend."""
    return {
        "apiKey": os.getenv("FIREBASE_API_KEY") or os.getenv("VITE_FIREBASE_API_KEY"),
        "authDomain": os.getenv("FIREBASE_AUTH_DOMAIN")
        or os.getenv("VITE_FIREBASE_AUTH_DOMAIN"),
        "projectId": os.getenv("FIREBASE_PROJECT_ID")
        or os.getenv("VITE_FIREBASE_PROJECT_ID"),
        "storageBucket": os.getenv("FIREBASE_STORAGE_BUCKET")
        or os.getenv("VITE_FIREBASE_STORAGE_BUCKET"),
        "messagingSenderId": os.getenv("FIREBASE_MESSAGING_SENDER_ID")
        or os.getenv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
        "appId": os.getenv("FIREBASE_APP_ID") or os.getenv("VITE_FIREBASE_APP_ID"),
        "measurementId": os.getenv("FIREBASE_MEASUREMENT_ID")
        or os.getenv("VITE_FIREBASE_MEASUREMENT_ID"),
        "databaseURL": os.getenv("FIREBASE_DATABASE_URL")
        or os.getenv("VITE_FIREBASE_DATABASE_URL"),
    }


@app.get("/v1/runtime-config.js", include_in_schema=False)
async def runtime_config_js():
    """Serve the dynamic Firebase and Environment config to the frontend."""
    firebase_config = _runtime_firebase_config()
    payload = {
        "firebase": firebase_config,
        "firebaseConfigured": bool(
            firebase_config["apiKey"]
            and firebase_config["authDomain"]
            and firebase_config["projectId"]
            and firebase_config["appId"]
        ),
    }
    body = "window.__SPECTASYNC_RUNTIME__ = " + json.dumps(payload) + ";"
    return Response(
        content=body,
        media_type="application/javascript",
        headers={
            "Cache-Control": "no-store, max-age=0",
            "Pragma": "no-cache",
        },
    )


@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    """Serve a blank favicon if not present in static."""
    return HTMLResponse(content="")


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global catch-all for unhandled exceptions."""
    tb = traceback.format_exc()
    logger.error(f"GLOBAL ERROR: {exc}\n{tb}")
    payload = {"detail": "Internal Server Error", "error": str(exc)}
    if DEBUG_MODE:  # pragma: no cover
        payload["traceback"] = tb
    return JSONResponse(status_code=500, content=payload)


# ── Static Files (Last Resort) ──────────────────────────────────────────────
if os.path.exists("static"):
    # Priority 1: Hashed chunks in /assets
    if os.path.isdir("static/assets"):
        app.mount("/assets", StaticFiles(directory="static/assets"), name="assets")

    # Priority 2: Root public files and the SPA index
    # html=True enables serving index.html for the root path
    app.mount("/", StaticFiles(directory="static", html=True), name="static-root")
else:

    @app.get("/", include_in_schema=False)
    async def fallback_root():  # pragma: no cover
        """Deliver a fallback message when static assets are missing."""
        return HTMLResponse(
            content="<h1>SpectaSyncAI API</h1><p>Frontend not found.</p>"
        )
