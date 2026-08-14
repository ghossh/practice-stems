"""Time stretch + key transpose (Rubber Band → ffmpeg fallbacks)."""

from __future__ import annotations

import re
import shutil
import subprocess
import tempfile
from pathlib import Path

from .jobs import PLAY, STEM_ORDER

MAX_SEMITONES = 6


def _has_rubberband() -> bool:
    return shutil.which("rubberband") is not None


def stretch_engine() -> str:
    return "rubberband" if _has_rubberband() else "ffmpeg"


def clamp_semitones(n: int | float) -> int:
    return max(-MAX_SEMITONES, min(MAX_SEMITONES, int(n)))


def speed_tag(speed: float) -> str:
    """Filesystem-safe tag, e.g. 0.75 → 0p75."""
    s = f"{float(speed):.4f}".rstrip("0").rstrip(".")
    return s.replace(".", "p")


def pitch_tag(semitones: int) -> str:
    n = clamp_semitones(semitones)
    if n < 0:
        return f"km{abs(n)}"
    return f"k{n}"


def xform_tag(speed: float, semitones: int) -> str:
    return f"s{speed_tag(speed)}_{pitch_tag(semitones)}"


def stretch_dir(job_id: str, speed: float) -> Path:
    """Legacy path for speed-only cache."""
    return PLAY / job_id / "stretch" / speed_tag(speed)


def xform_dir(job_id: str, speed: float, semitones: int) -> Path:
    return PLAY / job_id / "xform" / xform_tag(speed, semitones)


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


def _ffmpeg_pitch_tempo_filter(speed: float, semitones: int) -> str:
    """
    Pitch shift via asetrate + compensate with atempo; then apply practice speed.
    factor = 2^(semitones/12); pitch up => asetrate higher, atempo lower to keep duration.
    """
    parts: list[str] = []
    if semitones:
        factor = 2.0 ** (semitones / 12.0)
        # Change perceived pitch, then restore tempo
        parts.append(f"asetrate=44100*{factor:.10g}")
        parts.append("aresample=44100")
        # Compensate pitch-induced tempo change, then apply user speed
        tempo = (1.0 / factor) * speed
        parts.append(_atempo_chain(tempo))
    elif abs(speed - 1.0) >= 1e-6:
        parts.append(_atempo_chain(speed))
    return ",".join(parts)


def transform_file(src: Path, dest: Path, speed: float = 1.0, semitones: int = 0) -> str:
    """
    Write tempo/pitch-transformed audio to dest (mp3).
    speed < 1 = slower; semitones = key shift (negative = down).
    Returns engine name used.
    """
    speed = max(0.25, min(2.0, float(speed)))
    semitones = clamp_semitones(semitones)
    dest.parent.mkdir(parents=True, exist_ok=True)

    if abs(speed - 1.0) < 1e-6 and semitones == 0:
        if src.resolve() != dest.resolve():
            shutil.copy2(src, dest)
        return "copy"

    if _has_rubberband():
        # Rubber Band -t is duration multiplier (= 1/speed for slower playback)
        time_ratio = 1.0 / speed
        with tempfile.TemporaryDirectory(prefix="xform_") as td:
            td_path = Path(td)
            in_wav = td_path / "in.wav"
            out_wav = td_path / "out.wav"
            _ffmpeg_to_wav(src, in_wav)
            cmd = [
                "rubberband",
                "-t",
                f"{time_ratio:.8g}",
                "--fine",
                "-c",
                "5",
            ]
            if semitones:
                cmd.extend(["-p", str(semitones), "-F"])  # -F formant preserve
            cmd.extend([str(in_wav), str(out_wav)])
            proc = subprocess.run(cmd, capture_output=True, text=True)
            if proc.returncode != 0 or not out_wav.is_file():
                err = (proc.stderr or proc.stdout or "rubberband failed")[-500:]
                raise RuntimeError(err)
            _ffmpeg_wav_to_mp3(out_wav, dest)
        return "rubberband"

    filt = _ffmpeg_pitch_tempo_filter(speed, semitones)
    if not filt:
        if src.resolve() != dest.resolve():
            shutil.copy2(src, dest)
        return "copy"

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
        err = (proc.stderr or proc.stdout or "ffmpeg transform failed")[-500:]
        raise RuntimeError(err)
    return "ffmpeg"


