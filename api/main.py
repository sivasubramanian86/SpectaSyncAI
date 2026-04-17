"""
SpectaSyncAI FastAPI entry point — 12-Agent Mesh, 8 versioned routers.
@07_modern_polyglot_standards | @19_cost_efficiency_architect

Startup sequence:
  1. Context cache warm-up   (Vertex AI CachedContent, 6-hour TTL)
  2. Router registration     (Tier 1 + Tier 2)
"""
from __future__ import annotations

import asyncio
import logging
import os
import sys
import traceback
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from api.routers import (
    health, telemetry, interventions,
    predictions, queues, safety, experience, crisis, pre_event
)

# Force override to ensure .env values take precedence
load_dotenv(override=True)

# Structured logging — stdout for Cloud Logging
logging.basicConfig(
    level=getattr(logging, os.getenv("LOG_LEVEL", "INFO")),
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
    stream=sys.stdout,
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup: warm Vertex AI context caches for all 5 Tier-2 agents.
    Cache warm-up runs as a background task.
    """
    logger.info(
        "SpectaSyncAI v3.1.0 — 12-Agent Mesh starting "
        "(Tier 1: 6 Operational | Tier 2: 6 Crisis Prevention & RAG)."
    )

    # Warm context caches in background (non-blocking)
    if os.getenv("GOOGLE_GENAI_USE_VERTEXAI") == "1":
        try:
            from agents.context_cache import warm_all_caches
            asyncio.create_task(warm_all_caches())
            logger.info("Context cache warm-up task scheduled.")
        except Exception as exc:
            logger.warning(f"Context cache warm-up skipped: {exc}")
    else:
        logger.info("Vertex AI not configured — context caching disabled.")

    # ── 2. Pre-Event Analysis Pre-Computation ─────────────────────────────
    async def precompute_pre_event():
        try:
            from api.routers.pre_event import (
                get_mock_pre_event, trigger_pre_event_analysis, PreEventData
            )
            mock_data = await get_mock_pre_event()
            pydantic_data = PreEventData(**mock_data)
            logger.info("[Lifespan] Pre-computing Pre-Event Analysis...")
            await trigger_pre_event_analysis(pydantic_data)
            logger.info("[Lifespan] Pre-Event Analysis ready.")
        except Exception as e:
            logger.warning(f"[Lifespan] Pre-event failed: {e}")

    asyncio.create_task(precompute_pre_event())
    yield
    logger.info("SpectaSyncAI — graceful shutdown complete.")


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
    debug=True,
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
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Tier 1 — Operational Agents ──────────────────────────────────────────────
app.include_router(health.router, prefix="/v1", tags=["Health"])
app.include_router(telemetry.router, prefix="/v1", tags=["Telemetry & Vision"])
app.include_router(interventions.router, prefix="/v1", tags=["Interventions"])
app.include_router(predictions.router, prefix="/v1", tags=["AI Predictions"])
app.include_router(queues.router, prefix="/v1", tags=["Queue Management"])
app.include_router(safety.router, prefix="/v1", tags=["Safety & Emergency"])
app.include_router(experience.router, prefix="/v1", tags=["Attendee Experience"])

# ── Tier 2 — Crisis Prevention Agents + Incident RAG ─────────────────────────
app.include_router(crisis.router, prefix="/v1", tags=["Crisis Prevention Mesh"])
app.include_router(
    pre_event.router, prefix="/v1/pre-event", tags=["Pre-Event Forecasting"]
)

if os.path.exists("static"):
    app.mount("/assets", StaticFiles(directory="static/assets"), name="assets")


@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    return HTMLResponse(content="")


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    tb = traceback.format_exc()
    logger.error(f"GLOBAL ERROR: {exc}\n{tb}")
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal Server Error",
            "error": str(exc),
            "traceback": tb
        },
    )


@app.get("/", include_in_schema=False)
async def serve_dashboard():
    index_path = os.path.join("static", "index.html")
    if os.path.exists(index_path):
        with open(index_path, "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read())
    return HTMLResponse(
        content="<h1>SpectaSyncAI API</h1><p>Frontend not found.</p>"
    )
