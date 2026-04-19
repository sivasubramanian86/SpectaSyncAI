"""SpectaSyncAI: Test Runner Script
Runs the full pytest suite with coverage reporting.

Usage:
    python scripts/run_tests.py
"""

import subprocess
import sys
import os

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def main() -> None:
    """Test functionality for main."""

    result = subprocess.run(
        [
            sys.executable,
            "-m",
            "pytest",
            "tests/",
            "-v",
            "--tb=short",
            "--cov=agents",
            "--cov=api",
            "--cov-report=term-missing",
            "--cov-fail-under=80",
        ],
        cwd=REPO_ROOT,
    )
    sys.exit(result.returncode)


if __name__ == "__main__":
    main()
