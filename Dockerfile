# CPU image for Mac (Colima / Docker Desktop). No CUDA.
FROM python:3.11-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    HOST=0.0.0.0 \
    PORT=7860

RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    git \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# CPU-only PyTorch (avoids NVIDIA CUDA wheels)
RUN pip install --upgrade pip \
    && pip install torch torchaudio --index-url https://download.pytorch.org/whl/cpu

COPY requirements-docker.txt .
RUN pip install -r requirements-docker.txt

COPY app.py .
COPY pipeline ./pipeline
COPY static ./static

RUN mkdir -p /app/data/play /app/data/_incoming /app/data/_uploads

EXPOSE 7860

CMD ["python", "app.py"]
