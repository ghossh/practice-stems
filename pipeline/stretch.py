"""High-quality pitch-preserving time stretch (Rubber Band → ffmpeg atempo)."""

from __future__ import annotations

import re
import shutil
import subprocess
import tempfile
from pathlib import Path

from .jobs import PLAY, STEM_ORDER


def _has_rubberband() -> bool:
    return shutil.which("rubberband") is not None


def stretch_engine() -> str:
    return "rubberband" if _has_rubberband() else "atempo"


def speed_tag(speed: float) -> str:
    """Filesystem-safe tag, e.g. 0.75 → 0p75."""
    s = f"{float(speed):.4f}".rstrip("0").rstrip(".")
    return s.replace(".", "p")


def stretch_dir(job_id: str, speed: float) -> Path:
    return PLAY / job_id / "stretch" / speed_tag(speed)


def _ffmpeg_to_wav(src: Path, wav: Path) -> None:
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(src),
            "-acodec",
            "pcm_s16le",
            "-ar",
            "44100",
            "-ac",
            "2",
            str(wav),
        ],
        check=True,
        capture_output=True,
    )


def _ffmpeg_wav_to_mp3(wav: Path, mp3: Path, bitrate: str = "192k") -> None:
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(wav),
            "-codec:a",
            "libmp3lame",
            "-b:a",
            bitrate,
            str(mp3),
        ],
        check=True,
        capture_output=True,
    )


def _atempo_chain(rate: float) -> str:
    """atempo accepts 0.5–2.0; chain for wider range."""
    rate = max(0.25, min(2.0, float(rate)))
    parts: list[str] = []
    r = rate
    while r < 0.5 - 1e-9:
        parts.append("atempo=0.5")
        r /= 0.5
    while r > 2.0 + 1e-9:
        parts.append("atempo=2.0")
        r /= 2.0
    parts.append(f"atempo={r:.6g}")
    return ",".join(parts)


def stretch_file(src: Path, dest: Path, speed: float) -> str:
    """
    Write pitch-preserved time-stretched audio to dest (mp3).
    speed < 1 = slower. Returns engine name used.
    """
    speed = max(0.25, min(2.0, float(speed)))
    dest.parent.mkdir(parents=True, exist_ok=True)
    if abs(speed - 1.0) < 1e-6:
        if src.resolve() != dest.resolve():
            shutil.copy2(src, dest)
        return "copy"

    if _has_rubberband():
        # Rubber Band -t is duration multiplier (= 1/speed for slower playback)
        time_ratio = 1.0 / speed
        with tempfile.TemporaryDirectory(prefix="stretch_") as td:
            td_path = Path(td)
            in_wav = td_path / "in.wav"
            out_wav = td_path / "out.wav"
            _ffmpeg_to_wav(src, in_wav)
            # --fine = higher quality (slower). -c 5 = crispness good for music.
            proc = subprocess.run(
                [
                    "rubberband",
                    "-t",
                    f"{time_ratio:.8g}",
                    "--fine",
                    "-c",
                    "5",
                    str(in_wav),
                    str(out_wav),
                ],
                capture_output=True,
                text=True,
            )
            if proc.returncode != 0 or not out_wav.is_file():
                err = (proc.stderr or proc.stdout or "rubberband failed")[-500:]
                raise RuntimeError(err)
            _ffmpeg_wav_to_mp3(out_wav, dest)
        return "rubberband"

    # Fallback: ffmpeg atempo (OK quality, worse than Rubber Band at extreme slows)
    filt = _atempo_chain(speed)
    proc = subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(src),
            "-filter:a",
            filt,
            "-codec:a",
            "libmp3lame",
            "-b:a",
            "192k",
            str(dest),
        ],
        capture_output=True,
        text=True,
    )
    if proc.returncode != 0 or not dest.is_file():
        err = (proc.stderr or proc.stdout or "atempo failed")[-500:]
        raise RuntimeError(err)
    return "atempo"


def ensure_stretched_stems(job_id: str, speed: float) -> dict:
    """
    Ensure HQ time-stretched stem MP3s exist for this job/speed.
    Returns {engine, speed, stems: {name: url}}.
    """
    if not re.fullmatch(r"[A-Za-z0-9_\-]+", job_id):
        raise ValueError("bad job id")
    speed = max(0.25, min(2.0, float(speed)))
    play_dir = PLAY / job_id
    if not play_dir.is_dir():
        raise FileNotFoundError("job not found")

    if abs(speed - 1.0) < 1e-6:
        stems = {
            n: f"/media/{job_id}/{n}.mp3"
            for n in STEM_ORDER
            if (play_dir / f"{n}.mp3").is_file()
        }
        return {"engine": "none", "speed": 1.0, "hq": False, "stems": stems}

    out = stretch_dir(job_id, speed)
    out.mkdir(parents=True, exist_ok=True)
    engine = stretch_engine()
    stems: dict[str, str] = {}
    tag = speed_tag(speed)

    for name in STEM_ORDER:
        src = play_dir / f"{name}.mp3"
        if not src.is_file():
            continue
        dest = out / f"{name}.mp3"
        if not (dest.is_file() and dest.stat().st_mtime >= src.stat().st_mtime):
            stretch_file(src, dest, speed)
        stems[name] = f"/media/{job_id}/stretch/{tag}/{name}.mp3"

    if not stems:
        raise ValueError("No stems to stretch")
    return {"engine": engine, "speed": speed, "hq": True, "stems": stems}
