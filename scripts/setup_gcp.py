"""
SpectaSyncAI: GCP Setup Script — One-Time Infra Provisioning
Handles: API enablement, IAM, Artifact Registry, AlloyDB cluster + instance.

Run ONCE before first deployment:
    python scripts/setup_gcp.py

Pre-requisites:
    - gcloud CLI installed and authenticated: gcloud auth login
    - Billing enabled on project spectasyncai
    - .env file populated with GOOGLE_CLOUD_PROJECT, ALLOYDB_* vars

@10_security_governance: least-privilege IAM roles, no broad editor grants
@11_database_architect: AlloyDB with private IP, Auth Proxy pattern
"""
from __future__ import annotations

import logging
import os
import subprocess
import sys
import time
from pathlib import Path

# Load .env from project root
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-7s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)

# ── Config (all from .env) ───────────────────────────────────────────────────
PROJECT_ID  = os.environ.get("GOOGLE_CLOUD_PROJECT", "spectasyncai")
REGION      = os.environ.get("GOOGLE_CLOUD_LOCATION", "asia-southeast1")
AR_REPO     = "spectasync-docker"

# AlloyDB config
ALLOYDB_CLUSTER  = os.environ.get("ALLOYDB_CLUSTER",  "spectasync-cluster")
ALLOYDB_INSTANCE = os.environ.get("ALLOYDB_INSTANCE", "spectasync-primary")
ALLOYDB_DB       = os.environ.get("ALLOYDB_DATABASE", "spectasync")
ALLOYDB_USER     = os.environ.get("ALLOYDB_USER",     "spectasync_app")

# Service account used by Cloud Run services
SA_NAME         = "spectasync-runner"
SA_EMAIL        = f"{SA_NAME}@{PROJECT_ID}.iam.gserviceaccount.com"


def run(cmd: str, fatal: bool = True) -> subprocess.CompletedProcess:
    """Run a shell command, exit on failure if fatal=True."""
    log.info("  $ %s", cmd)
    result = subprocess.run(cmd, shell=True, capture_output=False)
    if fatal and result.returncode != 0:
        log.error("Command failed (exit %d): %s", result.returncode, cmd)
        sys.exit(result.returncode)
    return result


def banner(title: str) -> None:
    log.info("")
    log.info("─" * 55)
    log.info("  %s", title)
    log.info("─" * 55)


# ── Step 1: Enable GCP APIs ──────────────────────────────────────────────────

def enable_apis() -> None:
    banner("Step 1: Enabling GCP APIs")
    apis = [
        "run.googleapis.com",
        "artifactregistry.googleapis.com",
        "alloydb.googleapis.com",
        "servicenetworking.googleapis.com",
        "aiplatform.googleapis.com",
        "secretmanager.googleapis.com",
        "cloudbuild.googleapis.com",
        "iam.googleapis.com",
        "compute.googleapis.com",
        "vpcaccess.googleapis.com",
    ]
    run(f"gcloud services enable {' '.join(apis)} --project {PROJECT_ID}")
    log.info("  All APIs enabled.")


# ── Step 2: Artifact Registry ────────────────────────────────────────────────

def create_artifact_registry() -> None:
    banner("Step 2: Artifact Registry")
    result = run(
        f"gcloud artifacts repositories describe {AR_REPO} "
        f"--location {REGION} --project {PROJECT_ID}",
        fatal=False,
    )
    if result.returncode == 0:
        log.info("  Artifact Registry repo '%s' already exists — skipping.", AR_REPO)
        return

    run(
        f"gcloud artifacts repositories create {AR_REPO} "
        f"--repository-format docker "
        f"--location {REGION} "
        f"--description \"SpectaSyncAI Docker images\" "
        f"--project {PROJECT_ID}"
    )
    log.info("  Artifact Registry repo created: %s/%s", REGION, AR_REPO)


# ── Step 3: Service Account (least-privilege IAM) ────────────────────────────

def create_service_account() -> None:
    banner("Step 3: Service Account & IAM")

    result = run(
        f"gcloud iam service-accounts describe {SA_EMAIL} --project {PROJECT_ID}",
        fatal=False,
    )
    if result.returncode != 0:
        run(
            f"gcloud iam service-accounts create {SA_NAME} "
            f"--display-name \"SpectaSyncAI Cloud Run Runner\" "
            f"--project {PROJECT_ID}"
        )

    # Least-privilege roles only
    roles = [
        "roles/aiplatform.user",           # Vertex AI + context caching
        "roles/alloydb.client",            # AlloyDB connect
        "roles/secretmanager.secretAccessor",  # Secret Manager
        "roles/logging.logWriter",         # Cloud Logging
        "roles/monitoring.metricWriter",   # Cloud Monitoring
        "roles/artifactregistry.reader",   # Pull own images
    ]
    for role in roles:
        run(
            f"gcloud projects add-iam-policy-binding {PROJECT_ID} "
            f"--member serviceAccount:{SA_EMAIL} "
            f"--role {role} "
            f"--condition None --quiet",
            fatal=False,  # idempotent — binding may already exist
        )
    log.info("  Service account '%s' configured with %d roles.", SA_NAME, len(roles))


