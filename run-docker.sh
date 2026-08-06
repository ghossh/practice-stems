#!/usr/bin/env bash
# Build and run Practice Stems on http://127.0.0.1:7860
# Requires: Docker Desktop OR (brew install colima && colima start --cpu 4 --memory 8)
set -euo pipefail
cd "$(dirname "$0")"

IMAGE=practice-stems
NAME=practice-stems

ensure_colima_ram() {
  command -v colima >/dev/null 2>&1 || return 0
  colima status >/dev/null 2>&1 || return 0
  mem="$(colima list 2>/dev/null | awk '/default/ {print $5}')"
  case "$mem" in
    2GiB|2GB|3GiB|3GB|4GiB|4GB)
      echo "⚠ Colima RAM is ${mem}. Demucs needs ~8GiB or the container dies (OOM)."
      read -r -p "Restart Colima with 4 CPUs / 8GiB now? [Y/n]: " ans
      ans=${ans:-Y}
      case "$ans" in
        [nN]|[nN][oO]) echo "Continuing anyway (may crash on separate)." ;;
        *)
          echo "→ Restarting Colima (cpu=4, memory=8)…"
          colima stop
          colima start --cpu 4 --memory 8
          ;;
      esac
      ;;
  esac
}

ensure_colima_ram

if docker image inspect "$IMAGE" >/dev/null 2>&1; then
  echo "Image '$IMAGE' already exists."
  read -r -p "Use existing image? [Y/n] (n = rebuild fresh): " ans
  ans=${ans:-Y}
  case "$ans" in
    [nN]|[nN][oO])
      echo "→ Building fresh image…"
      docker build --no-cache -t "$IMAGE" .
      ;;
    *)
      echo "→ Using existing image (app code is bind-mounted from this folder)."
      ;;
  esac
else
  echo "→ No existing image. Building…"
  docker build -t "$IMAGE" .
fi

docker rm -f "$NAME" 2>/dev/null || true

mkdir -p data "$(pwd)/.cache/torch"

echo "→ Starting on http://127.0.0.1:7860  (Ctrl+C to stop)"
# Bind-mount app code so fixes apply without rebuild.
# Persist torch model weights across runs.
docker run --name "$NAME" --rm \
  -p 7860:7860 \
  -w /app \
  -e PYTHONPATH=/app \
  -v "$(pwd)/data:/app/data" \
  -v "$(pwd)/app.py:/app/app.py:ro" \
  -v "$(pwd)/pipeline:/app/pipeline:ro" \
  -v "$(pwd)/static:/app/static:ro" \
  -v "$(pwd)/.cache/torch:/root/.cache/torch" \
  -e HOST=0.0.0.0 \
  -e PORT=7860 \
  "$IMAGE"
