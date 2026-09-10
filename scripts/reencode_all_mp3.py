#!/usr/bin/env python3
"""Re-encode all library MP3s at the current default bitrate (96k)."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from pipeline.jobs import PLAY, list_jobs, reencode_job_mp3s  # noqa: E402


def main() -> int:
    jobs = list_jobs(limit=500)
    if not jobs:
        print("No songs in library.")
        return 0

    ok = 0
    skipped = 0
    failed = 0
    for job in jobs:
        job_id = job["job_id"]
        title = job.get("title") or job_id
        try:
            counts = reencode_job_mp3s(job_id)
            if counts["stems"] == 0 and counts["source"] == 0:
                print(f"skip  {title} (no source/stem WAVs found)")
                skipped += 1
                continue
            print(
                f"ok    {title} — {counts['stems']} stems"
                + (", source" if counts["source"] else "")
            )
            ok += 1
        except Exception as exc:
            print(f"fail  {title}: {exc}", file=sys.stderr)
            failed += 1

    print(f"\nDone: {ok} re-encoded, {skipped} skipped, {failed} failed.")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
