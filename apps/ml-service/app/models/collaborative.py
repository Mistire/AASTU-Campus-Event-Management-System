import numpy as np
from scipy.sparse import csr_matrix
from scipy.sparse.linalg import svds


class CollaborativeModel:

    def __init__(self, n_factors=50):
        self.n_factors = n_factors
        self.predicted_ratings = None
        self.is_fitted = False

    def fit(self, interaction_matrix):
        matrix = interaction_matrix.astype(float)

        # k must be less than min(matrix.shape) - 1
        k = min(self.n_factors, min(matrix.shape) - 1)
        if k < 1:
            self.predicted_ratings = matrix
            self.is_fitted = True
            return

        sparse_matrix = csr_matrix(matrix)
        U, sigma, Vt = svds(sparse_matrix, k=k)
        self.predicted_ratings = U @ np.diag(sigma) @ Vt
        self.is_fitted = True

    def predict(self, user_idx, n=10, exclude_ids=None):
        scores = self.predicted_ratings[user_idx].copy()

        if exclude_ids:
            for idx in exclude_ids:
                scores[idx] = -np.inf

        top_n = scores.argsort()[-n:][::-1]
        return [(int(idx), float(scores[idx])) for idx in top_n]
