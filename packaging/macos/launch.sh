#!/bin/bash
# Practice Stems — macOS app launcher (Apple Silicon).
set -euo pipefail

CONTENTS="$(cd "$(dirname "$0")/.." && pwd)"
RES="$CONTENTS/Resources"
APP="$RES/app"
SUPPORT="${HOME}/Library/Application Support/Practice Stems"
CACHE="${HOME}/Library/Caches/Practice Stems"
LOG="${HOME}/Library/Logs/Practice Stems.log"
ENV="$SUPPORT/env"
STAMP="$SUPPORT/env.stamp"
ENV_VERSION="1.0"
TAR="$RES/env.tar.gz"

notify() {
  osascript -e "display notification \"$1\" with title \"Practice Stems\"" >/dev/null 2>&1 || true
}

fail() {
  osascript -e "display dialog \"$1\" buttons {\"OK\"} default button \"OK\" with title \"Practice Stems\" with icon stop" >/dev/null
  exit 1
}

if [ "$(uname -m)" != "arm64" ]; then
  fail "Practice Stems requires an Apple Silicon Mac (M1, M2, M3, or M4)."
fi

if [ ! -f "$TAR" ]; then
  fail "This app is incomplete (missing env.tar.gz). Rebuild with scripts/build_macos_app.sh."
fi

mkdir -p "$SUPPORT" "$CACHE/torch/hub/checkpoints" "$(dirname "$LOG")"

if [ ! -x "$ENV/bin/python" ] || [ "$(cat "$STAMP" 2>/dev/null || true)" != "$ENV_VERSION" ]; then
  notify "First launch: unpacking the runtime. This takes a few minutes."
  rm -rf "$ENV"
  mkdir -p "$ENV"
  tar -xzf "$TAR" -C "$ENV"
  # conda-unpack is a bash script with a conda shebang — call via env python if needed.
  if [ -f "$ENV/bin/conda-unpack" ]; then
    "$ENV/bin/python" "$ENV/bin/conda-unpack" >>"$LOG" 2>&1 || fail "Failed to relocate the Python runtime. See ~/Library/Logs/Practice Stems.log"
  fi
  echo "$ENV_VERSION" >"$STAMP"
  notify "Ready. Opening the mixer in your browser."
fi

# Seed bundled Demucs weights so the first stem split does not download ~50 MB.
SEED="$RES/torch-cache/hub/checkpoints"
if [ -d "$SEED" ]; then
  for f in "$SEED"/*; do
    [ -f "$f" ] || continue
    dest="$CACHE/torch/hub/checkpoints/$(basename "$f")"
    [ -f "$dest" ] || cp "$f" "$dest"
  done
fi

export PATH="$RES/vendor/bin:$ENV/bin:/usr/bin:/bin"
export PYTHONNOUSERSITE=1
unset PYTHONHOME PYTHONPATH
export PYTHONPATH="$APP"
export PYTHONDONTWRITEBYTECODE=1
export PRACTICE_STEMS_DATA="$SUPPORT"
export PRACTICE_STEMS_OPEN_BROWSER=1
export TORCH_HOME="$CACHE/torch"
export HOST="${HOST:-127.0.0.1}"
export PORT="${PORT:-7860}"

cd "$APP"
exec "$ENV/bin/python" "$APP/app.py" >>"$LOG" 2>&1
