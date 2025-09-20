FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY api/requirements.txt .

RUN pip install --no-cache-dir -r ./requirements.txt

COPY model_finetuning ./model_finetuning

COPY api/. .

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]