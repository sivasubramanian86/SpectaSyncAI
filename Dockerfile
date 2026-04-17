# ── Stage 1: Build Frontend ──────────────────────────────────────────────────
FROM node:22-slim AS build-web
WORKDIR /web
COPY web/package*.json ./
RUN npm install
COPY web/ ./
RUN npm run build

# ── Stage 2: Python Runtime ──────────────────────────────────────────────────
FROM python:3.12-slim AS base
LABEL maintainer="SpectaSyncAI"
LABEL org.opencontainers.image.version="3.1.0"

WORKDIR /app

# Prevent .pyc files; send logs to stdout (Cloud Run requirement)
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app

# System deps: gcc + libpq for asyncpg; curl for health probes
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY agents/     agents/
COPY api/        api/
COPY mcp_server/ mcp_server/
COPY db/         db/

# Copy built frontend assets to static folder
COPY --from=build-web /web/dist /app/static

# ── API Service (default) ────────────────────────────────────────────────────
EXPOSE 8080
CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8080", \
     "--workers", "1", "--log-level", "info"]
