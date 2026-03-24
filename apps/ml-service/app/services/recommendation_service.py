import logging
import joblib
import os
import uuid as _uuid
from datetime import datetime

from app.config import settings
from app.utils.database import load_all_tables
from app.utils.preprocessing import run_full_cleaning_pipeline
from app.features.event_features import EventFeatureBuilder
from app.features.user_features import UserFeatureBuilder, build_interaction_matrix
from app.models.hybrid import HybridRecommender

logger = logging.getLogger(__name__)

# In-memory model state
_state = {
    "hybrid_model": None,
    "event_features": None,
    "user_profiles": None,
    "event_id_to_idx": None,
    "idx_to_event_id": None,
    "user_id_to_idx": None,
    "idx_to_user_id": None,
    "user_interaction_counts": None,
    "events_df": None,
    "last_trained": None,
}


def get_state():
    return _state


def load_models():
    model_dir = settings.model_path
    required = ["hybrid_model.pkl", "event_features.pkl", "user_profiles.pkl",
                "event_id_to_idx.pkl", "idx_to_event_id.pkl",
                "user_id_to_idx.pkl", "idx_to_user_id.pkl",
                "user_interaction_counts.pkl"]

    if not all(os.path.exists(os.path.join(model_dir, f)) for f in required):
        logger.warning("Trained models not found. Run /retrain first.")
        return False

    _state["hybrid_model"] = joblib.load(os.path.join(model_dir, "hybrid_model.pkl"))
    _state["event_features"] = joblib.load(os.path.join(model_dir, "event_features.pkl"))
    _state["user_profiles"] = joblib.load(os.path.join(model_dir, "user_profiles.pkl"))
    _state["event_id_to_idx"] = joblib.load(os.path.join(model_dir, "event_id_to_idx.pkl"))
    _state["idx_to_event_id"] = joblib.load(os.path.join(model_dir, "idx_to_event_id.pkl"))
    _state["user_id_to_idx"] = joblib.load(os.path.join(model_dir, "user_id_to_idx.pkl"))
    _state["idx_to_user_id"] = joblib.load(os.path.join(model_dir, "idx_to_user_id.pkl"))
    _state["user_interaction_counts"] = joblib.load(os.path.join(model_dir, "user_interaction_counts.pkl"))

    import pandas as pd
    from app.utils.database import get_engine
    try:
        _state["events_df"] = pd.read_sql("SELECT id, title FROM events", get_engine())
    except Exception:
        _state["events_df"] = None

    _state["last_trained"] = datetime.utcnow().isoformat()
    logger.info("Models loaded successfully")
    return True


def retrain():
    logger.info("Starting retrain pipeline...")
    model_dir = settings.model_path
    os.makedirs(model_dir, exist_ok=True)

    # 1. Load fresh data from DB
    raw_data = load_all_tables()
    logger.info(f"Loaded {len(raw_data['users'])} users, {len(raw_data['events'])} events")

    # 2. Clean
    cleaned = run_full_cleaning_pipeline(raw_data)

    # 3. Build event features
    eb = EventFeatureBuilder(max_tfidf_features=100)
    ef, eid2idx, idx2eid = eb.fit_transform(
        cleaned["events"], cleaned["registrations"],
        cleaned["feedback"], cleaned["categories"]
    )

    # 4. Build user profiles
    ub = UserFeatureBuilder(ef, eid2idx)
    profiles, uid2idx, idx2uid, counts = ub.build_all_profiles(
        cleaned["users"], cleaned["registrations"],
        cleaned["attendance"], cleaned["feedback"],
        cleaned["user_interests"], cleaned["events"]
    )

    # 5. Build interaction matrix
    im, _, _ = build_interaction_matrix(
        cleaned["users"], cleaned["events"],
        cleaned["registrations"], cleaned["attendance"],
        cleaned["feedback"]
    )

    # 6. Train hybrid model
    hybrid = HybridRecommender(
        content_weight=settings.content_weight,
        collab_weight=settings.collab_weight,
    )
    n_factors = min(20, min(im.shape) - 1)
    hybrid.fit(ef, im, n_factors=max(n_factors, 1))

    # 7. Save all artifacts
    joblib.dump(hybrid, os.path.join(model_dir, "hybrid_model.pkl"))
    joblib.dump(ef, os.path.join(model_dir, "event_features.pkl"))
    joblib.dump(profiles, os.path.join(model_dir, "user_profiles.pkl"))
    joblib.dump(eid2idx, os.path.join(model_dir, "event_id_to_idx.pkl"))
    joblib.dump(idx2eid, os.path.join(model_dir, "idx_to_event_id.pkl"))
    joblib.dump(uid2idx, os.path.join(model_dir, "user_id_to_idx.pkl"))
    joblib.dump(idx2uid, os.path.join(model_dir, "idx_to_user_id.pkl"))
    joblib.dump(counts, os.path.join(model_dir, "user_interaction_counts.pkl"))
    joblib.dump(eb, os.path.join(model_dir, "event_feature_builder.pkl"))

    # 8. Reload into memory
    load_models()

    stats = {
        "events_count": len(cleaned["events"]),
        "users_count": len(cleaned["users"]),
        "registrations_count": len(cleaned["registrations"]),
    }
    logger.info(f"Retrain complete: {stats}")
    return stats


