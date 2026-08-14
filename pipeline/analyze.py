"""Song analysis helpers (BPM, chords, key)."""

from __future__ import annotations

import subprocess
import tempfile
from pathlib import Path

from .jobs import INCOMING, PLAY, find_stem_wavs, read_job_meta, source_wav_path

# Prefer harmonic content for chord recognition (skip drums / vocals)
_HARMONIC_STEMS = ("guitar", "piano", "other", "bass")

_NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

# Krumhansl-Schmuckler key profiles (pitch-class weights)
_MAJOR_PROFILE = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88]
_MINOR_PROFILE = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17]


def _corr(a: list[float], b: list[float]) -> float:
    import numpy as np

    aa = np.asarray(a, dtype=float)
    bb = np.asarray(b, dtype=float)
    aa = aa - aa.mean()
    bb = bb - bb.mean()
    denom = float(np.linalg.norm(aa) * np.linalg.norm(bb))
    if denom < 1e-12:
        return 0.0
    return float(np.dot(aa, bb) / denom)


def _best_key_from_chroma(chroma_mean: list[float]) -> dict:
    """Return {key, root, mode, score} from 12-d chroma vector."""
    best = {"key": "C", "root": "C", "mode": "major", "score": -1.0}
    for i in range(12):
        rolled = chroma_mean[i:] + chroma_mean[:i]
        for mode, profile in (("major", _MAJOR_PROFILE), ("minor", _MINOR_PROFILE)):
            score = _corr(rolled, profile)
            if score > best["score"]:
                root = _NOTE_NAMES[i]
                label = root + ("m" if mode == "minor" else "")
                best = {"key": label, "root": root, "mode": mode, "score": round(score, 4)}
    return best


def estimate_key_from_chords(chords: list[dict]) -> dict | None:
    """Estimate key from chord list via duration-weighted roots."""
    if not chords:
        return None
    weights = [0.0] * 12
    maj_w = [0.0] * 12
    min_w = [0.0] * 12
    for c in chords:
        label = str(c.get("label") or "")
        if label in {"N", "n", "X", "?", ""}:
            continue
        start = float(c.get("start") or 0)
        end = float(c.get("end") or start)
        dur = max(end - start, 0.05)
        m = __import__("re").match(r"^([A-G](?:#|b)?)(m?)", label)
        if not m:
            continue
        root = m.group(1).replace("b", "b")
        flat_map = {"Db": "C#", "Eb": "D#", "Fb": "E", "Gb": "F#", "Ab": "G#", "Bb": "A#", "Cb": "B"}
        root = flat_map.get(root, root)
        try:
            idx = _NOTE_NAMES.index(root)
        except ValueError:
            continue
        is_min = m.group(2) == "m" or ":min" in str(c.get("raw") or "")
        weights[idx] += dur
        if is_min:
            min_w[idx] += dur
        else:
            maj_w[idx] += dur
    if sum(weights) < 1e-6:
        return None
    # Prefer maj/min profile of the strongest root, refined by full KS on weights
    best = _best_key_from_chroma(weights)
    best["engine"] = "chords"
    return best


def detect_key(audio_path: Path) -> dict:
    """Estimate musical key from audio chroma (librosa)."""
    import librosa

    if not audio_path.is_file():
        raise FileNotFoundError(f"Missing audio: {audio_path}")

    y, sr = librosa.load(str(audio_path), sr=22050, mono=True)
    if y.size < sr:
        raise ValueError("Audio too short for key detection")

    chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
    chroma_mean = chroma.mean(axis=1).tolist()
    best = _best_key_from_chroma(chroma_mean)
    best["engine"] = "librosa_chroma"
    best["duration_sec"] = round(float(librosa.get_duration(y=y, sr=sr)), 2)
    return best


