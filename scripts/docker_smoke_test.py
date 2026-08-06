from pathlib import Path
import shutil
import subprocess

from pipeline.download import download_audio
from pipeline.separate import separate_stems

url = "https://youtu.be/3LGOL7CMTpg"
base = Path("/app/data/_docker_test")
base.mkdir(parents=True, exist_ok=True)
print("downloading…", flush=True)
wav, title = download_audio(url, base)
print("title:", title, flush=True)
clip = base / "clip30.wav"
subprocess.run(
    ["ffmpeg", "-y", "-i", str(wav), "-t", "30", "-acodec", "pcm_s16le", str(clip)],
    check=True,
    capture_output=True,
)
stems = base / "stems30"
if stems.exists():
    shutil.rmtree(stems)
print("separating 30s on CPU inside container…", flush=True)
paths = separate_stems(clip, stems, device="cpu")
for k, p in paths.items():
    print(" OK", k, p.stat().st_size, flush=True)
print("DOCKER_TEST_SUCCESS", flush=True)
