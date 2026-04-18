"""
SpectaSyncAI: Cloud Run Deployment Script
Deploys MCP Toolbox and FastAPI backend as separate Cloud Run services.

Usage:
    python scripts/deploy_cloudrun.py               # deploy all
    python scripts/deploy_cloudrun.py --service mcp # deploy MCP only
    python scripts/deploy_cloudrun.py --service api # deploy API only
    python scripts/deploy_cloudrun.py --print-urls  # print live URLs only

Pre-requisites:
    - python scripts/setup_gcp.py  (run once)
    - gcloud auth login + gcloud auth application-default login
    - .env populated

@17_devops_sre_deployer: source-deploy (no local Docker required)
@07_modern_polyglot_standards: Cloud Run min=0, cpu_idle=true
"""
from __future__ import annotations

import argparse
import logging
import os
import subprocess
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
try:
    from dotenv import load_dotenv
    load_dotenv(override=True)
except ImportError:
    pass

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-7s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)

# ── Config ────────────────────────────────────────────────────────────────────
PROJECT_ID  = os.environ.get("GOOGLE_CLOUD_PROJECT", "spectasyncai")
REGION      = os.environ.get("GOOGLE_CLOUD_LOCATION", "us-central1")
AR_REPO     = "spectasync-docker"
AR_HOST     = f"{REGION}-docker.pkg.dev"
SA_EMAIL    = f"spectasync-runner@{PROJECT_ID}.iam.gserviceaccount.com"
MODEL_PRO   = os.environ.get("MODEL_PRO",   "gemini-2.0-pro-exp-02-05")
MODEL_FLASH = os.environ.get("MODEL_FLASH", "gemini-2.0-flash-001")

# Cloud Run service definitions
SERVICES = {
    "mcp": {
        "name":        "spectasync-mcp",
        "dockerfile":  "Dockerfile.mcp",
        "image_tag":   "spectasync-mcp",
        "port":        8080,
        "min_inst":    0,
        "max_inst":    5,
        "memory":      "512Mi",
        "cpu":         "1",
        "description": "FastMCP SSE Toolbox",
    },
    "api": {
        "name":        "spectasync-api",
        "dockerfile":  "Dockerfile",
        "image_tag":   "spectasync-api",
        "port":        8080,
        "min_inst":    0,
        "max_inst":    10,
        "memory":      "1Gi",
        "cpu":         "2",
        "description": "FastAPI 12-Agent Mesh",
    },
}


def run(cmd: str, fatal: bool = True) -> subprocess.CompletedProcess:
    log.info("  $ %s", cmd)
    result = subprocess.run(cmd, shell=True)
    if fatal and result.returncode != 0:
        log.error("Command failed (exit %d): %s", result.returncode, cmd)
        sys.exit(result.returncode)
    return result


def get_service_url(service_name: str) -> str:
    """Fetches the live Cloud Run URL for a service."""
    result = subprocess.run(
        f"gcloud run services describe {service_name} "
        f"--region {REGION} --project {PROJECT_ID} "
        f"--format value(status.url)",
        shell=True, capture_output=True, text=True,
    )
    return result.stdout.strip()


def deploy_service(svc_key: str, mcp_url: str = "") -> str:
    """
    Deploys a Cloud Run service using Google Cloud Build source deploy.
    Returns the deployed service URL.
    """
    svc = SERVICES[svc_key]
    log.info("")
    log.info("─" * 55)
    log.info("  Deploying: %s (%s)", svc["name"], svc["description"])
    log.info("─" * 55)

    # Base env vars for all services
    env_vars = ",".join([
        f"GOOGLE_CLOUD_PROJECT={PROJECT_ID}",
        f"GOOGLE_CLOUD_LOCATION={REGION}",
        "GOOGLE_GENAI_USE_VERTEXAI=1",
        f"MODEL_PRO={MODEL_PRO}",
        f"MODEL_FLASH={MODEL_FLASH}",
        "LOG_LEVEL=INFO",
        *[
            f"{key}={value}"
            for key, value in {
                "FIREBASE_API_KEY": os.environ.get("FIREBASE_API_KEY"),
                "FIREBASE_AUTH_DOMAIN": os.environ.get("FIREBASE_AUTH_DOMAIN"),
                "FIREBASE_PROJECT_ID": os.environ.get("FIREBASE_PROJECT_ID"),
                "FIREBASE_STORAGE_BUCKET": os.environ.get("FIREBASE_STORAGE_BUCKET"),
                "FIREBASE_MESSAGING_SENDER_ID": os.environ.get("FIREBASE_MESSAGING_SENDER_ID"),
                "FIREBASE_APP_ID": os.environ.get("FIREBASE_APP_ID"),
                "FIREBASE_MEASUREMENT_ID": os.environ.get("FIREBASE_MEASUREMENT_ID"),
                "FIREBASE_DATABASE_URL": os.environ.get("FIREBASE_DATABASE_URL"),
            }.items()
            if value
        ],
    ])

    deploy_cmd = (
        f"gcloud run deploy {svc['name']} "
        f"--source . "
        f"--region {REGION} "
        f"--project {PROJECT_ID} "
        f"--service-account {SA_EMAIL} "
        f"--port {svc['port']} "
        f"--memory {svc['memory']} "
        f"--cpu {svc['cpu']} "
        f"--min-instances {svc['min_inst']} "
        f"--max-instances {svc['max_inst']} "
        f"--cpu-throttling "
        f"--allow-unauthenticated "
        f"--quiet"
    )

    # If MCP, override the CMD of the single unified Dockerfile
    if svc_key == "mcp":
        deploy_cmd += " --command=\"python\" --args=\"-m,mcp_server.server\""
    
    # API service gets MCP URL
    if svc_key == "api" and mcp_url:
        env_vars += f",MCP_SERVER_URL={mcp_url}/sse"
        env_vars += ",CORS_ORIGINS=http://localhost:5173"

    deploy_cmd += f" --set-env-vars {env_vars}"

    run(deploy_cmd)

    url = get_service_url(svc["name"])
    log.info("  Deployed: %s → %s", svc["name"], url)
    return url


