import numpy as np
import pandas as pd
import scipy.sparse as sp



INTERACTION_WEIGHTS = {
    "interest":     1.0,   # stated preference
    "registration": 2.0,   # committed to attend
    "attendance":   3.0,   # actually showed up
    "rating_pos":   4.0,   # gave 4-5 stars
    "rating_neg":  -1.0,   # gave 1-2 stars
    "rating_mid":   1.5,   # gave 3 stars
}


class UserFeatureBuilder:
    """
    Builds user profile vectors from their interaction history.

    A user's profile = weighted average of event feature vectors
    they interacted with. Stronger interactions (attendance, high rating)
    contribute more than weaker ones (just having a matching interest).
    """

    def __init__(self, event_feature_matrix, event_id_to_idx, categories_mlb=None):
        self.event_features = event_feature_matrix
        self.event_id_to_idx = event_id_to_idx
        self.categories_mlb = categories_mlb
        self.n_features = event_feature_matrix.shape[1]

    def build_all_profiles(
        self,
        users_df,
        registrations_df,
        attendance_df,
        feedback_df,
        user_interests_df,
        events_df,
    ):
        """
        Build profile vectors for ALL users.

        Returns:
            user_profiles: dict of user_id -> numpy array (n_features,)
            user_id_to_idx: dict of user_id -> matrix row index
            idx_to_user_id: dict of matrix row index -> user_id
            user_interaction_counts: dict of user_id -> number of interactions
        """
        user_ids = list(users_df["id"])
        user_id_to_idx = {uid: i for i, uid in enumerate(user_ids)}
        idx_to_user_id = {i: uid for uid, i in user_id_to_idx.items()}

        user_profiles = {}
        user_interaction_counts = {}

        # Pre-index interactions per user for speed
        reg_by_user = registrations_df.groupby("user_id")["event_id"].apply(set).to_dict()
        att_by_user = attendance_df.groupby("user_id")["event_id"].apply(set).to_dict()
        fb_by_user = feedback_df.groupby(["user_id", "event_id"])["rating"].first().to_dict()

        # Stated interests: user_id -> set of category_ids
        interests_by_user = user_interests_df.groupby("user_id")["interest_id"].apply(set).to_dict()

        # Map category IDs to feature indices if MLB is available
        cat_id_to_fidx = {}
        if self.categories_mlb is not None:
            cat_id_to_fidx = {cat_id: i for i, cat_id in enumerate(self.categories_mlb.classes_)}

        for uid in user_ids:
            weighted_vectors = []
            weights = []

            # Stated Interest Signal (handles Cold Start)
            user_interest_ids = interests_by_user.get(uid, set())
            for cid in user_interest_ids:
                fidx = cat_id_to_fidx.get(cid)
                if fidx is not None:
                    # Create a synthetic vector with only this category bit set
                    # This projects the user's interest directly into the event feature space
                    vec = np.zeros(self.n_features)
                    vec[fidx] = 1.0
                    weighted_vectors.append(vec * INTERACTION_WEIGHTS["interest"])
                    weights.append(INTERACTION_WEIGHTS["interest"])

            # Registration signal
            reg_events = reg_by_user.get(uid, set())
            for eid in reg_events:
                idx = self.event_id_to_idx.get(eid)
                if idx is not None:
                    vec = self._to_dense(self.event_features[idx])
                    weighted_vectors.append(vec * INTERACTION_WEIGHTS["registration"])
                    weights.append(INTERACTION_WEIGHTS["registration"])

            # Attendance signal (stronger)
            att_events = att_by_user.get(uid, set())
            for eid in att_events:
                idx = self.event_id_to_idx.get(eid)
                if idx is not None:
                    vec = self._to_dense(self.event_features[idx])
                    weighted_vectors.append(vec * INTERACTION_WEIGHTS["attendance"])
                    weights.append(INTERACTION_WEIGHTS["attendance"])

            # Feedback signal
            for (fuid, eid), rating in fb_by_user.items():
                if fuid != uid:
                    continue
                idx = self.event_id_to_idx.get(eid)
                if idx is not None:
                    vec = self._to_dense(self.event_features[idx])
                    if rating >= 4:
                        w = INTERACTION_WEIGHTS["rating_pos"]
                    elif rating <= 2:
                        w = INTERACTION_WEIGHTS["rating_neg"]
                    else:
                        w = INTERACTION_WEIGHTS["rating_mid"]
                    weighted_vectors.append(vec * w)
                    weights.append(abs(w))

            # Build profile: weighted average
            n_interactions = len(reg_events)
            user_interaction_counts[uid] = n_interactions

            if weighted_vectors:
                profile = np.sum(weighted_vectors, axis=0)
                total_weight = sum(weights)
                if total_weight > 0:
                    profile = profile / total_weight
                user_profiles[uid] = profile
            else:
                # Cold-start: zero vector
                user_profiles[uid] = np.zeros(self.n_features)

        return user_profiles, user_id_to_idx, idx_to_user_id, user_interaction_counts

    def build_single_profile(self, user_id, reg_events, att_events, feedback_dict):
        """Build profile for one user (for real-time updates)."""
        weighted_vectors = []
        weights = []

        for eid in reg_events:
            idx = self.event_id_to_idx.get(eid)
            if idx is not None:
                vec = self._to_dense(self.event_features[idx])
                weighted_vectors.append(vec * INTERACTION_WEIGHTS["registration"])
                weights.append(INTERACTION_WEIGHTS["registration"])

        for eid in att_events:
            idx = self.event_id_to_idx.get(eid)
            if idx is not None:
                vec = self._to_dense(self.event_features[idx])
                weighted_vectors.append(vec * INTERACTION_WEIGHTS["attendance"])
                weights.append(INTERACTION_WEIGHTS["attendance"])

        for eid, rating in feedback_dict.items():
            idx = self.event_id_to_idx.get(eid)
            if idx is not None:
                vec = self._to_dense(self.event_features[idx])
                w = INTERACTION_WEIGHTS["rating_pos"] if rating >= 4 else (
                    INTERACTION_WEIGHTS["rating_neg"] if rating <= 2 else
                    INTERACTION_WEIGHTS["rating_mid"]
                )
                weighted_vectors.append(vec * w)
                weights.append(abs(w))

        if weighted_vectors:
            profile = np.sum(weighted_vectors, axis=0) / sum(weights)
        else:
            profile = np.zeros(self.n_features)

        return profile

    def _to_dense(self, row):
        """Convert a sparse matrix row to dense numpy array."""
        if sp.issparse(row):
            return np.asarray(row.todense()).flatten()
        return np.asarray(row).flatten()


