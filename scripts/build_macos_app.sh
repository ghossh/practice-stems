#!/usr/bin/env bash
# Build a double-clickable Apple Silicon .app + .dmg from the current conda env.
# Usage: ./scripts/build_macos_app.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PACK="$ROOT/packaging/macos"
DIST="$ROOT/dist"
APP_NAME="Practice Stems"
APP="$DIST/$APP_NAME.app"
DMG="$DIST/PracticeStems-macos-arm64.dmg"
ENV_SRC="${PRACTICE_STEMS_ENV:-/opt/homebrew/anaconda3/envs/practice-stems}"
MODEL_CACHE="${HOME}/.cache/torch/hub/checkpoints"
MODEL_FILE="5c90dfd2-34c22ccb.th"  # htdemucs_6s

if [ "$(uname -m)" != "arm64" ]; then
  echo "Build this package on an Apple Silicon Mac." >&2
  exit 1
fi
if [ ! -x "$ENV_SRC/bin/python" ]; then
  echo "Conda env not found: $ENV_SRC" >&2
  echo "Create it first: conda env create -f environment.yml" >&2
  exit 1
fi

# Cursor (and some conda setups) point CONDA_PKGS_DIRS at a cache conda-pack cannot use.
unset CONDA_PKGS_DIRS

echo "→ Env: $ENV_SRC"
echo "→ Installing conda-pack…"
"$ENV_SRC/bin/python" -m pip install -q conda-pack

echo "→ Staging .app"
rm -rf "$APP" "$DIST/dmgroot" "$DIST/env.tar.gz" "$DIST/_pack_env"
mkdir -p "$APP/Contents/MacOS" "$APP/Contents/Resources/app" "$APP/Contents/Resources/torch-cache/hub/checkpoints"

cp "$PACK/Info.plist" "$APP/Contents/Info.plist"
cp "$PACK/launch.sh" "$APP/Contents/MacOS/PracticeStems"
chmod 755 "$APP/Contents/MacOS/PracticeStems"

cp "$ROOT/app.py" "$APP/Contents/Resources/app/app.py"
rsync -a --delete --exclude '__pycache__' --exclude '*.pyc' \
  "$ROOT/pipeline/" "$APP/Contents/Resources/app/pipeline/"
rsync -a --delete --exclude '__pycache__' --exclude '*.pyc' \
  "$ROOT/static/" "$APP/Contents/Resources/app/static/"

echo "→ Icon"
"$ENV_SRC/bin/python" "$PACK/make_icon.py" "$DIST/icon.png"
ICONSET="$DIST/AppIcon.iconset"
rm -rf "$ICONSET"
mkdir -p "$ICONSET"
for s in 16 32 64 128 256 512; do
  sips -z "$s" "$s" "$DIST/icon.png" --out "$ICONSET/icon_${s}x${s}.png" >/dev/null
  d=$((s * 2))
  sips -z "$d" "$d" "$DIST/icon.png" --out "$ICONSET/icon_${s}x${s}@2x.png" >/dev/null
done
iconutil -c icns "$ICONSET" -o "$APP/Contents/Resources/AppIcon.icns"
rm -rf "$ICONSET"

if [ -f "$MODEL_CACHE/$MODEL_FILE" ]; then
  echo "→ Bundling Demucs 6-stem model"
  cp "$MODEL_CACHE/$MODEL_FILE" "$APP/Contents/Resources/torch-cache/hub/checkpoints/$MODEL_FILE"
else
  echo "⚠ Model $MODEL_FILE not in ~/.cache/torch; first run on the other Mac will download it."
fi

echo "→ Staging conda env (clear broken package-cache paths)…"
mkdir -p "$DIST/_pack_env"
rsync -a --delete --exclude '__pycache__' --exclude '*.pyc' "$ENV_SRC/" "$DIST/_pack_env/"
"$ENV_SRC/bin/python" - <<PY
import json
from pathlib import Path
meta = Path(r"$DIST/_pack_env/conda-meta")
for path in meta.glob("*.json"):
    data = json.loads(path.read_text())
    link = data.get("link") or {}
    if link.get("source"):
        link["source"] = ""
        data["link"] = link
        path.write_text(json.dumps(data))
PY

echo "→ Packing conda env (this takes a few minutes)…"
"$ENV_SRC/bin/conda-pack" \
  -p "$DIST/_pack_env" \
  -o "$DIST/env.tar.gz" \
  --n-threads 4 \
  --ignore-missing-files \
  --ignore-editable-packages
rm -rf "$DIST/_pack_env"
mv "$DIST/env.tar.gz" "$APP/Contents/Resources/env.tar.gz"
chmod 644 "$APP/Contents/Resources/env.tar.gz"

RB="$(command -v rubberband || true)"
if [ -n "$RB" ]; then
  echo "→ Bundling rubberband from $RB"
  "$ENV_SRC/bin/python" "$PACK/bundle_dylibs.py" "$RB" "$APP/Contents/Resources/vendor"
else
  echo "⚠ rubberband not on PATH (brew install rubberband); HQ slowdown will use ffmpeg."
fi

echo "→ DMG"
mkdir -p "$DIST/dmgroot"
mv "$APP" "$DIST/dmgroot/$APP_NAME.app"
ln -s /Applications "$DIST/dmgroot/Applications"
cp "$PACK/How to install.txt" "$DIST/dmgroot/How to install.txt"
rm -f "$DMG"
hdiutil create \
  -volname "$APP_NAME" \
  -srcfolder "$DIST/dmgroot" \
  -ov -format UDZO \
  "$DMG" >/dev/null
# Leave the .app next to the dmg as well (handy to test locally).
rm -rf "$APP"
mv "$DIST/dmgroot/$APP_NAME.app" "$APP"
rm -rf "$DIST/dmgroot"

xattr -cr "$APP" "$DMG" 2>/dev/null || true

echo
echo "Built:"
echo "  $APP"
echo "  $DMG"
ls -lh "$DMG" "$APP"
echo
echo "Give the other Mac the .dmg. Apple Silicon only. First open: right-click → Open."
