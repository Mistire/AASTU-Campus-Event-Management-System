import os

class Settings:

    database_url: str = os.getenv(
        "DATABASE_URL",
        "postgresql://cems:cems_secret@localhost:5432/cems_db",
    )
    model_path: str = os.getenv("MODEL_PATH", "trained_models")
    content_weight: float = float(os.getenv("CONTENT_WEIGHT", "0.6"))
    collab_weight: float = float(os.getenv("COLLAB_WEIGHT", "0.4"))
    cold_start_threshold: int = int(os.getenv("COLD_START_THRESHOLD", "3"))
    cache_ttl: int = int(os.getenv("CACHE_TTL", "3600"))


settings = Settings()
