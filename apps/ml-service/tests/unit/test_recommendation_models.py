import pytest
import numpy as np
from app.models.hybrid import HybridRecommender
from app.models.content_based import ContentBasedModel
from app.models.collaborative import CollaborativeModel
from scipy.sparse import csr_matrix

@pytest.fixture
def mock_event_features():
    # 5 events, 3 features
    return csr_matrix([
        [1.0, 0.0, 0.0],
        [1.0, 1.0, 0.0],
        [0.0, 1.0, 1.0],
        [0.0, 0.0, 1.0],
        [1.0, 1.0, 1.0]
    ])

@pytest.fixture
def mock_interaction_matrix():
    # 4 users, 5 events
    # Users interact with some events
    return csr_matrix([
        [1, 1, 0, 0, 0],
        [0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0],
        [1, 0, 0, 1, 1]
    ])

def test_content_based_model(mock_event_features):
    model = ContentBasedModel()
    model.fit(mock_event_features)
    
    assert model.is_fitted is True
    
    # Test similar events
    similar = model.predict_similar(0, n=2)
    assert len(similar) == 2
    # Event 0 is [1, 0, 0], most similar should be event 1 [1, 1, 0] or event 4 [1, 1, 1]
    # In pure cosine similarity, event 1 will have score 1/sqrt(2) = 0.707
    # Event 4 will have score 1/sqrt(3) = 0.577
    assert similar[0][0] == 1
    
    # Test user profile prediction
    user_profile = np.array([1.0, 0.5, 0.0]) # User likes features 0 and 1
    recs = model.predict_for_user(user_profile, n=3)
    assert len(recs) == 3

def test_collaborative_model(mock_interaction_matrix):
    model = CollaborativeModel(n_factors=2)
    model.fit(mock_interaction_matrix)
    
    assert model.is_fitted is True
    assert hasattr(model, 'model')
    
    recs = model.predict(user_idx=0, n=3)
    assert len(recs) == 3
    # Check that predictions return (event_idx, score)
    assert isinstance(recs[0], tuple)
    assert len(recs[0]) == 2

def test_hybrid_recommender(mock_event_features, mock_interaction_matrix):
    hybrid = HybridRecommender(content_weight=0.5, collab_weight=0.5)
    hybrid.fit(mock_event_features, mock_interaction_matrix, n_factors=2)
    
    assert hybrid.is_fitted is True
    assert hybrid.content_model.is_fitted is True
    assert hybrid.collab_model.is_fitted is True
    
    # Test cold start user (n_interactions < 3)
    user_profile = np.array([0.0, 1.0, 0.0])
    cold_recs = hybrid.predict(user_profile, user_idx=10, n_interactions=2, n=3)
    assert len(cold_recs) == 3
    # Should only use content-based scores
    
    # Test established user (n_interactions >= 3)
    warm_recs = hybrid.predict(user_profile, user_idx=0, n_interactions=5, n=3)
    assert len(warm_recs) == 3
    
    # Test predict similar
    similar = hybrid.predict_similar(event_idx=0, n=2)
    assert len(similar) == 2
