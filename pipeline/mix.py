"""Mix playable stems into one MP3 (volumes / mute / solo + optional speed)."""

from __future__ import annotations

import re
import subprocess
import zipfile
from pathlib import Path

from .encode import MP3_BITRATE
from .jobs import PLAY, STEM_ORDER, read_job_meta
from .stretch import stretch_file


def effective_gains(
    volumes: dict[str, float],
    muted: dict[str, bool],
    solo: dict[str, bool],
    available: list[str],
) -> dict[str, float]:
    """Return stem -> gain for stems that should be in the mix."""
    any_solo = any(solo.get(n, False) for n in available)
    gains: dict[str, float] = {}
    for name in available:
        if muted.get(name, False):
            continue
        if any_solo and not solo.get(name, False):
            continue
        vol = float(volumes.get(name, 1.0))
        vol = max(0.0, min(1.0, vol))
        if vol <= 0:
            continue
        gains[name] = vol
    return gains


def _safe_base(title: str, max_len: int = 50) -> str:
    return re.sub(r"[^A-Za-z0-9_\-]+", "_", title).strip("_")[:max_len] or "track"


def _speed_tag(speed: float) -> str:
    return f"{speed:.2f}".rstrip("0").rstrip(".")


def _time_tag(sec: float) -> str:
    t = max(0, int(round(sec)))
    return f"{t // 60}m{t % 60:02d}s"


def mix_export_filename(
    title: str,
    speed: float,
    start_sec: float | None = None,
    end_sec: float | None = None,
) -> str:
    base = _safe_base(title)
    sp = _speed_tag(speed)
    if start_sec is not None and end_sec is not None:
        return f"{base}_loop_{_time_tag(start_sec)}-{_time_tag(end_sec)}_{sp}x.mp3"
    return f"{base}_mix_{sp}x.mp3"


def stems_zip_filename(title: str) -> str:
    return f"{_safe_base(title)}_stems.zip"


def export_stems_zip(job_id: str) -> Path:
    """Zip all stem MP3s into a folder named <title>_stems/ inside the archive."""
    if not re.fullmatch(r"[A-Za-z0-9_\-]+", job_id):
        raise ValueError("bad job id")

    play_dir = PLAY / job_id
    if not play_dir.is_dir():
        raise FileNotFoundError("job not found")

    stems = [(n, play_dir / f"{n}.mp3") for n in STEM_ORDER if (play_dir / f"{n}.mp3").is_file()]
    if not stems:
        raise ValueError("No stem MP3s found")

    meta = read_job_meta(job_id) or {}
    title = meta.get("title") or job_id
    folder = f"{_safe_base(title)}_stems"
    out_dir = play_dir / "exports"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / stems_zip_filename(title)

    with zipfile.ZipFile(out_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for name, path in stems:
            zf.write(path, arcname=f"{folder}/{name}.mp3")
    return out_path


def _probe_duration(path: Path) -> float:
    cmd = [
        "ffprobe",
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        str(path),
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    try:
        dur = float((proc.stdout or "").strip())
    except ValueError:
        dur = 0.0
    if proc.returncode != 0 or not (dur > 0):
        err = (proc.stderr or proc.stdout or "ffprobe failed")[-400:]
        raise RuntimeError(err)
    return dur


def _run_ffmpeg_mix(inputs: list[str], filter_parts: list[str], mapped: str, out_path: Path) -> None:
    cmd = [
        "ffmpeg",
        "-y",
        *inputs,
        "-filter_complex",
        ";".join(filter_parts),
        "-map",
        f"[{mapped}]",
        "-codec:a",
        "libmp3lame",
        "-b:a",
        MP3_BITRATE,
        str(out_path),
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0 or not out_path.is_file():
        err = (proc.stderr or proc.stdout or "ffmpeg mix failed")[-800:]
        raise RuntimeError(err)


def export_mix(
    job_id: str,
    volumes: dict[str, float],
    muted: dict[str, bool],
    solo: dict[str, bool],
    speed: float = 1.0,
    start_ratio: float | None = None,
    end_ratio: float | None = None,
) -> Path:
    """Mix stem MP3s for a job into data/play/<job>/exports/<file>.mp3."""
    if not re.fullmatch(r"[A-Za-z0-9_\-]+", job_id):
        raise ValueError("bad job id")

    play_dir = PLAY / job_id
    if not play_dir.is_dir():
        raise FileNotFoundError("job not found")

    available = [n for n in STEM_ORDER if (play_dir / f"{n}.mp3").is_file()]
    gains = effective_gains(volumes, muted, solo, available)
    if not gains:
        raise ValueError("Nothing to mix — unmute at least one stem")

    names = [n for n in STEM_ORDER if n in gains]
    first_path = play_dir / f"{names[0]}.mp3"

    start_sec = end_sec = None
    if start_ratio is not None or end_ratio is not None:
        if start_ratio is None or end_ratio is None:
            raise ValueError("Loop export needs both start and end")
        lo = max(0.0, min(1.0, float(start_ratio)))
        hi = max(0.0, min(1.0, float(end_ratio)))
        if hi < lo:
            lo, hi = hi, lo
        if hi - lo < 0.008:
            raise ValueError("Loop is too short")
        dur = _probe_duration(first_path)
        start_sec = lo * dur
        end_sec = hi * dur
        if end_sec - start_sec < 0.05:
            raise ValueError("Loop is too short")

    inputs: list[str] = []
    for name in names:
        path = str(play_dir / f"{name}.mp3")
        if start_sec is not None and end_sec is not None:
            inputs.extend(["-ss", f"{start_sec:.4f}", "-t", f"{end_sec - start_sec:.4f}", "-i", path])
        else:
            inputs.extend(["-i", path])

    filter_parts: list[str] = []
    labels: list[str] = []
    for i, name in enumerate(names):
        lab = f"a{i}"
        filter_parts.append(f"[{i}:a]volume={gains[name]:.4f}[{lab}]")
        labels.append(f"[{lab}]")

    mapped = "mix"
    n = len(names)
    filter_parts.append(
        "".join(labels)
        + f"amix=inputs={n}:duration=longest:dropout_transition=0:normalize=0[{mapped}]"
    )

    meta = read_job_meta(job_id) or {}
    title = meta.get("title") or job_id
    out_dir = play_dir / "exports"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / mix_export_filename(title, speed, start_sec, end_sec)

    # Mix at 1× first, then HQ time-stretch (Rubber Band when available)
    if abs(float(speed) - 1.0) < 1e-6:
        _run_ffmpeg_mix(inputs, filter_parts, mapped, out_path)
        return out_path

    with_temp = out_dir / f"_mix_1x_{mix_export_filename(title, 1.0, start_sec, end_sec)}"
    try:
        _run_ffmpeg_mix(inputs, filter_parts, mapped, with_temp)
        stretch_file(with_temp, out_path, speed)
    finally:
        if with_temp.is_file():
            with_temp.unlink(missing_ok=True)
    return out_path