def detect_key_for_job(job_id: str) -> dict:
    """
    Detect key for a job. Prefers harmonic stems (same as chords), else source.
    If chords already exist in meta, also try chord-based estimate and keep the higher score.
    """
    meta = read_job_meta(job_id) or {}
    chord_est = None
    if meta.get("chords"):
        chord_est = estimate_key_from_chords(meta["chords"])

    audio = None
    source_tag = "source"
    try:
        audio, source_tag = chord_audio_for_job(job_id)
    except FileNotFoundError:
        audio = None

    audio_est = None
    if audio and audio.is_file():
        audio_est = detect_key(audio)
        audio_est["source"] = source_tag

    if chord_est and audio_est:
        # Prefer chord estimate when chords exist (more musical for pop/rock)
        if chord_est.get("score", 0) >= (audio_est.get("score", 0) - 0.05):
            out = {**chord_est, "source": "chords"}
        else:
            out = audio_est
    elif chord_est:
        out = {**chord_est, "source": "chords"}
    elif audio_est:
        out = audio_est
    else:
        raise FileNotFoundError("No audio or chords available for key detection")

    return out


def detect_bpm(audio_path: Path) -> dict:
    """Estimate tempo with librosa. Returns bpm + confidence-ish metadata."""
    import librosa
    import numpy as np

    if not audio_path.is_file():
        raise FileNotFoundError(f"Missing audio: {audio_path}")

    y, sr = librosa.load(str(audio_path), sr=22050, mono=True)
    if y.size < sr:  # < 1s
        raise ValueError("Audio too short for BPM detection")

    tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
    # librosa >=0.10 may return ndarray for tempo
    if hasattr(tempo, "__len__"):
        bpm = float(np.asarray(tempo).reshape(-1)[0])
    else:
        bpm = float(tempo)

    beat_times = librosa.frames_to_time(beat_frames, sr=sr).tolist()
    return {
        "bpm": round(bpm, 1),
        "beat_count": len(beat_times),
        "duration_sec": round(float(librosa.get_duration(y=y, sr=sr)), 2),
    }


def _to_mono_wav(src: Path, dest: Path) -> Path:
    dest.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(src),
            "-ac",
            "1",
            "-ar",
            "44100",
            "-acodec",
            "pcm_s16le",
            str(dest),
        ],
        check=True,
        capture_output=True,
    )
    return dest


def _mix_stems_to_wav(paths: list[Path], dest: Path) -> Path:
    """Mix multiple audio files to mono wav for chord analysis."""
    dest.parent.mkdir(parents=True, exist_ok=True)
    if len(paths) == 1:
        return _to_mono_wav(paths[0], dest)
    inputs: list[str] = []
    for p in paths:
        inputs.extend(["-i", str(p)])
    n = len(paths)
    filt = "".join(f"[{i}:a]" for i in range(n))
    filt += f"amix=inputs={n}:duration=longest:dropout_transition=0:normalize=0,aformat=channel_layouts=mono[out]"
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            *inputs,
            "-filter_complex",
            filt,
            "-map",
            "[out]",
            "-ar",
            "44100",
            "-acodec",
            "pcm_s16le",
            str(dest),
        ],
        check=True,
        capture_output=True,
    )
    return dest


