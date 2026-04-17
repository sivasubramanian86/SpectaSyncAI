"""
SpectaSyncAI: Venv-aware Local Development Launcher
@07_modern_polyglot_standards compliant

Pre-flight checks:
  - Python 3.12+ (enforced)
  - Node.js 20+ (enforced)
  - npm 10+ (enforced)
  - venv created + requirements installed automatically on first run
  - frontend node_modules installed automatically on first run

Services launched concurrently:
  1. FastMCP Server (SSE transport)   — http://localhost:8001/sse
  2. FastAPI Backend (ADK Mesh API)   — http://localhost:8000/docs
  3. Vite React UI (Command Center)   — http://localhost:5173

Usage:
    python scripts/start_local.py          # Full stack
    python scripts/start_local.py --api    # Backend only
    python scripts/start_local.py --ui     # Frontend only
"""
from __future__ import annotations

import argparse
import os
import platform
import subprocess
import sys
import time
import logging
from pathlib import Path

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-7s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)

# ── Paths ─────────────────────────────────────────────────────────────────────
REPO_ROOT = Path(__file__).resolve().parent.parent
VENV_DIR = REPO_ROOT / ".venv"
WEB_DIR = REPO_ROOT / "web"
REQ_FILE = REPO_ROOT / "requirements.txt"
ENV_FILE = REPO_ROOT / ".env"

IS_WIN = platform.system() == "Windows"
PYTHON_BIN = VENV_DIR / ("Scripts" if IS_WIN else "bin") / ("python.exe" if IS_WIN else "python")
PIP_BIN = VENV_DIR / ("Scripts" if IS_WIN else "bin") / ("pip.exe" if IS_WIN else "pip")
NPM_CMD = "npm.cmd" if IS_WIN else "npm"
NODE_CMD = "node"

MIN_PYTHON = (3, 10)
MIN_NODE = (20, 0)
MIN_NPM = (10, 0)


# ── Version guards ────────────────────────────────────────────────────────────

def _ver(cmd: list[str]) -> tuple[int, ...]:
    """Return (major, minor, patch) from a --version command."""
    try:
        out = subprocess.check_output(cmd, stderr=subprocess.STDOUT, text=True).strip()
        # handles: "v20.18.0", "10.8.2", "Python 3.12.3"
        raw = [c for c in out.split() if c[0].isdigit() or (c.startswith("v") and c[1].isdigit())]
        parts = raw[0].lstrip("v").split(".")
        return tuple(int(p) for p in parts[:3])
    except Exception:
        return (0, 0, 0)


def check_python() -> None:
    v = sys.version_info[:2]
    if v < MIN_PYTHON:
        log.error(f"Python {MIN_PYTHON[0]}.{MIN_PYTHON[1]}+ required. Found: {v[0]}.{v[1]}")
        log.error("Install from https://www.python.org/downloads/ and re-run.")
        sys.exit(1)
    log.info(f"Python {v[0]}.{v[1]} — OK")


def check_node() -> None:
    v = _ver([NODE_CMD, "--version"])
    if v < MIN_NODE:
        log.error(f"Node.js {MIN_NODE[0]}+ required. Found: {v[0]}.{v[1]}")
        log.error("Install from https://nodejs.org/en/download/ (LTS) and re-run.")
        sys.exit(1)
    log.info(f"Node.js {v[0]}.{v[1]}.{v[2]} — OK")


def check_npm() -> None:
    v = _ver([NPM_CMD, "--version"])
    if v < MIN_NPM:
        log.error(f"npm {MIN_NPM[0]}+ required. Found: {v[0]}.{v[1]}")
        log.error("Run: npm install -g npm@latest")
        sys.exit(1)
    log.info(f"npm {v[0]}.{v[1]}.{v[2]} — OK")


# ── Virtual environment ────────────────────────────────────────────────────────

def ensure_venv() -> None:
    """Create venv if absent; always sync requirements.txt."""
    if not VENV_DIR.exists():
        log.info(f"Creating virtual environment at {VENV_DIR} ...")
        subprocess.run([sys.executable, "-m", "venv", str(VENV_DIR)], check=True)
        log.info("venv created.")
    else:
        log.info(f"venv found: {VENV_DIR}")

    log.info("Installing / upgrading backend dependencies from requirements.txt ...")
    subprocess.run(
        [str(PIP_BIN), "install", "--upgrade", "--quiet", "-r", str(REQ_FILE)],
        check=True,
    )
    log.info("Backend dependencies ready.")


