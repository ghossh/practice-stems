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


def write_job_meta(job_id: str, title: str, stems_dir: Path | None = None) -> Path:
    play_dir = PLAY / job_id
    play_dir.mkdir(parents=True, exist_ok=True)
    meta = {
        "job_id": job_id,
        "title": title,
        "stems": STEM_ORDER,
        "stems_dir": str(stems_dir) if stems_dir else None,
    }
    path = play_dir / "meta.json"
    path.write_text(json.dumps(meta, indent=2), encoding="utf-8")
    return path


def read_job_meta(job_id: str) -> dict | None:
    path = PLAY / job_id / "meta.json"
    if not path.exists():
        return None
    return json.loads(path.read_text(encoding="utf-8"))


def stage_playable(title: str, stem_wavs: dict[str, Path], stems_dir: Path | None = None) -> str:
    """Encode/copy MP3s into data/play/<ascii_id>/ and write meta. Returns job_id."""
    job_id = safe_id(title)
    out_dir = PLAY / job_id
    if out_dir.exists():
        shutil.rmtree(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

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

    write_job_meta(job_id, title, stems_dir=stems_dir)
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
    """List playable jobs only (fast — does not encode MP3s)."""
    items: list[dict] = []
    if not PLAY.exists():
        return items
    for job_dir in PLAY.iterdir():
        if not job_dir.is_dir():
            continue
        stems = list_playable_stems(job_dir.name)
        if len(stems) < 4:
            continue
        meta = read_job_meta(job_dir.name) or {}
        title = meta.get("title") or job_dir.name.replace("_", " ")
        last_played = meta.get("last_played_at")
        mtime = job_dir.stat().st_mtime
        sort_key = float(last_played) if last_played else mtime
        items.append(
            {
                "job_id": job_dir.name,
                "title": title,
                "player_url": f"/player/{job_dir.name}",
                "stem_count": len(stems),
                "last_played_at": last_played,
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
