import asyncio
import asyncpg
import contextlib


async def init_db():
    conn = await asyncpg.connect(
        "postgresql://postgres:SpectaSyncAI2026!Secure@127.0.0.1:5432/postgres"
    )

    # Cannot create database in a transaction bloc, so we must execute it with connection
    await conn.execute("COMMIT")
    with contextlib.suppress(asyncpg.exceptions.DuplicateDatabaseError):
        await conn.execute("CREATE DATABASE spectasync")

    await conn.close()

    conn2 = await asyncpg.connect(
        "postgresql://postgres:SpectaSyncAI2026!Secure@127.0.0.1:5432/spectasync"
    )

    await conn2.execute("CREATE EXTENSION IF NOT EXISTS vector;")

    with open("db/schema.sql") as f:
        schema = f.read()
    await conn2.execute(schema)

    with open("db/seed_corpus.sql") as f:
        seed = f.read()
    await conn2.execute(seed)

    await conn2.close()


if __name__ == "__main__":
    asyncio.run(init_db())
