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
        "event_categories": pd.read_sql("SELECT * FROM event_categories", engine),
        "interests": pd.read_sql("SELECT * FROM interests", engine),
        "registrations": pd.read_sql(
            "SELECT r.*, rs.name as status FROM registrations r JOIN registration_status rs ON r.status_id = rs.id",
            engine
        ),
        "attendance": pd.read_sql("SELECT * FROM attendance", engine),
        "feedback": pd.read_sql("SELECT * FROM feedback", engine),
        "user_interests": pd.read_sql("SELECT * FROM user_interests", engine),
    }
