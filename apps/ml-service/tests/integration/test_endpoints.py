import pytest

def test_health_endpoint(client, mocker):
    mocker.patch("app.main.get_state", return_value={
        "hybrid_model": "mock_model",
        "last_trained": "2026-01-01T00:00:00Z"
    })
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {
        "status": "healthy",
        "service": "ml-recommendation",
        "version": "0.1.0",
        "models_loaded": True,
        "last_trained": "2026-01-01T00:00:00Z"
    }

def test_predict_endpoint_success(client, mocker):
    mocker.patch("app.main.get_recommendations", return_value=(
        [{"event_id": "event-1", "score": 0.9, "title": "Test Event"}],
        "hybrid",
        False
    ))
    
    response = client.get("/predict/user-1?n=1")
    assert response.status_code == 200
    data = response.json()
    assert data["user_id"] == "user-1"
    assert data["model_used"] == "hybrid"
    assert data["is_cold_start"] is False
    assert len(data["recommendations"]) == 1
    assert data["recommendations"][0]["event_id"] == "event-1"

def test_predict_endpoint_service_unavailable(client, mocker):
    mocker.patch("app.main.get_recommendations", side_effect=RuntimeError("Models not loaded"))
    
    response = client.get("/predict/user-1")
    assert response.status_code == 503
    assert response.json()["detail"] == "Models not loaded"

def test_similar_endpoint_success(client, mocker):
    mocker.patch("app.main.get_similar_events", return_value=[
        {"event_id": "event-2", "score": 0.85, "title": "Similar Event"}
    ])
    
    response = client.get("/similar/event-1")
    assert response.status_code == 200
    data = response.json()
    assert data["event_id"] == "event-1"
    assert len(data["similar_events"]) == 1

def test_retrain_endpoint_success(client, mocker):
    mocker.patch("app.main.retrain", return_value={
        "events_count": 10,
        "users_count": 5,
        "registrations_count": 15,
        "last_trained": "2026-01-01T00:00:00Z"
    })
    
    response = client.post("/retrain")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["events_count"] == 10
    assert data["users_count"] == 5
