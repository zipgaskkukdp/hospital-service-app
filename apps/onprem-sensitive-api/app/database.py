import os
from collections.abc import Generator

from fastapi import HTTPException
from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker


class Base(DeclarativeBase):
    pass


DATABASE_URL = os.getenv("DATABASE_URL", "")
engine = create_engine(DATABASE_URL, pool_pre_ping=True) if DATABASE_URL else None
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False) if engine else None


def get_session() -> Generator[Session, None, None]:
    if SessionLocal is None:
        raise HTTPException(status_code=503, detail="DATABASE_URL is not configured")
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def init_db() -> None:
    if engine is not None:
        Base.metadata.create_all(bind=engine)


def check_db() -> None:
    if engine is None:
        raise HTTPException(status_code=503, detail="DATABASE_URL is not configured")
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