def build_interaction_matrix(users_df, events_df, registrations_df,
                              attendance_df, feedback_df):

    user_ids = [str(uid) for uid in users_df["id"]]
    event_ids = [str(eid) for eid in events_df["id"]]
    user_id_to_idx = {uid: i for i, uid in enumerate(user_ids)}
    event_id_to_idx = {eid: i for i, eid in enumerate(event_ids)}

    n_users = len(user_ids)
    n_events = len(event_ids)
    matrix = np.zeros((n_users, n_events))

    # Registrations: base score = 1.0
    for _, row in registrations_df.iterrows():
        ui = user_id_to_idx.get(str(row["user_id"]))
        ei = event_id_to_idx.get(str(row["event_id"]))
        if ui is not None and ei is not None:
            matrix[ui][ei] += 1.0

    # Attendance: bonus +2.0
    for _, row in attendance_df.iterrows():
        ui = user_id_to_idx.get(str(row["user_id"]))
        ei = event_id_to_idx.get(str(row["event_id"]))
        if ui is not None and ei is not None:
            matrix[ui][ei] += 2.0

    # Feedback: rating offset from neutral (3)
    for _, row in feedback_df.iterrows():
        ui = user_id_to_idx.get(str(row["user_id"]))
        ei = event_id_to_idx.get(str(row["event_id"]))
        if ui is not None and ei is not None:
            matrix[ui][ei] += (row["rating"] - 3.0)

    return matrix, user_id_to_idx, event_id_to_idx
