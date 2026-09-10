"""Save practice takes (mic mixed with stems in the browser) as MP3."""

from __future__ import annotations

import re
import subprocess
from datetime import datetime, timezone
from pathlib import Path

from .jobs import PLAY

TAKE_BITRATE = "192k"

_SAFE_TAKE = re.compile(r"^take_\d{8}_\d{6}\.mp3$")


def recordings_dir(job_id: str) -> Path:
    path = PLAY / job_id / "recordings"
    path.mkdir(parents=True, exist_ok=True)
    return path


def _take_name() -> str:
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    return f"take_{stamp}.mp3"


def save_recording(job_id: str, data: bytes, orig_name: str = "") -> dict:
    if not data:
        raise ValueError("empty recording")
    rec_dir = recordings_dir(job_id)
    name = _take_name()
    dest = rec_dir / name
    suffix = Path(orig_name or "take.webm").suffix.lower()
    if suffix not in {".webm", ".ogg", ".mp4", ".m4a", ".wav", ".mp3", ".aac"}:
        suffix = ".webm"
    raw = rec_dir / f".tmp_{dest.stem}{suffix}"
    try:
        raw.write_bytes(data)
        cmd = [
            "ffmpeg",
            "-y",
            "-i",
            str(raw),
            "-vn",
            "-codec:a",
            "libmp3lame",
            "-b:a",
            TAKE_BITRATE,
            str(dest),
        ]
        subprocess.run(cmd, check=True, capture_output=True)
    except subprocess.CalledProcessError as exc:
        err = (exc.stderr or b"").decode("utf-8", errors="replace")[-400:]
        raise RuntimeError(err or "ffmpeg could not encode the take") from exc
    finally:
        if raw.is_file():
            raw.unlink()
    if not dest.is_file():
        raise RuntimeError("recording was not written")
    return recording_info(job_id, dest)


def recording_info(job_id: str, path: Path) -> dict:
    stat = path.stat()
    return {
        "name": path.name,
        "url": f"/api/jobs/{job_id}/recordings/{path.name}",
        "size": stat.st_size,
        "created": int(stat.st_mtime),
    }


def list_recordings(job_id: str) -> list[dict]:
    rec_dir = PLAY / job_id / "recordings"
    if not rec_dir.is_dir():
        return []
    items = [
        recording_info(job_id, p)
        for p in rec_dir.iterdir()
        if p.is_file() and _SAFE_TAKE.fullmatch(p.name)
    ]
    items.sort(key=lambda x: x["created"], reverse=True)
    return items


def recording_path(job_id: str, name: str) -> Path:
    if not _SAFE_TAKE.fullmatch(name):
        raise ValueError("bad recording name")
    path = (PLAY / job_id / "recordings" / name).resolve()
    root = (PLAY / job_id / "recordings").resolve()
    if not str(path).startswith(str(root)) or not path.is_file():
        raise FileNotFoundError("recording not found")
    return path


def delete_recording(job_id: str, name: str) -> None:
    recording_path(job_id, name).unlink()
