import pandas as pd
from sqlalchemy import create_engine
from app.config import settings


_engine = None


def get_engine():
    global _engine
    if _engine is None:
        _engine = create_engine(settings.database_url)
    return _engine


def load_all_tables():
    engine = get_engine()
    return {
        "users": pd.read_sql("SELECT * FROM users", engine),
        "events": pd.read_sql("SELECT * FROM events", engine),
        "categories": pd.read_sql("SELECT * FROM categories", engine),
        "interests": pd.read_sql("SELECT * FROM interests", engine),
        "registrations": pd.read_sql("SELECT * FROM registrations", engine),
        "attendance": pd.read_sql("SELECT * FROM attendance", engine),
        "feedback": pd.read_sql("SELECT * FROM feedback", engine),
        "user_interests": pd.read_sql("SELECT * FROM user_interests", engine),
    }