def print_urls() -> None:
    """Print live URLs for all deployed services."""
    log.info("")
    log.info("=" * 55)
    log.info("  SpectaSyncAI — Live Service URLs")
    log.info("=" * 55)
    for svc_key, svc in SERVICES.items():
        url = get_service_url(svc["name"])
        if url:
            log.info("  %-12s → %s", svc["description"], url)
            if svc_key == "mcp":
                log.info("  %-12s   SSE endpoint: %s/sse", "", url)
            if svc_key == "api":
                log.info("  %-12s   API docs:     %s/docs", "", url)
                log.info("  %-12s   Corpus list:  %s/v1/crisis/incident-corpus", "", url)
        else:
            log.info("  %-12s → NOT DEPLOYED", svc["description"])
    log.info("")


def update_cors(api_url: str, ui_url: str = "") -> None:
    """
    Updates the API service's CORS_ORIGINS env var after both services are deployed.
    Call this after the frontend URL is known.
    """
    origins = ",".join(filter(None, ["http://localhost:5173", ui_url]))
    log.info("Updating CORS_ORIGINS on spectasync-api → %s", origins)
    run(
        f"gcloud run services update spectasync-api "
        f"--region {REGION} --project {PROJECT_ID} "
        f"--update-env-vars CORS_ORIGINS={origins} "
        f"--quiet"
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Deploy SpectaSyncAI to Cloud Run")
    parser.add_argument(
        "--service",
        choices=["mcp", "api", "all"],
        default="all",
        help="Service to deploy (default: all)",
    )
    parser.add_argument(
        "--print-urls",
        action="store_true",
        help="Print live service URLs and exit",
    )
    parser.add_argument(
        "--skip-build",
        action="store_true",
        help="Skip Docker build+push (use existing image in AR)",
    )
    args = parser.parse_args()

    if args.print_urls:
        print_urls()
        return

    log.info("=" * 55)
    log.info("  SpectaSyncAI — Cloud Run Deployment Pipeline v3.1.0")
    log.info(f"  Project  : {PROJECT_ID}")
    log.info(f"  Region   : {REGION}")
    log.info(f"  Model Pro: {MODEL_PRO}")
    log.info(f"  Model Fla: {MODEL_FLASH}")
    log.info("=" * 55)

    run(f"gcloud config set project {PROJECT_ID}")

    targets = ["mcp", "api"] if args.service == "all" else [args.service]
    mcp_url = ""

    for svc_key in targets:
        # MCP must deploy first so its URL can be injected into the API
        url = deploy_service(svc_key, mcp_url=mcp_url)

        if svc_key == "mcp":
            mcp_url = url
            log.info("  MCP URL captured for API injection: %s", mcp_url)
            # Brief wait to ensure MCP SSE server is ready before API connects
            log.info("  Waiting 20s for MCP service to become healthy...")
            time.sleep(20)

    # Print final summary
    print_urls()

    if "api" in targets:
        api_url = get_service_url("spectasync-api")
        log.info("")
        log.info("POST-DEPLOY CHECKLIST:")
        log.info("  1. Verify API health:  curl %s/v1/health", api_url)
        log.info("  2. Verify MCP tools:   curl %s/sse", mcp_url)
        log.info("  3. Open API docs:      %s/docs", api_url)
        log.info("  4. Once UI is deployed, run:")
        log.info("     python scripts/deploy_cloudrun.py --update-cors <UI_URL>")
        log.info("")
        log.info("  5. Apply AlloyDB schema (after AlloyDB Auth Proxy is set up):")
        log.info("     psql $DATABASE_URL -f db/schema.sql")
        log.info("     psql $DATABASE_URL -f db/seed_corpus.sql")
        log.info("     python scripts/embed_corpus.py")


if __name__ == "__main__":
    main()