# ── Step 4: AlloyDB Cluster + Instance ──────────────────────────────────────

def create_alloydb() -> None:
    banner("Step 4: AlloyDB Cluster + Instance")

    # Check if cluster already exists
    result = run(
        f"gcloud alloydb clusters describe {ALLOYDB_CLUSTER} "
        f"--region {REGION} --project {PROJECT_ID}",
        fatal=False,
    )
    if result.returncode == 0:
        log.info("  AlloyDB cluster '%s' already exists — skipping creation.", ALLOYDB_CLUSTER)
    else:
        log.info("  Creating AlloyDB cluster (this takes ~3 minutes)...")
        run(
            f"gcloud alloydb clusters create {ALLOYDB_CLUSTER} "
            f"--region {REGION} "
            f"--project {PROJECT_ID} "
            f"--password=SpectaSyncAI2026!Secure "
            f"--async"
        )
        log.info("  Cluster creation started (async). Waiting 180s for provisioning...")
        time.sleep(180)

    # Check if primary instance exists
    result = run(
        f"gcloud alloydb instances describe {ALLOYDB_INSTANCE} "
        f"--cluster {ALLOYDB_CLUSTER} "
        f"--region {REGION} --project {PROJECT_ID}",
        fatal=False,
    )
    if result.returncode == 0:
        log.info("  AlloyDB instance '%s' already exists — skipping.", ALLOYDB_INSTANCE)
    else:
        log.info("  Creating AlloyDB primary instance...")
        run(
            f"gcloud alloydb instances create {ALLOYDB_INSTANCE} "
            f"--cluster {ALLOYDB_CLUSTER} "
            f"--region {REGION} "
            f"--project {PROJECT_ID} "
            f"--instance-type PRIMARY "
            f"--cpu-count 2"
        )

    log.info("  AlloyDB ready: cluster=%s instance=%s", ALLOYDB_CLUSTER, ALLOYDB_INSTANCE)
    log.info("")
    log.info("  NEXT STEPS for AlloyDB (manual — requires private networking):")
    log.info("    1. Note the AlloyDB private IP from GCP Console > AlloyDB.")
    log.info("    2. Install AlloyDB Auth Proxy on your Cloud Run service, OR")
    log.info("       use AlloyDB Connector (recommended): pip install google-cloud-alloydb-connector")
    log.info("    3. Set DATABASE_URL in Secret Manager (see Step 5 below).")


# ── Step 5: Secret Manager ───────────────────────────────────────────────────

def setup_secrets() -> None:
    banner("Step 5: Secret Manager")
    log.info("  Creating secret placeholder for DATABASE_URL ...")

    result = run(
        f"gcloud secrets describe spectasync-db-url --project {PROJECT_ID}",
        fatal=False,
    )
    if result.returncode != 0:
        run(
            f"echo 'REPLACE_WITH_ALLOYDB_CONNECTOR_URL' | "
            f"gcloud secrets create spectasync-db-url "
            f"--data-file=- --project {PROJECT_ID}"
        )
        log.info("  Secret 'spectasync-db-url' created.")
        log.info("  Update it after AlloyDB is ready:")
        log.info("    echo 'postgresql+asyncpg://...' | gcloud secrets versions add spectasync-db-url --data-file=-")
    else:
        log.info("  Secret 'spectasync-db-url' already exists.")


# ── Step 6: Print IAM grant for default compute SA ───────────────────────────

def print_compute_sa_reminder() -> None:
    banner("Step 6: Compute Default SA (reminder)")
    log.info("  If using Cloud Build (--source deploy), also grant roles to the")
    log.info("  Cloud Build SA so it can push to Artifact Registry:")
    log.info("")
    log.info(
        "  gcloud projects add-iam-policy-binding %s \\\n"
        "    --member=serviceAccount:$(gcloud projects describe %s --format='value(projectNumber)')@cloudbuild.gserviceaccount.com \\\n"
        "    --role=roles/artifactregistry.writer",
        PROJECT_ID, PROJECT_ID,
    )


# ── Main ─────────────────────────────────────────────────────────────────────

def main() -> None:
    log.info("=" * 55)
    log.info("  SpectaSyncAI — GCP Infrastructure Setup")
    log.info(f"  Project : {PROJECT_ID}")
    log.info(f"  Region  : {REGION}")
    log.info("=" * 55)

    run(f"gcloud config set project {PROJECT_ID}")
    run(f"gcloud config set run/region {REGION}")

    enable_apis()
    create_artifact_registry()
    create_service_account()
    create_alloydb()
    setup_secrets()
    print_compute_sa_reminder()

    log.info("")
    log.info("=" * 55)
    log.info("  Setup complete. Run next:")
    log.info("  python scripts/deploy_cloudrun.py")
    log.info("=" * 55)


if __name__ == "__main__":
    main()
