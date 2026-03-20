from fastapi import FastAPI

app = FastAPI(
    title="CEMS Recommendation Engine",
    description="AI-powered event recommendation service for AASTU CEMS",
    version="0.1.0",
)


@app.get("/health")
def health():

    return {
        "status": "healthy",
        "service": "ml-recommendation",
        "version": "0.1.0",
    }
