#!/usr/bin/env python3
"""Write a 1024×1024 mixer-style PNG (stdlib only)."""

from __future__ import annotations

import struct
import sys
import zlib
from pathlib import Path


def _png(path: Path, w: int, h: int, rgba: bytes) -> None:
    def chunk(tag: bytes, data: bytes) -> bytes:
        return (
            struct.pack(">I", len(data))
            + tag
            + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    raw = b"".join(b"\x00" + rgba[y * w * 4 : (y + 1) * w * 4] for y in range(h))
    path.write_bytes(
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(raw, 9))
        + chunk(b"IEND", b"")
    )


def _inside_round_rect(x: int, y: int, size: int, radius: int) -> bool:
    r = radius
    if r <= x < size - r and 0 <= y < size:
        return True
    if 0 <= x < size and r <= y < size - r:
        return True
    corners = (
        (r, r),
        (size - 1 - r, r),
        (r, size - 1 - r),
        (size - 1 - r, size - 1 - r),
    )
    for cx, cy in corners:
        if (x - cx) ** 2 + (y - cy) ** 2 <= r * r:
            return True
    return False


def main() -> None:
    dest = Path(sys.argv[1] if len(sys.argv) > 1 else "icon.png")
    size = 1024
    bg = (11, 13, 18, 255)
    card = (18, 21, 29, 255)
    bars = [
        (62, 207, 142, 255),
        (61, 156, 240, 255),
        (240, 180, 41, 255),
        (232, 93, 93, 255),
        (154, 163, 181, 255),
        (238, 241, 247, 255),
    ]
    heights = [0.82, 0.55, 0.70, 0.40, 0.62, 0.48]
    buf = bytearray(size * size * 4)
    margin = 64
    radius = 220

    def set_px(x: int, y: int, c: tuple[int, int, int, int]) -> None:
        i = (y * size + x) * 4
        buf[i : i + 4] = bytes(c)

    for y in range(size):
        for x in range(size):
            lx, ly = x - margin, y - margin
            inner = size - 2 * margin
            if 0 <= lx < inner and 0 <= ly < inner and _inside_round_rect(lx, ly, inner, radius):
                set_px(x, y, card)
            else:
                set_px(x, y, (0, 0, 0, 0) if not (
                    margin // 3 <= x < size - margin // 3 and margin // 3 <= y < size - margin // 3
                ) else bg)

    # Six fader bars
    inner = size - 2 * margin
    gap = inner // 16
    bar_w = (inner - 7 * gap) // 6
    base_y = margin + inner - gap * 2
    max_h = inner - 4 * gap
    for i, (color, ht) in enumerate(zip(bars, heights)):
        x0 = margin + gap + i * (bar_w + gap)
        h = int(max_h * ht)
        y0 = base_y - h
        for y in range(y0, base_y):
            for x in range(x0, x0 + bar_w):
                if 0 <= x < size and 0 <= y < size:
                    set_px(x, y, color)
        # cap
        cap_h = max(18, bar_w // 4)
        for y in range(y0 - cap_h, y0 + cap_h // 2):
            for x in range(x0 - 6, x0 + bar_w + 6):
                if 0 <= x < size and 0 <= y < size:
                    set_px(x, y, (238, 241, 247, 255))

    _png(dest, size, size, bytes(buf))
    print(dest)


if __name__ == "__main__":
    main()
