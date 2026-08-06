"""Run Demucs stem separation (6-stem: drums/bass/other/vocals/guitar/piano)."""

from __future__ import annotations

import subprocess
import tempfile
from pathlib import Path

import soundfile as sf
import torch
from demucs.apply import apply_model
from demucs.pretrained import get_model

from .device import pick_device

STEM_ORDER = ["vocals", "drums", "bass", "guitar", "piano", "other"]
MODEL_NAME = "htdemucs_6s"


def _ffmpeg_wav(src: Path, dest: Path, samplerate: int, channels: int) -> Path:
    """Resample/convert with ffmpeg — avoids TorchCodec and bad hand-rolled resample."""
    dest.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(src),
            "-vn",
            "-acodec",
            "pcm_s16le",
            "-ar",
            str(samplerate),
            "-ac",
            str(channels),
            str(dest),
        ],
        check=True,
        capture_output=True,
    )
    return dest


def _load_wav(path: Path, channels: int, samplerate: int) -> torch.Tensor:
    """Load audio at exact model rate/channels. Returns (channels, samples)."""
    with tempfile.TemporaryDirectory() as tmp:
        prepared = Path(tmp) / "input.wav"
        _ffmpeg_wav(path, prepared, samplerate, channels)
        data, sr = sf.read(str(prepared), dtype="float32", always_2d=True)
    if sr != samplerate:
        raise RuntimeError(f"ffmpeg produced sr={sr}, expected {samplerate}")
    wav = torch.from_numpy(data.T.copy())
    if wav.shape[0] != channels:
        raise RuntimeError(f"expected {channels} ch, got {wav.shape[0]}")
    return wav


def _save_wav(wav: torch.Tensor, path: Path, samplerate: int) -> None:
    """Save via soundfile (no TorchCodec). Expects (channels, samples)."""
    audio = wav.detach().cpu().float().numpy()
    if audio.ndim == 1:
        audio = audio[None, :]
    # clamp lightly to avoid wrap on PCM_16
    audio = audio.clip(-1.0, 1.0)
    sf.write(str(path), audio.T, samplerate, subtype="PCM_16")


def separate_stems(
    wav_path: Path,
    out_dir: Path,
    device: str | None = None,
    shifts: int = 1,
) -> dict[str, Path]:
    """
    Separate wav into 6 stems. Returns mapping stem_name -> wav path.
    Uses MPS/CUDA when available, falls back to CPU.
    """
    device = device or pick_device("auto")
    out_dir.mkdir(parents=True, exist_ok=True)

    def _run(dev: str) -> dict[str, Path]:
        model = get_model(MODEL_NAME)
        model.eval()
        model.to(dev)

        wav = _load_wav(Path(wav_path), model.audio_channels, model.samplerate)
        ref = wav.mean(0)
        wav_n = (wav - ref.mean()) / (ref.std() + 1e-8)
        wav_n = wav_n.to(dev)

        with torch.no_grad():
            # Do NOT pass a custom segment — wrong lengths break HTDemucs reshape.
            # split=True uses the model's own segment size.
            sources = apply_model(
                model,
                wav_n[None],
                device=dev,
                shifts=shifts,
                split=True,
                overlap=0.25,
                progress=True,
            )[0]

        sources = sources * (ref.std() + 1e-8) + ref.mean()
        sources = sources.cpu()

        stem_paths: dict[str, Path] = {}
        for name, source in zip(model.sources, sources):
            path = out_dir / f"{name}.wav"
            _save_wav(source, path, model.samplerate)
            stem_paths[name] = path
        return stem_paths

    try:
        stem_paths = _run(device)
    except Exception as exc:
        if device == "cpu":
            raise
        print(f"[separate] {device} failed ({exc}); retrying on CPU")
        stem_paths = _run("cpu")

    missing = [s for s in STEM_ORDER if s not in stem_paths]
    if missing:
        raise RuntimeError(f"Model did not produce expected stems: {missing}")

    return {name: stem_paths[name] for name in STEM_ORDER}
