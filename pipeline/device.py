"""Pick best available torch device: CUDA > MPS (Apple GPU) > CPU."""

from __future__ import annotations

import torch


def pick_device(prefer: str = "auto") -> str:
    prefer = (prefer or "auto").lower()
    if prefer == "cpu":
        return "cpu"
    if prefer == "cuda":
        if not torch.cuda.is_available():
            raise RuntimeError("CUDA requested but not available")
        return "cuda"
    if prefer == "mps":
        if not torch.backends.mps.is_available():
            raise RuntimeError("MPS requested but not available")
        return "mps"

    if torch.cuda.is_available():
        return "cuda"
    if torch.backends.mps.is_available():
        return "mps"
    return "cpu"


def device_label(device: str) -> str:
    if device == "cuda":
        name = torch.cuda.get_device_name(0)
        return f"CUDA GPU ({name})"
    if device == "mps":
        return "Apple GPU (MPS)"
    return "CPU"
