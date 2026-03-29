import numpy as np
import pandas as pd
import scipy.sparse as sp
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import OneHotEncoder, MinMaxScaler


class EventFeatureBuilder:


    def __init__(self, max_tfidf_features=100):
        self.tfidf = TfidfVectorizer(
            max_features=max_tfidf_features,
            stop_words="english",
            ngram_range=(1, 2),
        )
        self.ohe = OneHotEncoder(sparse_output=True, handle_unknown="ignore")
        self.scaler = MinMaxScaler()
        self.is_fitted = False

    def fit_transform(self, events_df, registrations_df, feedback_df, categories_df):

        events = events_df.copy()
        self.event_id_to_idx = {eid: i for i, eid in enumerate(events["id"])}
        self.idx_to_event_id = {i: eid for eid, i in self.event_id_to_idx.items()}

        # 1. TF-IDF on cleaned descriptions
        desc_col = "description_clean" if "description_clean" in events.columns else "description"
        descriptions = events[desc_col].fillna("")
        tfidf_matrix = self.tfidf.fit_transform(descriptions)

        # 2. One-hot encode categories
        cat_ids = events[["category_id"]].copy()
        cat_matrix = self.ohe.fit_transform(cat_ids)

        # 3. Numeric features: popularity + avg rating
        popularity = registrations_df.groupby("event_id").size().reindex(
            events["id"], fill_value=0
        ).values.reshape(-1, 1)

        avg_rating = feedback_df.groupby("event_id")["rating"].mean().reindex(
            events["id"], fill_value=3.0
        ).values.reshape(-1, 1)

        numeric = np.hstack([popularity, avg_rating])
        numeric_scaled = self.scaler.fit_transform(numeric)

        # 4. Combine all features
        self.feature_matrix = sp.hstack([
            cat_matrix,
            tfidf_matrix,
            sp.csr_matrix(numeric_scaled),
        ]).tocsr()

        self.is_fitted = True
        self.n_features = self.feature_matrix.shape[1]

        return self.feature_matrix, self.event_id_to_idx, self.idx_to_event_id

    def get_feature_names(self):
        """Return human-readable feature names for debugging."""
        cat_names = [f"cat_{c}" for c in self.ohe.categories_[0]]
        tfidf_names = [f"tfidf_{w}" for w in self.tfidf.get_feature_names_out()]
        numeric_names = ["popularity", "avg_rating"]
        return cat_names + tfidf_names + numeric_names

    def transform_single_event(self, event_row, n_registrations=0, avg_rating=3.0):
        """Transform a single new event (for real-time inference)."""
        desc_col = "description_clean" if "description_clean" in event_row else "description"
        desc = event_row.get(desc_col, "")
        tfidf_vec = self.tfidf.transform([desc])
        cat_vec = self.ohe.transform([[event_row["category_id"]]])
        numeric = self.scaler.transform([[n_registrations, avg_rating]])
        return sp.hstack([cat_vec, tfidf_vec, sp.csr_matrix(numeric)])
