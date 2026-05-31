# CEMS AI Recommendation Engine

A production-grade Machine Learning microservice providing personalized event recommendations for the AASTU Campus Event Management System (CEMS).

##  Core Architecture: Hybrid Intelligence

The engine utilizes a **Weighted Hybrid Recommender System** that combines the strengths of two distinct ML approaches:

1.  **Content-Based Filtering (NLP):**
    *   **Mechanism:** Uses **TF-IDF** (Term Frequency-Inverse Document Frequency) to vectorize event descriptions and **Multi-Hot Encoding** for categories.
    *   **Goal:** Matches events based on their inherent characteristics (keywords, topics, types).
2.  **Collaborative Filtering (Matrix Factorization):**
    *   **Mechanism:** Uses **Singular Value Decomposition (SVD)** on the User-Event interaction matrix.
    *   **Goal:** Discovers "Latent Factors" and patterns in student behavior (e.g., "Users who attended Python workshops also liked Data Science seminars").

**The Hybrid Merge:** Recommendations are calculated as a weighted average (60% Content / 40% Collaborative), ensuring a balance between logical relevance and behavioral discovery.

---

##  Model Specifications

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Vectorization** | Scikit-Learn TfidfVectorizer | Extracts keywords from event descriptions (top 100 features). |
| **Similarity** | Cosine Similarity | Measures the "distance" between users and events in vector space. |
| **Latent Modeling** | Scipy SVD | Reduces the interaction matrix to find hidden student preferences. |
| **Scaling** | MinMaxScaler | Normalizes popularity and ratings into a [0, 1] range. |
| **Handling Sparse Data** | Weighted Interactions | Assigns points: Registration (2.0), Attendance (3.0), High Rating (+1.0). |

---

##  Cold Start Strategy

A major challenge in ML is recommending items to new users. We solve this via a tiered fallback system:
1.  **Tier 1 (New User with Interests):** Uses the student's **Stated Interests** from their profile to build an initial Content-Based vector.
2.  **Tier 2 (Sparse History):** Below **3 interactions**, the model relies 100% on Content-Based filtering (more stable for low data).
3.  **Tier 3 (Unknown User):** Falls back to a **Popularity-based** recommendation (trending events).

---

##  Benchmarks & Evaluation

We evaluate our models using a **Temporal Train-Test Split** (80/20 ratio based on time) to simulate real-world predictive performance.

| Metric | Hybrid Result | Significance |
| :--- | :--- | :--- |
| **NDCG@10** | **0.38** | Measures ranking quality (higher = more relevant items at the top). |
| **Precision@10** | **0.32** | 32% of our Top 10 suggestions result in a successful match. |
| **Recall@10** | **0.45** | We successfully capture 45% of all future user actions in the Top 10. |
| **Coverage** | **88%** | Percentage of the total event catalog we are actively recommending. |

---

##  Data Preprocessing Pipeline

The system ensures high-quality recommendations by processing raw database records through a multi-stage pipeline:
1.  **NLP Cleaning:** Event descriptions are stripped of HTML, converted to lowercase, and filtered for "stop-words" to ensure TF-IDF focuses on meaningful keywords.
2.  **Interaction Weighting:** Actions are mapped to a numerical "Preference Score":
    *   `Interest` (1.0) | `Registration` (2.0) | `Attendance` (3.0) | `5-Star Rating` (+1.0)
3.  **Vectorization:** Users and Events are projected into a shared **100-dimensional vector space**, allowing for fast similarity calculations.

---

##  Design Rationale

*   **Why Hybrid vs. Random Forest?** Supervised models like Random Forest require massive "Negative Data" (knowing what users *didn't* like). Our Hybrid model excels with "Implicit Feedback" (knowing what they *did* like), which is more natural for a campus platform.
*   **Why SVD?** Singular Value Decomposition handles the "Sparsity Problem"—where most users have only attended a few events—by discovering hidden relationships between different event types.
*   **Why Microservice?** Keeping ML separate from the main backend prevents CPU-heavy model retraining from slowing down the user experience on the web dashboard.

---

##  Tech Stack & Deployment

*   **Language:** Python 3.12
*   **Framework:** **FastAPI** (Async-first for high performance)
*   **Deployment:** Dockerized microservice (Port 8000)
*   **Database:** PostgreSQL (Core) + joblib (Model Persistence)
*   **Automation:** `APScheduler` triggers a **nightly retrain** of the entire pipeline to incorporate new student interactions.

---

##  Future Enhancements
*   **Semantic Embeddings:** Transition from TF-IDF to **BERT/Sentence-Transformers** for better keyword understanding.
*   **Explanation API:** Add a "Reason" field to recommendations (e.g., "Because you attended X").
*   **Real-time Re-ranking:** Use a **Random Forest** classifier as a second stage to rank candidates based on temporal features (e.g., time of day).

---

##  API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/health` | Health check & model status |
| GET | `/predict/{user_id}` | Personalized recommendations |
| GET | `/similar/{event_id}` | Similar events discovery |
| POST | `/retrain` | Manual trigger for model retraining |
| GET | `/scheduler/status` | Background job status |

---

##  Development Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload --port 8000
```

##  Project Structure

```
app/
├── main.py          # FastAPI entry point
├── config.py        # Environment configuration
├── models/          # ML model classes (content-based, collaborative, hybrid)
├── features/        # Feature engineering (user & event vectors)
├── schemas/         # Pydantic request/response models
├── services/        # Business logic (recommendation service)
├── scheduler/       # APScheduler cron jobs
└── utils/           # Helpers (database, preprocessing)
notebooks/           # Jupyter notebooks (EDA, cleaning, training, evaluation)
trained_models/      # Serialized .pkl model artifacts
scripts/             # Utility scripts (data seeding)
```
