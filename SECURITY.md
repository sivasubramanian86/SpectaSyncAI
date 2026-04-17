# Security Policy

## Reporting a Vulnerability

We take the security of the SpectaSyncAI platform and the safety of our crowd intelligence research seriously. If you believe you have found a security vulnerability, please report it to us responsibly.

**Please do not report security vulnerabilities through public GitHub issues.**

### Reporting Process

1. **Email:** Send your report to `security@spectasync.ai` (simulated for hackathon).
2. **Details:** Include a detailed description of the vulnerability, steps to reproduce, and potential impact.
3. **Response Time:** We aim to acknowledge reports within 24 hours during the hackathon period.

## Scope

The following components are in scope for security reviews:
- **12-Agent Mesh Hub:** Logic for agent orchestration and spatial reasoning.
- **Incident RAG Agent:** Integrity of the global incident corpus and retrieval logic.
- **MCP Server:** Authorization and safety of the 7 intervention tools.
- **FastAPI / React Dashboard:** PII scrubbing and data visualization.

## Security Principles

- **Zero Hardcoded Secrets:** All credentials must be managed via GCP Secret Manager or environment variables.
- **PII Scrubbing:** The system automatically anonymizes all crowd data at the point of ingestion (Vision Agent).
- **HITL (Human-In-The-Loop):** Critical interventions (e.g., Evacuation Protocol) require explicit operator confirmation before execution.
- **ADK Sandbox:** Agents operate within scoped ADK sessions with no direct shell access.
