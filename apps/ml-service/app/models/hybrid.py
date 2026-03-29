import numpy as np
from app.models.content_based import ContentBasedModel
from app.models.collaborative import CollaborativeModel


class HybridRecommender:

    COLD_START_THRESHOLD = 3

    def __init__(self, content_weight=0.6, collab_weight=0.4):
        self.content_model = ContentBasedModel()
        self.collab_model = CollaborativeModel()
        self.content_weight = content_weight
        self.collab_weight = collab_weight
        self.is_fitted = False

    def fit(self, event_features, interaction_matrix, n_factors=50):
        self.content_model.fit(event_features)
        self.collab_model = CollaborativeModel(n_factors=n_factors)
        self.collab_model.fit(interaction_matrix)
        self.is_fitted = True

    def predict(self, user_profile, user_idx, n_interactions,
                n=10, exclude_ids=None):

        # Content-based scores (always available)
        cb_results = self.content_model.predict_for_user(
            user_profile, n=n * 3, exclude_ids=exclude_ids
        )

        # Cold-start: content-based only
        if n_interactions < self.COLD_START_THRESHOLD:
            return cb_results[:n]

        # Collaborative scores
        cf_results = self.collab_model.predict(
            user_idx, n=n * 3, exclude_ids=exclude_ids
        )

        # Weighted merge
        return self._merge(cb_results, cf_results, n)

    def predict_similar(self, event_idx, n=10):
        return self.content_model.predict_similar(event_idx, n)

    def _merge(self, cb_results, cf_results, n):
        scores = {}

        # Normalize CB scores to [0, 1]
        cb_scores = [s for _, s in cb_results]
        cb_min, cb_max = min(cb_scores), max(cb_scores)
        cb_range = cb_max - cb_min if cb_max > cb_min else 1.0

        for idx, score in cb_results:
            norm = (score - cb_min) / cb_range
            scores[idx] = scores.get(idx, 0) + self.content_weight * norm

        # Normalize CF scores to [0, 1]
        cf_scores = [s for _, s in cf_results]
        cf_min, cf_max = min(cf_scores), max(cf_scores)
        cf_range = cf_max - cf_min if cf_max > cf_min else 1.0

        for idx, score in cf_results:
            norm = (score - cf_min) / cf_range
            scores[idx] = scores.get(idx, 0) + self.collab_weight * norm

        ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        return [(int(idx), float(score)) for idx, score in ranked[:n]]
