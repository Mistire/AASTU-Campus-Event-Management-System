import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.config import settings

@pytest.fixture
def client():
    # Return the TestClient for API endpoints
    with TestClient(app) as test_client:
        yield test_client

@pytest.fixture(autouse=True)
def mock_env_vars(monkeypatch):
    monkeypatch.setenv("DATABASE_URL", "postgresql://test:test@localhost/test_db")
    monkeypatch.setenv("MODEL_PATH", "tests/mocks/models")
    monkeypatch.setenv("CONTENT_WEIGHT", "0.6")
    monkeypatch.setenv("COLLAB_WEIGHT", "0.4")
    monkeypatch.setenv("COLD_START_THRESHOLD", "3")
