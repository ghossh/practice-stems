#!/usr/bin/env python3
"""Copy a Homebrew Mach-O binary + dylibs into prefix/bin and prefix/lib."""

from __future__ import annotations

import os
import shutil
import subprocess
import sys
from pathlib import Path


def _otool_libs(path: Path) -> list[str]:
    out = subprocess.check_output(["otool", "-L", str(path)], text=True)
    libs: list[str] = []
    for line in out.splitlines()[1:]:
        bit = line.strip().split(" ", 1)[0]
        if bit:
            libs.append(bit)
    return libs


def _is_brew(p: str) -> bool:
    return p.startswith("/opt/homebrew/") or p.startswith("/usr/local/")


def _collect(root: Path) -> dict[str, Path]:
    """Map install-name basename → resolved file (so libfoo.0.dylib keeps that name)."""
    mapping: dict[str, Path] = {}
    queue = [root.resolve()]
    seen: set[str] = set()
    while queue:
        cur = queue.pop()
        key = str(cur)
        if key in seen or not cur.is_file():
            continue
        seen.add(key)
        for lib in _otool_libs(cur):
            if not _is_brew(lib):
                continue
            resolved = Path(lib).resolve()
            mapping[Path(lib).name] = resolved
            queue.append(resolved)
    return mapping


def _codesign(path: Path) -> None:
    subprocess.run(
        ["codesign", "--force", "--sign", "-", str(path)],
        check=False,
        capture_output=True,
    )


def main() -> None:
    if len(sys.argv) != 3:
        sys.exit("usage: bundle_dylibs.py /path/to/binary /prefix")
    src = Path(sys.argv[1]).resolve()
    prefix = Path(sys.argv[2]).resolve()
    bin_dir = prefix / "bin"
    lib_dir = prefix / "lib"
    bin_dir.mkdir(parents=True, exist_ok=True)
    lib_dir.mkdir(parents=True, exist_ok=True)

    dest_bin = bin_dir / src.name
    shutil.copy2(src, dest_bin)
    os.chmod(dest_bin, 0o755)

    mapping = _collect(src)
    for name, resolved in mapping.items():
        shutil.copy2(resolved, lib_dir / name)

    targets = [dest_bin, *sorted(lib_dir.glob("*"))]
    for dest in targets:
        is_bin = dest.parent == bin_dir
        for lib in _otool_libs(dest):
            name = Path(lib).name
            if not _is_brew(lib):
                continue
            if not is_bin and name == dest.name:
                new = f"@loader_path/{name}"
                subprocess.run(["install_name_tool", "-id", new, str(dest)], check=False)
                continue
            new = f"@loader_path/../lib/{name}" if is_bin else f"@loader_path/{name}"
            subprocess.run(
                ["install_name_tool", "-change", lib, new, str(dest)],
                check=False,
            )
        _codesign(dest)

    print(f"bundled {src.name} → {dest_bin} (+ {len(mapping)} dylibs)")


if __name__ == "__main__":
    main()
