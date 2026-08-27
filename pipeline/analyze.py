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


def _estimate_time_signature(beat_strengths) -> dict:
    """Guess meter from relative accent strength on beat positions.

    Scores candidates 2/4, 3/4, 4/4, 6/8 (as 6 pulses). Prefers common meters
    when scores are close. Returns time_signature, beats_per_bar, confidence.
    """
    import numpy as np

    strengths = np.asarray(beat_strengths, dtype=float).reshape(-1)
    if strengths.size < 8:
        return {
            "time_signature": "4/4",
            "beats_per_bar": 4,
            "meter_confidence": 0.0,
            "meter_scores": {},
        }

    # Normalize so accents are comparable across tracks
    strengths = strengths - strengths.min()
    peak = float(strengths.max())
    if peak > 1e-9:
        strengths = strengths / peak

    candidates = (
        ("2/4", 2, 4),
        ("3/4", 3, 4),
        ("4/4", 4, 4),
        ("6/8", 6, 8),
    )
    scores: dict[str, float] = {}
    for label, n, _den in candidates:
        usable = (len(strengths) // n) * n
        if usable < n * 2:
            scores[label] = 0.0
            continue
        grid = strengths[:usable].reshape(-1, n)
        means = grid.mean(axis=0)
        # Downbeat (pos 0) should stand out; for 6/8 also accent beat 4 (index 3)
        down = float(means[0])
        others = float(np.mean(means[1:])) if n > 1 else 0.0
        score = down - others
        if n == 6 and means.size >= 4:
            mid = float(means[3])
            score += 0.35 * (mid - others)
        # Mild preference for 4/4 when ambiguous (most pop/rock)
        if label == "4/4":
            score += 0.05
        scores[label] = round(score, 4)

    best_label = max(scores, key=scores.get)
    ranked = sorted(scores.values(), reverse=True)
    gap = (ranked[0] - ranked[1]) if len(ranked) >= 2 else 0.0
    # Absolute gap — relative ratio blows up when scores are near zero
    conf = max(0.0, min(1.0, gap / 0.12)) if gap > 0 else 0.0
    # When accents are unclear, prefer 4/4 (most common practice meter)
    if gap < 0.04 or scores[best_label] < 0.02:
        best_label = "4/4"
        conf = 0.0
    beats_per_bar = next(n for lab, n, _d in candidates if lab == best_label)
    return {
        "time_signature": best_label,
        "beats_per_bar": beats_per_bar,
        "meter_confidence": round(conf, 3),
        "meter_scores": scores,
    }


def detect_bpm(audio_path: Path) -> dict:
    """Estimate tempo + time signature. Returns bpm, meter, beat phase."""
    import librosa
    import numpy as np

    if not audio_path.is_file():
        raise FileNotFoundError(f"Missing audio: {audio_path}")

    y, sr = librosa.load(str(audio_path), sr=22050, mono=True)
    if y.size < sr:  # < 1s
        raise ValueError("Audio too short for BPM detection")

    onset_env = librosa.onset.onset_strength(y=y, sr=sr)
    tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr, onset_envelope=onset_env)
    # librosa >=0.10 may return ndarray for tempo
    if hasattr(tempo, "__len__"):
        bpm = float(np.asarray(tempo).reshape(-1)[0])
    else:
        bpm = float(tempo)

    beat_times = librosa.frames_to_time(beat_frames, sr=sr)
    beat_frames = np.asarray(beat_frames, dtype=int).reshape(-1)
    # Strength at each beat frame (clamp to envelope length)
    if beat_frames.size:
        idx = np.clip(beat_frames, 0, len(onset_env) - 1)
        beat_strengths = onset_env[idx]
    else:
        beat_strengths = np.asarray([], dtype=float)

    meter = _estimate_time_signature(beat_strengths)
    beat0 = float(beat_times[0]) if len(beat_times) else 0.0

    return {
        "bpm": round(bpm, 1),
        "beat_count": int(len(beat_times)),
        "beat_0": round(beat0, 4),
        "duration_sec": round(float(librosa.get_duration(y=y, sr=sr)), 2),
        "time_signature": meter["time_signature"],
        "beats_per_bar": meter["beats_per_bar"],
        "meter_confidence": meter["meter_confidence"],
        "meter_scores": meter["meter_scores"],
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


def collapse_chord_changes(
    chords: list[dict],
    *,
    min_dur: float = 0.45,
) -> list[dict]:
    """
    Keep only chord *changes*: merge consecutive identical labels,
    absorb very short blips into neighbors, drop brief N gaps.
    """
    if not chords:
        return []

    # 1) Merge consecutive same labels
    merged: list[dict] = []
    for c in chords:
        label = str(c.get("label") or "N")
        start = float(c.get("start") or 0)
        end = float(c.get("end") or start)
        if end < start:
            end = start
        if merged and merged[-1]["label"] == label:
            merged[-1]["end"] = max(merged[-1]["end"], end)
            # keep earliest raw
        else:
            merged.append(
                {
                    "start": start,
                    "end": end,
                    "label": label,
                    "raw": c.get("raw", label),
                }
            )

    # 2) Absorb short segments into previous (or next if first)
    i = 0
    while i < len(merged):
        dur = merged[i]["end"] - merged[i]["start"]
        label = merged[i]["label"]
        short = dur < min_dur
        is_n = label == "N"
        if short or (is_n and dur < min_dur * 2):
            if i > 0:
                merged[i - 1]["end"] = merged[i]["end"]
                merged.pop(i)
                # re-merge if now same as next
                if i < len(merged) and merged[i - 1]["label"] == merged[i]["label"]:
                    merged[i - 1]["end"] = merged[i]["end"]
                    merged.pop(i)
                continue
            if i + 1 < len(merged):
                merged[i + 1]["start"] = merged[i]["start"]
                merged.pop(i)
                continue
        i += 1

    # 3) Final consecutive merge + round
    out: list[dict] = []
    for c in merged:
        if out and out[-1]["label"] == c["label"]:
            out[-1]["end"] = c["end"]
        else:
            out.append(
                {
                    "start": round(float(c["start"]), 3),
                    "end": round(float(c["end"]), 3),
                    "label": c["label"],
                    "raw": c.get("raw", c["label"]),
                }
            )
    return out


def detect_chords(audio_path: Path) -> dict:
    """
    madmom DeepChroma chord recognition.
    Returns {chords: [{start,end,label,raw}], chord_count, engine}.
    Chords are collapsed to change-points only (fewer, stabler labels).
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

    chords = collapse_chord_changes(chords)
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
