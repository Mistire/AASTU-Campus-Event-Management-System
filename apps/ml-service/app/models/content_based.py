import numpy as np
from sklearn.metrics.pairwise import cosine_similarity


class ContentBasedModel:

    def __init__(self):
        self.event_features = None
        self.similarity_matrix = None
        self.is_fitted = False

    def fit(self, event_features):
        self.event_features = event_features
        self.similarity_matrix = cosine_similarity(event_features)
        self.is_fitted = True

    def predict_for_user(self, user_profile, n=10, exclude_ids=None):
        scores = cosine_similarity(
            user_profile.reshape(1, -1), self.event_features
        ).flatten()

        if exclude_ids:
            for idx in exclude_ids:
                scores[idx] = -1

        top_n = scores.argsort()[-n:][::-1]
        return [(int(idx), float(scores[idx])) for idx in top_n]

    def predict_similar(self, event_idx, n=10):
        scores = self.similarity_matrix[event_idx]
        # Exclude itself
        top_n = scores.argsort()[-(n + 1):-1][::-1]
        return [(int(idx), float(scores[idx])) for idx in top_n]
