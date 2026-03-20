# CEMS AI Recommendation Engine

Python-based ML microservice providing personalized event recommendations for the AASTU Campus Event Management System.

## Architecture

- **Framework**: FastAPI (Python 3.12)
- **ML Stack**: scikit-learn, scipy, pandas, numpy, NLTK
- **Models**: Content-Based (TF-IDF + Cosine Similarity) + Collaborative (SVD) → Hybrid
- **Scheduler**: APScheduler for background cron jobs (nightly retrain, profile updates)
- **Served via**: Docker container on port 8000

## Development Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload --port 8000
```

## API Endpoints

| Method | Endpoint            | Description                      |
|--------|---------------------|----------------------------------|
| GET    | `/health`           | Health check                     |
| GET    | `/predict/{user_id}`| Personalized recommendations     |
| GET    | `/similar/{event_id}`| Similar events                  |
| POST   | `/retrain`          | Trigger model retrain            |
| GET    | `/scheduler/status` | Background job status            |

## Project Structure

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
