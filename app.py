"""Moises-inspired Mac practice app — FastAPI only."""

from __future__ import annotations

import json
import re
import shutil
import subprocess
import threading
import traceback
import uuid
from pathlib import Path

import uvicorn
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles

from pipeline.device import device_label, pick_device
from pipeline.download import download_audio
from pipeline.jobs import (
    DATA,
    INCOMING,
    PLAY,
    delete_job,
    ensure_latest_job,
    list_jobs,
    list_playable_stems,
    read_job_meta,
    safe_id,
    stage_playable,
    touch_played,
)
from pipeline.separate import STEM_ORDER, separate_stems

ROOT = Path(__file__).resolve().parent
STATIC = ROOT / "static"
HOST = __import__("os").environ.get("HOST", "127.0.0.1")
PORT = int(__import__("os").environ.get("PORT", "7860"))

_jobs_lock = threading.Lock()
_jobs: dict[str, dict] = {}

AUDIO_EXTS = {".wav", ".mp3", ".m4a", ".flac", ".ogg", ".aac", ".webm", ".opus"}
VIDEO_EXTS = {".mp4", ".mov", ".mkv", ".avi", ".webm", ".m4v", ".mpeg", ".mpg", ".wmv"}
MEDIA_EXTS = AUDIO_EXTS | VIDEO_EXTS


def _set_job(task_id: str, **kwargs) -> None:
    with _jobs_lock:
        cur = _jobs.get(task_id, {})
        cur.update(kwargs)
        _jobs[task_id] = cur


def _get_job(task_id: str) -> dict | None:
    with _jobs_lock:
        return dict(_jobs[task_id]) if task_id in _jobs else None


def _to_wav(src: Path, dest: Path) -> Path:
    """Convert audio or video to wav (extracts audio from video)."""
    if src.suffix.lower() == ".wav":
        if src.resolve() != dest.resolve():
            shutil.copy2(src, dest)
        return dest
    dest.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(src),
            "-vn",
            "-acodec",
            "pcm_s16le",
            "-ar",
            "44100",
            "-ac",
            "2",
            str(dest),
        ],
        check=True,
        capture_output=True,
    )
    if not dest.is_file():
        raise RuntimeError(f"ffmpeg failed to extract audio from {src.name}")
    return dest


def _is_cancelled(task_id: str) -> bool:
    job = _get_job(task_id)
    return bool(job and job.get("cancel"))


def _check_cancel(task_id: str) -> None:
    if _is_cancelled(task_id):
        raise RuntimeError("Cancelled")


def _run_separate(task_id: str, source_wav: Path, title: str, device_choice: str) -> None:
    try:
        _check_cancel(task_id)
        device = pick_device("cpu" if device_choice == "cpu" else "auto")
        _set_job(task_id, status="running", progress=0.1, message=f"Using {device_label(device)}")

        job_dir = INCOMING / safe_id(title)
        job_dir.mkdir(parents=True, exist_ok=True)
        dest_wav = job_dir / "source.wav"
        if source_wav.resolve() != dest_wav.resolve():
            shutil.copy2(source_wav, dest_wav)

        _check_cancel(task_id)
        stems_dir = job_dir / "stems"
        if stems_dir.exists():
            shutil.rmtree(stems_dir)
        stems_dir.mkdir(parents=True, exist_ok=True)

        _set_job(task_id, progress=0.35, message=f"Separating stems on {device_label(device)}…")
        stem_wavs = separate_stems(dest_wav, stems_dir, device=device)

        _check_cancel(task_id)
        _set_job(task_id, progress=0.85, message="Encoding MP3s for player…")
        job_id = stage_playable(title, stem_wavs, stems_dir=stems_dir)

        _check_cancel(task_id)
        _set_job(
            task_id,
            status="done",
            progress=1.0,
            message="Ready",
            job_id=job_id,
            title=title,
            player_url=f"/player/{job_id}",
        )
    except Exception as exc:
        if str(exc) == "Cancelled" or _is_cancelled(task_id):
            _set_job(task_id, status="cancelled", progress=0, message="Cancelled")
        else:
            _set_job(task_id, status="error", message=str(exc), detail=traceback.format_exc())


