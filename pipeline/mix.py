"""Mix playable stems into one MP3 (volumes / mute / solo + optional speed)."""

from __future__ import annotations

import re
import subprocess
import zipfile
from pathlib import Path

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


def mix_export_filename(title: str, speed: float) -> str:
    base = _safe_base(title)
    sp = f"{speed:.2f}".rstrip("0").rstrip(".")
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


def export_mix(
    job_id: str,
    volumes: dict[str, float],
    muted: dict[str, bool],
    solo: dict[str, bool],
    speed: float = 1.0,
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
    inputs: list[str] = []
    for name in names:
        inputs.extend(["-i", str(play_dir / f"{name}.mp3")])

    filter_parts: list[str] = []
    labels: list[str] = []
    for i, name in enumerate(names):
        lab = f"a{i}"
        filter_parts.append(f"[{i}:a]volume={gains[name]:.4f}[{lab}]")
        labels.append(f"[{lab}]")

    mixed = "mix"
    n = len(names)
    filter_parts.append(
        "".join(labels)
        + f"amix=inputs={n}:duration=longest:dropout_transition=0:normalize=0[{mixed}]"
    )

    meta = read_job_meta(job_id) or {}
    title = meta.get("title") or job_id
    out_dir = play_dir / "exports"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / mix_export_filename(title, speed)

    # Mix at 1× first, then HQ time-stretch (Rubber Band when available)
    if abs(float(speed) - 1.0) < 1e-6:
        cmd = [
            "ffmpeg",
            "-y",
            *inputs,
            "-filter_complex",
            ";".join(filter_parts),
            "-map",
            f"[{mixed}]",
            "-codec:a",
            "libmp3lame",
            "-b:a",
            "192k",
            str(out_path),
        ]
        proc = subprocess.run(cmd, capture_output=True, text=True)
        if proc.returncode != 0 or not out_path.is_file():
            err = (proc.stderr or proc.stdout or "ffmpeg mix failed")[-800:]
            raise RuntimeError(err)
        return out_path

    with_temp = out_dir / f"_mix_1x_{mix_export_filename(title, 1.0)}"
    cmd = [
        "ffmpeg",
        "-y",
        *inputs,
        "-filter_complex",
        ";".join(filter_parts),
        "-map",
        f"[{mixed}]",
        "-codec:a",
        "libmp3lame",
        "-b:a",
        "192k",
        str(with_temp),
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0 or not with_temp.is_file():
        err = (proc.stderr or proc.stdout or "ffmpeg mix failed")[-800:]
        raise RuntimeError(err)
    try:
        stretch_file(with_temp, out_path, speed)
    finally:
        if with_temp.is_file():
            with_temp.unlink(missing_ok=True)
    return out_path