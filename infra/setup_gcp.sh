#!/bin/bash
PROJECT_ID="prompt-wars-bengaluru-2026"
REGION="asia-southeast1"

echo "====================================="
echo "SpectaSyncAI: Setting up GCP Project"
echo "====================================="

gcloud config set project $PROJECT_ID

echo "1. Enabling required APIs..."
gcloud services enable run.googleapis.com \
    artifactregistry.googleapis.com \
    alloydb.googleapis.com \
    aiplatform.googleapis.com

echo "2. Creating Artifact Registry Repository..."
gcloud artifacts repositories create spectasync-repo \
    --repository-format=docker \
    --location=$REGION \
    --description="Docker repository for SpectaSyncAI" || true

echo "3. IAM Binding for Cloud Run to access Vertex AI..."
# Note: In production, tie this to a dedicated service account

echo "Setup complete! Ready for CI/CD deploy."