def chord_audio_for_job(job_id: str) -> tuple[Path, str]:
    """
    Build (or locate) audio for chord recognition.
    Prefers guitar+piano+other(+bass) stems; falls back to source.
    Returns (wav_path, source_tag). Caller may delete temp files under /tmp.
    """
    play = PLAY / job_id
    meta = read_job_meta(job_id) or {}
    stem_paths: list[Path] = []

    # Prefer original WAVs from incoming / stems_dir
    stems_dir = None
    if meta.get("stems_dir"):
        stems_dir = Path(meta["stems_dir"])
    if not stems_dir or not stems_dir.is_dir():
        cand = INCOMING / job_id / "stems"
        if cand.is_dir():
            stems_dir = cand

    if stems_dir and stems_dir.is_dir():
        wavs = find_stem_wavs(stems_dir)
        for name in _HARMONIC_STEMS:
            if name in wavs:
                stem_paths.append(wavs[name])

    if not stem_paths:
        for name in _HARMONIC_STEMS:
            mp3 = play / f"{name}.mp3"
            if mp3.is_file():
                stem_paths.append(mp3)

    out = play / "analysis" / "chords_input.wav"
    if stem_paths:
        _mix_stems_to_wav(stem_paths, out)
        return out, "harmonic_stems"

    src = source_wav_path(job_id)
    if src:
        _to_mono_wav(src, out)
        return out, "source"

    mp3 = play / "source.mp3"
    if mp3.is_file():
        _to_mono_wav(mp3, out)
        return out, "source"

    raise FileNotFoundError("No audio available for chord detection")


def _pretty_chord_label(raw: str) -> str:
    """C:maj → C, A:min → Am, N → N."""
    s = str(raw).strip()
    if s in {"N", "n", "X", ""}:
        return "N"
    if ":min" in s:
        root = s.split(":", 1)[0]
        return f"{root}m"
    if ":maj" in s:
        return s.split(":", 1)[0]
    return s.replace(":", "")


def detect_chords(audio_path: Path) -> dict:
    """
    madmom DeepChroma chord recognition.
    Returns {chords: [{start,end,label,raw}], chord_count, engine}.
    """
    import numpy as np
    from madmom.audio.chroma import DeepChromaProcessor
    from madmom.features.chords import DeepChromaChordRecognitionProcessor
    from madmom.processors import SequentialProcessor

    if not audio_path.is_file():
        raise FileNotFoundError(f"Missing audio: {audio_path}")

    # Work on a temp copy with a simple name — some madmom paths dislike unicode
    with tempfile.TemporaryDirectory(prefix="chords_") as td:
        wav = Path(td) / "in.wav"
        if audio_path.suffix.lower() == ".wav":
            # Ensure mono 44.1k for consistent features
            _to_mono_wav(audio_path, wav)
        else:
            _to_mono_wav(audio_path, wav)

        dcp = DeepChromaProcessor()
        decode = DeepChromaChordRecognitionProcessor()
        chordrec = SequentialProcessor([dcp, decode])
        raw = chordrec(str(wav))

    chords: list[dict] = []
    # madmom returns structured ndarray: (start, end, label)
    arr = np.asarray(raw)
    if arr.size == 0:
        return {"chords": [], "chord_count": 0, "engine": "madmom_deepchroma"}

    for row in arr:
        if isinstance(row, np.void) or (hasattr(row, "dtype") and row.dtype.names):
            start = float(row["start"])
            end = float(row["end"])
            label_raw = str(row["label"])
        else:
            start = float(row[0])
            end = float(row[1])
            label_raw = str(row[2])
        # label may be bytes
        if isinstance(label_raw, bytes):
            label_raw = label_raw.decode("utf-8", errors="replace")
        chords.append(
            {
                "start": round(start, 3),
                "end": round(end, 3),
                "label": _pretty_chord_label(label_raw),
                "raw": label_raw,
            }
        )

    return {
        "chords": chords,
        "chord_count": len(chords),
        "engine": "madmom_deepchroma",
    }


def detect_chords_for_job(job_id: str) -> dict:
    """Prepare harmonic audio + run DeepChroma; returns result + source tag + key."""
    audio, source = chord_audio_for_job(job_id)
    result = detect_chords(audio)
    result["source"] = source
    # Prefer key from the chords we just found; fall back to chroma on same audio
    key_est = estimate_key_from_chords(result.get("chords") or [])
    if not key_est:
        try:
            key_est = detect_key(audio)
            key_est["source"] = source
        except Exception:
            key_est = None
    else:
        key_est["source"] = "chords"
    if key_est:
        result["key"] = key_est.get("key")
        result["key_meta"] = key_est
    return result
