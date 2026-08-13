"""Job helpers: find stems, stage playable MP3s, safe IDs."""

from __future__ import annotations

import json
import re
import shutil
from pathlib import Path

from .encode import encode_stems_mp3
from .separate import STEM_ORDER

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
PLAY = DATA / "play"
INCOMING = DATA / "_incoming"

DATA.mkdir(parents=True, exist_ok=True)
PLAY.mkdir(parents=True, exist_ok=True)
INCOMING.mkdir(parents=True, exist_ok=True)


def safe_id(name: str) -> str:
    s = re.sub(r"[^A-Za-z0-9_\-]+", "_", name).strip("_")
    return (s[:60] or "track")


def find_stem_wavs(stems_dir: Path) -> dict[str, Path]:
    found: dict[str, Path] = {}
    for name in STEM_ORDER:
        wav = stems_dir / f"{name}.wav"
        if wav.exists():
            found[name] = wav
    return found


def latest_stems_dir() -> Path | None:
    candidates = sorted(
        INCOMING.glob("*/stems"),
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    )
    for stems_dir in candidates:
        if len(find_stem_wavs(stems_dir)) >= 4:
            return stems_dir
    return None


def write_job_meta(job_id: str, title: str, stems_dir: Path | None = None, **extra) -> Path:
    play_dir = PLAY / job_id
    play_dir.mkdir(parents=True, exist_ok=True)
    existing = read_job_meta(job_id) or {}
    meta = {
        **existing,
        "job_id": job_id,
        "title": title,
        "stems": STEM_ORDER,
        "stems_dir": str(stems_dir) if stems_dir else existing.get("stems_dir"),
    }
    meta.update(extra)
    path = play_dir / "meta.json"
    path.write_text(json.dumps(meta, indent=2), encoding="utf-8")
    return path


def read_job_meta(job_id: str) -> dict | None:
    path = PLAY / job_id / "meta.json"
    if not path.exists():
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def patch_job_meta(job_id: str, **fields) -> dict:
    meta = read_job_meta(job_id) or {
        "job_id": job_id,
        "title": job_id.replace("_", " "),
        "stems": STEM_ORDER,
    }
    meta.update(fields)
    play_dir = PLAY / job_id
    play_dir.mkdir(parents=True, exist_ok=True)
    (play_dir / "meta.json").write_text(json.dumps(meta, indent=2), encoding="utf-8")
    return meta


def source_wav_path(job_id: str) -> Path | None:
    """Locate source.wav for a job (incoming or beside stems_dir)."""
    candidates = [
        INCOMING / job_id / "source.wav",
        PLAY / job_id / "source.wav",
    ]
    meta = read_job_meta(job_id) or {}
    stems_dir = meta.get("stems_dir")
    if stems_dir:
        candidates.append(Path(stems_dir).parent / "source.wav")
    for p in candidates:
        if p.is_file():
            return p
    return None


def ensure_source_mp3(job_id: str) -> Path | None:
    """Ensure play/<id>/source.mp3 exists for hub playback."""
    from .encode import wav_to_mp3

    play_dir = PLAY / job_id
    play_dir.mkdir(parents=True, exist_ok=True)
    mp3 = play_dir / "source.mp3"
    if mp3.is_file():
        return mp3
    wav = source_wav_path(job_id)
    if not wav:
        return None
    return wav_to_mp3(wav, mp3)


def stage_opened_song(title: str, source_wav: Path) -> str:
    """Register a song for the hub (source only; no Demucs yet)."""
    from .encode import wav_to_mp3

    job_id = safe_id(title)
    incoming = INCOMING / job_id
    incoming.mkdir(parents=True, exist_ok=True)
    dest_wav = incoming / "source.wav"
    if source_wav.resolve() != dest_wav.resolve():
        shutil.copy2(source_wav, dest_wav)

    play_dir = PLAY / job_id
    play_dir.mkdir(parents=True, exist_ok=True)
    wav_to_mp3(dest_wav, play_dir / "source.mp3")

    stems = list_playable_stems(job_id)
    write_job_meta(
        job_id,
        title,
        stems_dir=str(incoming / "stems") if (incoming / "stems").is_dir() else None,
        opened=True,
        has_stems=len(stems) >= 4,
    )
    return job_id


def song_summary(job_id: str, *, ensure_source: bool = True) -> dict | None:
    """Hub payload for a song (opened and/or separated)."""
    play_dir = PLAY / job_id
    if not play_dir.is_dir():
        return None
    meta = read_job_meta(job_id) or {"job_id": job_id, "title": job_id.replace("_", " ")}
    if ensure_source:
        ensure_source_mp3(job_id)
    stems = list_playable_stems(job_id)
    has_source = (play_dir / "source.mp3").is_file()
    if not has_source and len(stems) < 4:
        return None
    return {
        "job_id": job_id,
        "title": meta.get("title") or job_id.replace("_", " "),
        "hub_url": f"/song/{job_id}",
        "player_url": f"/player/{job_id}" if len(stems) >= 4 else None,
        "source_url": f"/media/{job_id}/source.mp3" if has_source else None,
        "stem_count": len(stems),
        "has_stems": len(stems) >= 4,
        "bpm": meta.get("bpm"),
        "bpm_meta": meta.get("bpm_meta"),
        "last_played_at": meta.get("last_played_at"),
        "chords_status": meta.get("chords_status") or "idle",
        "chords": meta.get("chords") or [],
        "chords_source": meta.get("chords_source"),
        "chords_engine": meta.get("chords_engine"),
        "chord_count": meta.get("chord_count") or len(meta.get("chords") or []),
    }


