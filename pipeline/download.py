"""Download audio from a YouTube (or yt-dlp supported) URL."""

from __future__ import annotations

import re
from pathlib import Path

import yt_dlp


def _safe_name(title: str) -> str:
    name = re.sub(r"[^\w\s\-]+", "", title, flags=re.UNICODE).strip()
    name = re.sub(r"\s+", "_", name)
    return name[:80] or "track"


def download_audio(url: str, out_dir: Path) -> tuple[Path, str]:
    """Download best audio and convert to wav. Returns (wav_path, title)."""
    out_dir.mkdir(parents=True, exist_ok=True)
    info: dict = {}

    def _hook(d: dict) -> None:
        nonlocal info
        if d.get("status") == "finished" and d.get("info_dict"):
            info = d["info_dict"]

    ydl_opts = {
        "format": "bestaudio/best",
        "outtmpl": str(out_dir / "%(id)s.%(ext)s"),
        "noplaylist": True,
        "quiet": True,
        "no_warnings": True,
        "progress_hooks": [_hook],
        "postprocessors": [
            {
                "key": "FFmpegExtractAudio",
                "preferredcodec": "wav",
                "preferredquality": "0",
            }
        ],
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        meta = ydl.extract_info(url, download=True)
        if meta is None:
            raise RuntimeError("yt-dlp returned no metadata")
        video_id = meta["id"]
        title = meta.get("title") or video_id

    wav = out_dir / f"{video_id}.wav"
    if not wav.exists():
        # yt-dlp may leave a different extension before postprocess edge cases
        matches = list(out_dir.glob(f"{video_id}.*"))
        audio = next((p for p in matches if p.suffix.lower() in {".wav", ".m4a", ".webm", ".opus", ".mp3"}), None)
        if audio is None:
            raise FileNotFoundError(f"Downloaded audio not found for {video_id}")
        if audio.suffix.lower() != ".wav":
            raise RuntimeError(f"Expected wav after extract, got {audio}")
        wav = audio

    # Copy/rename into a friendly folder name for the job
    job_dir = out_dir / _safe_name(title)
    job_dir.mkdir(parents=True, exist_ok=True)
    dest = job_dir / "source.wav"
    if dest.exists():
        dest.unlink()
    wav.replace(dest)
    return dest, title
