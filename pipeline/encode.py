"""Encode stems for browser playback."""

from __future__ import annotations

import subprocess
from pathlib import Path


def wav_to_mp3(wav_path: Path, mp3_path: Path | None = None, bitrate: str = "192k") -> Path:
    mp3_path = mp3_path or wav_path.with_suffix(".mp3")
    mp3_path.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        "ffmpeg",
        "-y",
        "-i",
        str(wav_path),
        "-codec:a",
        "libmp3lame",
        "-b:a",
        bitrate,
        str(mp3_path),
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    return mp3_path


def encode_stems_mp3(stem_wavs: dict[str, Path], out_dir: Path | None = None) -> dict[str, Path]:
    """Convert wav stems to mp3 for the web mixer. Returns name -> mp3 path."""
    out: dict[str, Path] = {}
    for name, wav in stem_wavs.items():
        dest_dir = out_dir or wav.parent
        mp3 = dest_dir / f"{name}.mp3"
        if mp3.exists() and mp3.stat().st_mtime >= wav.stat().st_mtime:
            out[name] = mp3
            continue
        out[name] = wav_to_mp3(wav, mp3)
    return out