def stage_playable(title: str, stem_wavs: dict[str, Path], stems_dir: Path | None = None) -> str:
    """Encode/copy MP3s into data/play/<ascii_id>/ and write meta. Returns job_id."""
    job_id = safe_id(title)
    out_dir = PLAY / job_id
    out_dir.mkdir(parents=True, exist_ok=True)

    # Keep source.mp3 / meta extras; only refresh stem files
    for name in STEM_ORDER:
        old = out_dir / f"{name}.mp3"
        if old.is_file():
            old.unlink()

    prepared: dict[str, Path] = {}
    for name, wav in stem_wavs.items():
        sibling = wav.with_suffix(".mp3")
        if sibling.exists():
            dest = out_dir / f"{name}.mp3"
            shutil.copy2(sibling, dest)
            prepared[name] = dest
        else:
            prepared[name] = wav

    still_wav = {n: p for n, p in prepared.items() if p.suffix.lower() == ".wav"}
    if still_wav:
        encoded = encode_stems_mp3(still_wav, out_dir=out_dir)
        prepared.update(encoded)

    for name in STEM_ORDER:
        if name not in prepared:
            continue
        src = prepared[name]
        dest = out_dir / f"{name}.mp3"
        if src.resolve() != dest.resolve():
            shutil.copy2(src, dest)

    write_job_meta(job_id, title, stems_dir=stems_dir, has_stems=True, opened=True)
    ensure_source_mp3(job_id)
    return job_id


def list_playable_stems(job_id: str) -> dict[str, str]:
    """Relative media URLs for existing mp3s."""
    out: dict[str, str] = {}
    play_dir = PLAY / job_id
    for name in STEM_ORDER:
        mp3 = play_dir / f"{name}.mp3"
        if mp3.is_file():
            out[name] = f"/media/{job_id}/{name}.mp3"
    return out


def list_jobs(limit: int = 50) -> list[dict]:
    """List opened and/or separated songs."""
    items: list[dict] = []
    if not PLAY.exists():
        return items
    for job_dir in PLAY.iterdir():
        if not job_dir.is_dir():
            continue
        summary = song_summary(job_dir.name, ensure_source=False)
        if not summary:
            continue
        mtime = job_dir.stat().st_mtime
        last_played = summary.get("last_played_at")
        sort_key = float(last_played) if last_played else mtime
        items.append(
            {
                **summary,
                "mtime": mtime,
                "_sort": sort_key,
            }
        )

    items.sort(key=lambda x: x["_sort"], reverse=True)
    for it in items:
        it.pop("_sort", None)
    return items[:limit]


def delete_job(job_id: str) -> bool:
    """Remove playable job (and matching incoming folder if present)."""
    if not re.fullmatch(r"[A-Za-z0-9_\-]+", job_id):
        raise ValueError("bad job id")
    play_dir = PLAY / job_id
    removed = False
    if play_dir.is_dir():
        shutil.rmtree(play_dir)
        removed = True
    # Best-effort: remove incoming folder with same safe id
    incoming = INCOMING / job_id
    if incoming.is_dir():
        shutil.rmtree(incoming)
        removed = True
    return removed


def touch_played(job_id: str) -> None:
    """Record that this job was opened in the player."""
    import time

    meta = read_job_meta(job_id) or {
        "job_id": job_id,
        "title": job_id.replace("_", " "),
        "stems": STEM_ORDER,
    }
    meta["last_played_at"] = time.time()
    play_dir = PLAY / job_id
    play_dir.mkdir(parents=True, exist_ok=True)
    (play_dir / "meta.json").write_text(json.dumps(meta, indent=2), encoding="utf-8")


def ensure_latest_job() -> dict | None:
    """Return newest playable job meta; stage from incoming only if library empty."""
    jobs = list_jobs(limit=1)
    if jobs:
        j = jobs[0]
        return read_job_meta(j["job_id"]) or {
            "job_id": j["job_id"],
            "title": j["title"],
            "stems": STEM_ORDER,
        }

    stems_dir = latest_stems_dir()
    if not stems_dir:
        return None
    wavs = find_stem_wavs(stems_dir)
    title = stems_dir.parent.name.replace("_", " ")
    job_id = stage_playable(title, wavs, stems_dir=stems_dir)
    return read_job_meta(job_id)
