from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import get_database_url
import os

db_url = get_database_url()

# Attempt connection to configured PostgreSQL
use_sqlite_fallback = False
try:
    engine = create_engine(db_url, pool_pre_ping=True)
    with engine.connect() as conn:
        print("[Database] Successfully connected to PostgreSQL.")
except Exception as e:
    print(f"[Database] PostgreSQL connection failed ({e}). Activating resilient local database engine...")
    use_sqlite_fallback = True
    os.makedirs("data", exist_ok=True)
    sqlite_url = "sqlite:///./data/agentflow_local.db"
    engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})
    print("[Database] Resilient local database engine active.")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