def create_app() -> FastAPI:
    app = FastAPI(title="Practice Stems")

    @app.get("/", response_class=HTMLResponse)
    async def home():
        return HTMLResponse((STATIC / "index.html").read_text(encoding="utf-8"))

    @app.get("/player/{job_id}", response_class=HTMLResponse)
    async def player(job_id: str):
        if not re.fullmatch(r"[A-Za-z0-9_\-]+", job_id):
            raise HTTPException(400, "bad job id")
        if not (PLAY / job_id).is_dir():
            raise HTTPException(404, "job not found")
        stems = list_playable_stems(job_id)
        if len(stems) < 4:
            raise HTTPException(404, "stems not ready")
        touch_played(job_id)
        meta = read_job_meta(job_id) or {"job_id": job_id, "title": job_id.replace("_", " ")}
        boot = {
            "job_id": job_id,
            "title": meta.get("title") or job_id,
            "stems": stems,
            "stem_order": STEM_ORDER,
        }
        html = (STATIC / "player.html").read_text(encoding="utf-8")
        boot_json = json.dumps(boot).replace("<", "\\u003c")
        return HTMLResponse(html.replace("__BOOT_JSON__", boot_json))

    @app.get("/media/{job_id}/{filename}")
    async def media(job_id: str, filename: str):
        if not re.fullmatch(r"[A-Za-z0-9_\-]+", job_id):
            raise HTTPException(400, "bad job id")
        if not re.fullmatch(r"[a-z]+\.mp3", filename):
            raise HTTPException(400, "bad filename")
        path = (PLAY / job_id / filename).resolve()
        if not str(path).startswith(str(PLAY.resolve())) or not path.is_file():
            raise HTTPException(404, "missing file")
        return FileResponse(
            path,
            media_type="audio/mpeg",
            headers={"Content-Disposition": f'inline; filename="{filename}"'},
        )

    @app.get("/api/device")
    async def api_device():
        try:
            dev = pick_device("auto")
            return {"device": dev, "label": device_label(dev)}
        except Exception:
            return {"device": "cpu", "label": "CPU"}

    @app.get("/api/jobs")
    async def api_list_jobs():
        return {"jobs": list_jobs()}

    @app.get("/api/jobs/latest")
    async def api_latest():
        meta = ensure_latest_job()
        if not meta:
            raise HTTPException(404, "No separated songs yet")
        return meta

    @app.get("/api/tasks/{task_id}")
    async def api_task_status(task_id: str):
        job = _get_job(task_id)
        if not job:
            raise HTTPException(404, "unknown task")
        return job

    @app.post("/api/tasks/{task_id}/cancel")
    async def api_task_cancel(task_id: str):
        job = _get_job(task_id)
        if not job:
            raise HTTPException(404, "unknown task")
        if job.get("status") in {"done", "error", "cancelled"}:
            return {"ok": True, "status": job.get("status")}
        _set_job(task_id, cancel=True, message="Cancelling…")
        return {"ok": True, "status": "cancelling"}

    @app.delete("/api/library/{job_id}")
    async def api_delete_library(job_id: str):
        if not re.fullmatch(r"[A-Za-z0-9_\-]+", job_id):
            raise HTTPException(400, "bad job id")
        if not delete_job(job_id):
            raise HTTPException(404, "song not found")
        return {"ok": True}

    # Compat: older home.js polled /api/jobs/{task_id}
    @app.get("/api/jobs/{task_id}")
    async def api_job_or_task(task_id: str):
        job = _get_job(task_id)
        if job:
            return job
        raise HTTPException(404, "unknown task")

    @app.post("/api/separate")
    async def api_separate(
        url: str | None = Form(None),
        device: str = Form("auto"),
        file: UploadFile | None = File(None),
    ):
        task_id = uuid.uuid4().hex[:12]
        device_choice = "cpu" if device == "cpu" else "auto"
        _set_job(task_id, status="queued", progress=0.0, message="Starting…")

        url = (url or "").strip() or None
        has_file = file is not None and bool(file.filename)

        if not url and not has_file:
            raise HTTPException(400, "Provide a YouTube URL or an audio/video file")

        # Persist upload before returning (UploadFile closes after response)
        upload_path: Path | None = None
        upload_title = ""
        if has_file and not url:
            assert file is not None and file.filename
            suffix = Path(file.filename).suffix.lower() or ".wav"
            if suffix not in MEDIA_EXTS:
                raise HTTPException(
                    400,
                    f"Unsupported file type {suffix}. Use audio or video (mp4, mov, mkv, …).",
                )
            upload_title = Path(file.filename).stem
            tmp_dir = DATA / "_uploads" / task_id
            tmp_dir.mkdir(parents=True, exist_ok=True)
            upload_path = tmp_dir / f"upload{suffix}"
            with upload_path.open("wb") as out:
                shutil.copyfileobj(file.file, out)

        def worker() -> None:
            try:
                if url:
                    _check_cancel(task_id)
                    _set_job(task_id, status="running", progress=0.05, message="Downloading audio…")
                    wav_path, title = download_audio(url, INCOMING)
                    _check_cancel(task_id)
                    _run_separate(task_id, wav_path, title, device_choice)
                    return
                assert upload_path is not None
                is_video = upload_path.suffix.lower() in VIDEO_EXTS
                _set_job(
                    task_id,
                    status="running",
                    progress=0.05,
                    message="Extracting audio from video…" if is_video else "Preparing audio…",
                )
                wav_path = _to_wav(upload_path, upload_path.parent / "source.wav")
                _check_cancel(task_id)
                _run_separate(task_id, wav_path, upload_title, device_choice)
            except Exception as exc:
                if str(exc) == "Cancelled" or _is_cancelled(task_id):
                    _set_job(task_id, status="cancelled", progress=0, message="Cancelled")
                else:
                    _set_job(task_id, status="error", message=str(exc), detail=traceback.format_exc())

        threading.Thread(target=worker, daemon=True).start()
        return {"task_id": task_id}

    app.mount("/static", StaticFiles(directory=str(STATIC)), name="static")
    return app


app = create_app()


def main() -> None:
    print(f"Practice Stems → http://{HOST}:{PORT}")
    uvicorn.run(app, host=HOST, port=PORT, log_level="info")


if __name__ == "__main__":
    main()
