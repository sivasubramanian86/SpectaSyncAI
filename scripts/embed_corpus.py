"""SpectaSyncAI: Corpus Embedding Script
Generates text-embedding-004 vectors for all 18 incidents in incident_registry
and writes them back to AlloyDB.

Run once after schema.sql + seed_corpus.sql have been applied:
    python scripts/embed_corpus.py

Pre-requisites:
    - DATABASE_URL set in .env
    - GOOGLE_CLOUD_PROJECT set in .env
    - GOOGLE_GENAI_USE_VERTEXAI=1 in .env
    - gcloud auth application-default login completed

@11_database_architect: uses connection pool, idempotent (skips already-embedded rows)
@19_cost_efficiency_architect: batches embedding calls to minimise API round-trips
"""

from __future__ import annotations

import asyncio
import logging
import os
import sys
from pathlib import Path

# Allow running from repo root
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from dotenv import load_dotenv

# Force override to ensure .env values take precedence over system environment variables
load_dotenv(override=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)

EMBEDDING_MODEL = "text-embedding-004"
BATCH_SIZE = 10  # Vertex AI text-embedding-004 supports up to 250 texts/batch


async def fetch_unembedded(conn) -> list[dict]:
    """Returns incident rows that have not yet been embedded."""
    rows = await conn.fetch(
        "SELECT incident_id, description_text FROM incident_registry WHERE embedding IS NULL"
    )
    return [dict(r) for r in rows]


async def embed_batch(texts: list[str]) -> list[list[float]]:
    """Calls Vertex AI text-embedding-004 for a batch of texts."""
    import vertexai
    from vertexai.language_models import TextEmbeddingModel

    project = os.environ["GOOGLE_CLOUD_PROJECT"]
    location = os.getenv("GOOGLE_CLOUD_LOCATION", "asia-southeast1")
    vertexai.init(project=project, location=location)

    model = TextEmbeddingModel.from_pretrained(EMBEDDING_MODEL)
    results = model.get_embeddings(texts)
    return [r.values for r in results]


async def write_embeddings(conn, rows: list[dict], vectors: list[list[float]]) -> None:
    """Updates the embedding column for each incident."""
    from pgvector.asyncpg import register_vector

    await register_vector(conn)

    for row, vector in zip(rows, vectors, strict=False):
        await conn.execute(
            """
            UPDATE incident_registry
            SET embedding = $1::vector, embedded_at = NOW()
            WHERE incident_id = $2
            """,
            vector,
            row["incident_id"],
        )
        log.info("  Embedded: %s (%d dims)", row["incident_id"], len(vector))


async def main() -> None:
    import asyncpg

    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        log.error("DATABASE_URL is not set. Add it to your .env file.")
        sys.exit(1)

    log.info("=" * 55)
    log.info("  SpectaSyncAI — Corpus Embedding Pipeline")
    log.info(f"  Model : {EMBEDDING_MODEL} (768 dims)")
    log.info(f"  DB    : {db_url[:40]}...")
    log.info("=" * 55)

    pool = await asyncpg.create_pool(db_url, min_size=1, max_size=3)

    async with pool.acquire() as conn:
        unembedded = await fetch_unembedded(conn)

    if not unembedded:
        log.info("All incidents already embedded — nothing to do.")
        return

    log.info(f"Found {len(unembedded)} incident(s) without embeddings.")

    # Process in batches
    total_embedded = 0
    for i in range(0, len(unembedded), BATCH_SIZE):
        batch = unembedded[i : i + BATCH_SIZE]
        texts = [r["description_text"] for r in batch]
        ids = [r["incident_id"] for r in batch]

        log.info(f"Embedding batch {i // BATCH_SIZE + 1}: {ids}")
        vectors = await embed_batch(texts)

        async with pool.acquire() as conn:
            await write_embeddings(conn, batch, vectors)

        total_embedded += len(batch)

    await pool.close()

    log.info("")
    log.info(f"Done. Embedded {total_embedded} incident(s).")
    log.info("HNSW index will auto-update on next AlloyDB query.")
    log.info("")
    log.info("Next step: verify with")
    log.info(
        '  psql $DATABASE_URL -c "SELECT incident_id, embedded_at FROM incident_registry ORDER BY year;"'
    )


if __name__ == "__main__":
    asyncio.run(main())
