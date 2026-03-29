from pydantic import BaseModel
from typing import Optional


class RecommendationItem(BaseModel):
    event_id: str
    score: float
    title: Optional[str] = None


class RecommendationResponse(BaseModel):
    user_id: str
    recommendations: list[RecommendationItem]
    model_used: str
    is_cold_start: bool


class SimilarEventsResponse(BaseModel):
    event_id: str
    similar_events: list[RecommendationItem]


class RetrainResponse(BaseModel):
    status: str
    message: str
    events_count: int
    users_count: int
    registrations_count: int


class SchedulerStatus(BaseModel):
    running: bool
    jobs: list[dict]
