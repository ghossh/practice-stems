"""Save practice takes. Audio becomes MP3. Video is stored as MP4 or WebM."""

from __future__ import annotations

import re
import subprocess
from datetime import datetime, timezone
from pathlib import Path

from .jobs import PLAY

TAKE_BITRATE = "192k"

_SAFE_TAKE = re.compile(r"^take_\d{8}_\d{6}\.(mp3|mp4|webm)$")
_VIDEO_TYPE = {".mp4": "video/mp4", ".webm": "video/webm"}


def recordings_dir(job_id: str) -> Path:
    path = PLAY / job_id / "recordings"
    path.mkdir(parents=True, exist_ok=True)
    return path


def _take_name(ext: str = ".mp3") -> str:
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    return f"take_{stamp}{ext}"


def media_type_for(path: Path) -> str:
    return _VIDEO_TYPE.get(path.suffix.lower(), "audio/mpeg")


def _is_video_upload(orig_name: str) -> bool:
    return Path(orig_name or "").stem.lower() == "video"


def save_recording(job_id: str, data: bytes, orig_name: str = "") -> dict:
    if not data:
        raise ValueError("empty recording")
    rec_dir = recordings_dir(job_id)
    suffix = Path(orig_name or "take.webm").suffix.lower()
    if _is_video_upload(orig_name):
        if suffix not in {".mp4", ".webm"}:
            suffix = ".webm"
        dest = rec_dir / _take_name(suffix)
        dest.write_bytes(data)
        return recording_info(job_id, dest)

    if suffix not in {".webm", ".ogg", ".mp4", ".m4a", ".wav", ".mp3", ".aac"}:
        suffix = ".webm"
    dest = rec_dir / _take_name(".mp3")
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