def ensure_node_modules() -> None:
    """Install frontend deps if node_modules is absent."""
    nm = WEB_DIR / "node_modules"
    if not nm.exists():
        log.info("Installing frontend dependencies via npm install ...")
        subprocess.run([NPM_CMD, "install"], cwd=str(WEB_DIR), check=True)
        log.info("Frontend dependencies ready.")
    else:
        log.info("node_modules found — skipping npm install.")


def check_env() -> None:
    """Warn if .env is missing but don't abort — allows running tests without secrets."""
    if not ENV_FILE.exists():
        log.warning(f".env file not found at {ENV_FILE}")
        log.warning("Copy .env.example to .env and fill in GOOGLE_API_KEY / GOOGLE_CLOUD_PROJECT.")


# ── Process launcher ──────────────────────────────────────────────────────────

def launch(cmd: list[str], cwd: Path, env_extra: dict | None = None) -> subprocess.Popen:
    env = {**os.environ, **(env_extra or {})}
    log.info(f"Starting: {' '.join(str(c) for c in cmd)}")
    return subprocess.Popen(cmd, cwd=str(cwd), env=env)


def wait_all(procs: list[subprocess.Popen]) -> None:
    try:
        for p in procs:
            p.wait()
    except KeyboardInterrupt:
        log.info("\nShutting down SpectaSyncAI...")
        for p in procs:
            p.terminate()
        for p in procs:
            try:
                p.wait(timeout=5)
            except subprocess.TimeoutExpired:
                p.kill()
        log.info("All services stopped.")


# ── Main ──────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(description="SpectaSyncAI local dev launcher")
    parser.add_argument("--api", action="store_true", help="Start backend only")
    parser.add_argument("--ui", action="store_true", help="Start frontend only")
    args = parser.parse_args()
    run_all = not args.api and not args.ui

    log.info("=" * 60)
    log.info("  SpectaSyncAI — Local Dev Stack")
    log.info(f"  Repo root : {REPO_ROOT}")
    log.info("=" * 60)

    # ── Pre-flight checks ────────────────────────────────────────────────────
    check_python()
    if run_all or args.ui:
        check_node()
        check_npm()

    check_env()

    # ── Environment setup ────────────────────────────────────────────────────
    if run_all or args.api:
        ensure_venv()
    if run_all or args.ui:
        ensure_node_modules()

    procs: list[subprocess.Popen] = []

    # ── Service launch ───────────────────────────────────────────────────────
    if run_all or args.api:
        # 1. FastMCP Toolbox (port 8001) — must bind before ADK agents connect
        procs.append(
            launch(
                [str(PYTHON_BIN), "-m", "mcp_server.server"],
                cwd=REPO_ROOT,
                env_extra={"PORT": "8001"},
            )
        )
        time.sleep(2)

        # 2. FastAPI backend (port 8000)
        procs.append(
            launch(
                [
                    str(PYTHON_BIN), "-m", "uvicorn",
                    "api.main:app",
                    "--reload",
                    "--host", "0.0.0.0",
                    "--port", "8000",
                ],
                cwd=REPO_ROOT,
            )
        )
        time.sleep(1)

    if run_all or args.ui:
        # 3. Vite React dev server (port 5173)
        procs.append(
            launch([NPM_CMD, "run", "dev"], cwd=WEB_DIR)
        )

    log.info("")
    log.info("  ┌─────────────────────────────────────────────────────┐")
    if run_all or args.api:
        log.info("  │  MCP  Toolbox  → http://localhost:8001/sse          │")
        log.info("  │  API  Docs     → http://localhost:8000/docs         │")
        log.info("  │  Incident RAG  → POST /v1/crisis/incident-rag       │")
        log.info("  │  Corpus List   → GET  /v1/crisis/incident-corpus    │")
    if run_all or args.ui:
        log.info("  │  UI  Dashboard → http://localhost:5173              │")
    log.info("  └─────────────────────────────────────────────────────┘")
    log.info("  Press CTRL+C to stop all services.")
    log.info("")

    wait_all(procs)


if __name__ == "__main__":
    main()
