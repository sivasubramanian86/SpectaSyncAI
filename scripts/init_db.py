import asyncio
import asyncpg

async def init_db():
    print("Connecting to postgres database...")
    conn = await asyncpg.connect("postgresql://postgres:SpectaSyncAI2026!Secure@127.0.0.1:5432/postgres")
    
    print("Creating spectasync database...")
    # Cannot create database in a transaction bloc, so we must execute it with connection
    await conn.execute("COMMIT")
    try:
        await conn.execute("CREATE DATABASE spectasync")
        print("Database 'spectasync' created.")
    except asyncpg.exceptions.DuplicateDatabaseError:
        print("Database 'spectasync' already exists.")
    
    await conn.close()

    print("Connecting to spectasync database to set up extensions and schema...")
    conn2 = await asyncpg.connect("postgresql://postgres:SpectaSyncAI2026!Secure@127.0.0.1:5432/spectasync")
    
    await conn2.execute("CREATE EXTENSION IF NOT EXISTS vector;")
    
    print("Applying schema...")
    with open("db/schema.sql", "r") as f:
        schema = f.read()
    await conn2.execute(schema)
    
    print("Applying seed data...")
    with open("db/seed_corpus.sql", "r") as f:
        seed = f.read()
    await conn2.execute(seed)
    
    await conn2.close()
    print("Database initialization complete.")

if __name__ == "__main__":
    asyncio.run(init_db())
