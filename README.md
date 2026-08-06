# Practice Stems

Moises-style practice app for Mac/Linux: YouTube or local audio/video → Demucs 6-stem split → live mixer (volume / mute / solo).

Stems: **vocals, drums, bass, guitar, piano, other** (`htdemucs_6s`).

### Screenshots

Home — paste a YouTube URL or upload a file, then open songs from your library:

![Home screen](docs/home.png)

Stem mixer — Play / seek, role presets, and per-stem volume / mute / solo:

![Stem mixer](docs/player-stems.png)

Presets cycling (Guitarist, Drummer, Singer, …):

![Stem mixer presets](docs/player-stems.gif)

---

## Option A — Local (recommended on Mac: Apple GPU)

Faster than Docker on Apple Silicon.

```bash
cd practice_stems
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Open http://127.0.0.1:7860

Needs: `ffmpeg` (Homebrew: `brew install ffmpeg`), network for YouTube + first model download.

---

## Option B — Docker (required / portable)

### 1. Start a Docker engine

**Colima (common on Mac without Docker Desktop):**

```bash
brew install colima docker
colima start --cpu 4 --memory 8
```

Use **at least 8 GiB RAM**. With 2 GiB the container will die during separation (OOM).

Check:

```bash
colima list
```

**Or** start Docker Desktop and wait until it’s running.

### 2. Run the app

```bash
cd practice_stems
./run-docker.sh
```

- If an image already exists, choose **Y** to reuse it (app code is bind-mounted from this folder).
- Choose **n** to rebuild the image from scratch.
- If Colima RAM is too low, the script can restart Colima with 4 CPUs / 8 GiB.

Open http://127.0.0.1:7860 — stop with `Ctrl+C`.

Equivalent manual commands:

```bash
docker build -t practice-stems .
docker run --rm -p 7860:7860 \
  -w /app -e PYTHONPATH=/app -e HOST=0.0.0.0 \
  -v "$(pwd)/data:/app/data" \
  -v "$(pwd)/app.py:/app/app.py:ro" \
  -v "$(pwd)/pipeline:/app/pipeline:ro" \
  -v "$(pwd)/static:/app/static:ro" \
  -v "$(pwd)/.cache/torch:/root/.cache/torch" \
  practice-stems
```

### Docker notes

| Topic | Detail |
|--------|--------|
| Songs data | `./data` on your machine → `/app/data` in the container |
| Model cache | `./.cache/torch` (avoids re-downloading Demucs weights) |
| GPU | Docker on Mac = **CPU only**. Linux + NVIDIA can use CUDA later |
| First separate | Slow: downloads model (~50 MB) then processes the whole track |
| Full songs | Leave the terminal open until progress finishes |

---

## How to use the app

1. Paste a **YouTube URL**, or upload **audio / video** (mp4, mov, mkv, … — audio is extracted with ffmpeg).
2. Click **Separate & open player** (or **Open last song** / pick from **Your songs**).
3. In the player: **Play**, drag volume faders, **Mute** / **Solo**, role presets (Guitarist, Drummer, Singer, …).
4. **Stop loading** cancels an in-progress job (after the current step).
5. **Delete** removes a song from the library.

---

## Data layout

```
practice_stems/data/
  play/          # library + MP3s for the mixer
  _incoming/     # downloads + Demucs WAV stems
  _uploads/      # temporary uploads
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `docker.sock: no such file` | Start Colima (`colima start`) or Docker Desktop |
| `docker compose` unknown | Use `./run-docker.sh` (this install has no Compose plugin) |
| Container dies mid-separate | Raise Colima RAM: `colima stop && colima start --cpu 4 --memory 8` |
| TorchCodec errors | Fixed in current code (uses soundfile + ffmpeg). Restart container / remount |
| Shape / reshape errors | Fixed (no custom Demucs `segment`). Restart `./run-docker.sh` so mounts pick up latest `pipeline/` |
| Port 7860 in use | Stop the other app (`Ctrl+C`) or change host port: `-p 7861:7860` |

---

## Requirements files

- `requirements.txt` — local Mac/Linux (includes current torch)
- `requirements-docker.txt` — Docker image deps (CPU torch installed separately in the Dockerfile)
