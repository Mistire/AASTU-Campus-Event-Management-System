import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Query

from app.config import settings
from app.schemas.recommendation import (
    RecommendationResponse,
    SimilarEventsResponse,
    RetrainResponse,
    SchedulerStatus,
)
from app.services.recommendation_service import (
    load_models,
    retrain,
    get_recommendations,
    get_similar_events,
    get_state,
)
from app.scheduler.jobs import start_scheduler, stop_scheduler, get_scheduler_status

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting ML Recommendation Service...")
    loaded = load_models()
    if loaded:
        logger.info("Pre-trained models loaded")
    else:
        logger.info("No pre-trained models found. POST /retrain to train.")
    start_scheduler()
    yield
    # Shutdown
    stop_scheduler()


app = FastAPI(
    title="CEMS Recommendation Engine",
    version="0.1.0",
    lifespan=lifespan,
)


@app.get("/health")
def health():
    state = get_state()
    return {
        "status": "healthy",
        "service": "ml-recommendation",
        "version": "0.1.0",
        "models_loaded": state["hybrid_model"] is not None,
        "last_trained": state["last_trained"],
    }


@app.get("/predict/{user_id}", response_model=RecommendationResponse)
def predict(user_id: str, n: int = Query(default=10, ge=1, le=50)):
    try:
        recs, model_used, is_cold_start = get_recommendations(user_id, n=n)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))

    return RecommendationResponse(
        user_id=user_id,
        recommendations=recs,
        model_used=model_used,
        is_cold_start=is_cold_start,
    )


@app.get("/similar/{event_id}", response_model=SimilarEventsResponse)
def similar(event_id: str, n: int = Query(default=10, ge=1, le=50)):
    try:
        items = get_similar_events(event_id, n=n)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    return SimilarEventsResponse(
        event_id=event_id,
        similar_events=items,
    )


@app.post("/retrain", response_model=RetrainResponse)
def retrain_endpoint():
    try:
        stats = retrain()
    except Exception as e:
        logger.error(f"Retrain failed: {e}")
        raise HTTPException(status_code=500, detail=f"Retrain failed: {e}")

    return RetrainResponse(
        status="success",
        message="Model retrained and reloaded",
        **stats,
    )


@app.get("/scheduler/status", response_model=SchedulerStatus)
def scheduler_status():
    return get_scheduler_status()