def stretch_file(src: Path, dest: Path, speed: float) -> str:
    """Pitch-preserving time stretch only (legacy helper)."""
    return transform_file(src, dest, speed=speed, semitones=0)


def _media_url(job_id: str, speed: float, semitones: int, filename: str) -> str:
    if abs(speed - 1.0) < 1e-6 and semitones == 0:
        return f"/media/{job_id}/{filename}"
    # Prefer unified xform route; speed-only also available under legacy stretch/
    if semitones == 0:
        return f"/media/{job_id}/stretch/{speed_tag(speed)}/{filename}"
    return f"/media/{job_id}/xform/{xform_tag(speed, semitones)}/{filename}"


def ensure_transformed_stems(
    job_id: str,
    speed: float = 1.0,
    semitones: int = 0,
) -> dict:
    """
    Ensure stem MP3s exist for this job at speed + key offset.
    Returns {engine, speed, semitones, hq, stems: {name: url}}.
    """
    if not re.fullmatch(r"[A-Za-z0-9_\-]+", job_id):
        raise ValueError("bad job id")
    speed = max(0.25, min(2.0, float(speed)))
    semitones = clamp_semitones(semitones)
    play_dir = PLAY / job_id
    if not play_dir.is_dir():
        raise FileNotFoundError("job not found")

    if abs(speed - 1.0) < 1e-6 and semitones == 0:
        stems = {
            n: f"/media/{job_id}/{n}.mp3"
            for n in STEM_ORDER
            if (play_dir / f"{n}.mp3").is_file()
        }
        return {
            "engine": "none",
            "speed": 1.0,
            "semitones": 0,
            "hq": False,
            "stems": stems,
        }

    if semitones == 0:
        out = stretch_dir(job_id, speed)
    else:
        out = xform_dir(job_id, speed, semitones)
    out.mkdir(parents=True, exist_ok=True)

    engine = stretch_engine()
    stems: dict[str, str] = {}

    for name in STEM_ORDER:
        src = play_dir / f"{name}.mp3"
        if not src.is_file():
            continue
        dest = out / f"{name}.mp3"
        if not (dest.is_file() and dest.stat().st_mtime >= src.stat().st_mtime):
            transform_file(src, dest, speed=speed, semitones=semitones)
        stems[name] = _media_url(job_id, speed, semitones, f"{name}.mp3")

    if not stems:
        raise ValueError("No stems to transform")
    return {
        "engine": engine,
        "speed": speed,
        "semitones": semitones,
        "hq": abs(speed - 1.0) >= 1e-6,
        "stems": stems,
    }


def ensure_stretched_stems(job_id: str, speed: float) -> dict:
    """Legacy wrapper: HQ time-stretch only."""
    return ensure_transformed_stems(job_id, speed=speed, semitones=0)


def ensure_pitched_source(job_id: str, semitones: int) -> dict:
    """
    Pitch-shift source.mp3 for chord-hub preview (tempo unchanged).
    Returns {engine, semitones, source_url}.
    """
    if not re.fullmatch(r"[A-Za-z0-9_\-]+", job_id):
        raise ValueError("bad job id")
    semitones = clamp_semitones(semitones)
    play_dir = PLAY / job_id
    src = play_dir / "source.mp3"
    if not src.is_file():
        raise FileNotFoundError("No source.mp3 for pitch shift")

    if semitones == 0:
        return {
            "engine": "none",
            "semitones": 0,
            "source_url": f"/media/{job_id}/source.mp3",
        }

    out = xform_dir(job_id, 1.0, semitones)
    out.mkdir(parents=True, exist_ok=True)
    dest = out / "source.mp3"
    engine = stretch_engine()
    if not (dest.is_file() and dest.stat().st_mtime >= src.stat().st_mtime):
        engine = transform_file(src, dest, speed=1.0, semitones=semitones)
    return {
        "engine": engine,
        "semitones": semitones,
        "source_url": f"/media/{job_id}/xform/{xform_tag(1.0, semitones)}/source.mp3",
    }
