FROM python:3.12-slim

WORKDIR /app

# Install dependencies and clean up in the SAME layer to avoid
# read-only filesystem errors when Docker tries to squash layers later
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt \
    && find /usr/local/lib/python3.12/site-packages -name "*.pyc" -delete \
    && find /usr/local/lib/python3.12/site-packages -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true \
    && pip cache purge

COPY . .

RUN python -c "import nltk; nltk.download('punkt_tab'); nltk.download('stopwords')" \
    && find /root/nltk_data -name "*.zip" -delete 2>/dev/null || true

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
