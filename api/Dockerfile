FROM python:3.10-slim
WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    ca-certificates \
    curl \
    openssl \
    && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /usr/local/share/ca-certificates/
COPY cisco.crt /usr/local/share/ca-certificates/
RUN update-ca-certificates

COPY requirements.txt .
RUN pip install --no-cache-dir -r ./requirements.txt

COPY . .

# RUN python download_models.py  # Uncomment after model upload

EXPOSE 8000
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
