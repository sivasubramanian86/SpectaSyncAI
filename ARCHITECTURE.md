# SpectaSyncAI: Tiered Machine Intelligence Architecture (v3.1.3)

![SpectaSyncAI Architecture](file:///d:/Siva/Books/CAREER/HACKATHON/Gen_AI_APAC_2026/SpectaSyncAI/Architecture_Diagram.png)

## 1. Direct Signal Mastery (Tier 0–4)
SpectaSyncAI operates through five decoupled layers of intelligence, ensuring low-latency detection and high-confidence intervention.

### Tier 0: Multi-Modal Ingestion (The Senses)
*   **Vision (VEO/Flash):** Real-time spatial density analysis and precursor detection (e.g., 'stop-and-go' waves).
*   **Acoustic (Lyria):** Panic signature detection and "Information Cascade" monitoring (rumor noise).
*   **Thermal (Imagen):** Stagnation point identification in high-density corridors.

### Tier 1: Real-Time Edge Processing
*   FastAPI endpoints process telemetry from the ingestion layer at sub-200ms latency.
*   Stateless validation of sensor health and data integrity.

### Tier 2: The Agentic Mesh (The Brain)
*   **11-Agent Hub:** Specialized agents (Perimeter, VIP, Rumor, Failsafe) powered by **Gemini 2.5 Pro**.
*   **Orchestration:** CoreOrchestrator manages cross-agent communication via the Google ADK.
*   **Agentic RAG:** IncidentRAGAgent retrieves analogous historical failures (12-incident corpus) via **AlloyDB + pgvector**.

### Tier 3: Actionable HMI (The Interface)
*   **Global I18n:** Command hub support for 12+ languages (Hindi, Telugu, Tamil, Japanese, etc.).
*   **Tactical View:** Real-time digital twin visualization of venue density.

### Tier 4: Governance & HITL (The Shield)
*   **Guardrails:** Automated safety checks for all AI-generated interventions.
*   **HITL:** Human-In-The-Loop mandatory gate for life-critical protocols (Evacuation, Egress-Reverse).

## 2. Security & Safety Guardrails (@10_security_governance)
*   **PII Scrubbing:** Automated anonymization of face/voice metadata before ingestion.
*   **Prompt Injection Filters:** Rigorous system-instruction hardening to prevent agent hijacking.
*   **Hardened IAM:** Least-privilege access for Cloud Run service identities.
*   **Zero-Secret Policy:** All credentials managed via Google Secret Manager (local .env excluded via .gitignore).

## 3. Cost Efficiency & Token Management (@19_cost_efficiency_architect)
*   **Vertex AI Context Caching:** 90% cost reduction for long-running agent threads (11-agent mesh).
*   **Model Selection:** Gemini 1.5/2.5 Flash for high-throughput ingestion; 2.5 Pro only for complex orchestration.
*   **AlloyDB Optimization:** Connection pooling and indexed vector searches minimize compute overhead.

## 4. Code Quality & Test Strategy (@14_quality_assurance_engineer)
*   **Test Coverage (45% -> 85% Target):** While overall coverage is 45%, **Core Intelligence (100%)** and **Safety Routers (92%)** are fully covered. Non-critical UI components are prioritized lower for development speed.
*   **Standardization:** Adheres to `@07_modern_polyglot_standards` (Type hints, Pydantic v2 validation).
*   **Auditability:** Standard output logs all agent decisions for post-event forensic replay.

### Data Flow & Signal Mesh
1. **Perception:** CCTV + Sensors -> Vision Agent -> Spatial Matrix -> PostgreSQL.
2. **Reasoning:** CoreOrchestrator + IncidentRAGAgent (Forensic Analysis) -> Intervention Strategy.
3. **Execution:** MCP Dispatch -> Digital Signage / Staff Pagers / PA System.
4. **Feedback:** Multi-lingual Sentiment Analysis -> Real-time Experience Loop.

### Deployment Hardening
- **Infrastructure:** Dockerized FastAPI & FastMCP on Google Cloud Run.
- **Security:** Prompt-Shield v2 for injection filtering + PII Scrubbing at Ingestion.
- **Availability:** BLE 5.0 Offline Mesh Fallback (Failsafe Agent).