def _resolve_key(key, mapping):
    """Try both string and UUID versions of a key."""
    if key in mapping:
        return key
    try:
        uuid_key = _uuid.UUID(str(key))
        if uuid_key in mapping:
            return uuid_key
    except (ValueError, AttributeError):
        pass
    return None


def get_recommendations(user_id, n=10):
    s = _state
    if s["hybrid_model"] is None:
        raise RuntimeError("Models not loaded. Call /retrain first.")

    resolved_uid = _resolve_key(user_id, s["user_profiles"])
    profile = s["user_profiles"].get(resolved_uid) if resolved_uid else None
    uidx = s["user_id_to_idx"].get(resolved_uid) if resolved_uid else None
    cnt = s["user_interaction_counts"].get(resolved_uid, 0) if resolved_uid else 0

    is_cold_start = cnt < HybridRecommender.COLD_START_THRESHOLD

    if profile is None:
        # Completely unknown user: return popular events
        import numpy as np
        ef = s["event_features"]
        popularity = ef[:, -2].toarray().flatten() if hasattr(ef[:, -2], 'toarray') else ef[:, -2]
        top_n = popularity.argsort()[-n:][::-1] if hasattr(popularity, 'argsort') else list(range(n))
        results = [(int(idx), 0.5) for idx in top_n]
        model_used = "popularity_fallback"
    else:
        results = s["hybrid_model"].predict(profile, uidx, cnt, n=n)
        model_used = "content_only" if is_cold_start else "hybrid"

    # Map indices to event IDs and titles
    events_df = s.get("events_df")
    recommendations = []
    for idx, score in results:
        eid = s["idx_to_event_id"].get(idx, "unknown")
        title = None
        if events_df is not None:
            match = events_df[events_df["id"] == eid]
            if not match.empty:
                title = str(match.iloc[0]["title"])
        recommendations.append({"event_id": str(eid), "score": round(score, 4), "title": title})

    return recommendations, model_used, is_cold_start


def get_similar_events(event_id, n=10):
    s = _state
    if s["hybrid_model"] is None:
        raise RuntimeError("Models not loaded. Call /retrain first.")

    resolved_eid = _resolve_key(event_id, s["event_id_to_idx"])
    if resolved_eid is None:
        raise ValueError(f"Event {event_id} not found")
    eidx = s["event_id_to_idx"][resolved_eid]

    results = s["hybrid_model"].predict_similar(eidx, n=n)

    events_df = s.get("events_df")
    similar = []
    for idx, score in results:
        eid = s["idx_to_event_id"].get(idx, "unknown")
        title = None
        if events_df is not None:
            match = events_df[events_df["id"] == eid]
            if not match.empty:
                title = str(match.iloc[0]["title"])
        similar.append({"event_id": str(eid), "score": round(score, 4), "title": title})

    return similar
