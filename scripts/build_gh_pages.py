#!/usr/bin/env python3
"""Build a static GitHub Pages demo under docs/ (no FastAPI).

Copies Fearless demo stems + Loopz assets, bakes player BOOT JSON, and
rewrites absolute /static paths so the site works at /practice-stems/.
"""

from __future__ import annotations

import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
STATIC = ROOT / "static"
SRC_JOB = (
    ROOT
    / "data"
    / "play"
    / "Lost_Sky_-_Fearless_pt_II_feat_Chris_Linton_Trap_NCS_-_Copyr"
)
DEMO_ID = "fearless"
STEM_ORDER = ["vocals", "drums", "bass", "guitar", "piano", "other"]

STATIC_SHIM = r"""
    // —— GitHub Pages static demo (no FastAPI) ——
    (function enableStaticDemo() {
      function blocked(what) {
        setStatus(what + " needs the full app (python app.py).");
      }
      downloadMix = async () => blocked("Download mix");
      downloadStems = async () => blocked("Download stems");
      runStems = async () => blocked("Stem separation");
      runBeats = async () => blocked("Beat detect");
      runChords = async () => blocked("Chord detect");
      prepareTransformed = async () => {
        setStatus("Key / HQ speed need the local app. Use the Speed menu for browser rate.");
        return false;
      };
      ensureKeyDetected = async () => { syncKeyUI(); };
      teardownAndGoHome = function () {
        try {
          clearTimers();
          for (const t of Object.values(tracks)) {
            t.audio.pause();
            t.audio.removeAttribute("src");
            t.audio.load();
          }
        } catch (_) {}
        window.location.replace("./index.html");
      };
      // Re-bind handlers (onclick already pointed at the original functions)
      if (downloadBtn) downloadBtn.onclick = downloadMix;
      if (downloadStemsBtn) downloadStemsBtn.onclick = downloadStems;
      if (detectChordsBtn) detectChordsBtn.onclick = runChords;
      if (rerunStemsBtn) rerunStemsBtn.onclick = () => { setMoreOpen(false); runStems(true); };
      if (rerunBeatsBtn) rerunBeatsBtn.onclick = () => { setMoreOpen(false); runBeats(); };
      if (rerunChordsBtn) rerunChordsBtn.onclick = () => { setMoreOpen(false); runChords(); };
      const homeBtnEl = document.getElementById("homeBtn");
      if (homeBtnEl) homeBtnEl.onclick = teardownAndGoHome;
      if (keyDownBtn) {
        keyDownBtn.disabled = true;
        keyDownBtn.onclick = null;
      }
      if (keyUpBtn) {
        keyUpBtn.disabled = true;
        keyUpBtn.onclick = null;
      }
      if (hqSpeedBtn) {
        hqSpeedBtn.disabled = true;
        hqSpeedBtn.onclick = null;
        hqSpeedBtn.title = "HQ stretch needs the local app";
      }
      if (downloadBtn) downloadBtn.hidden = true;
      if (downloadStemsBtn) downloadStemsBtn.hidden = true;
      if (rerunStemsBtn) rerunStemsBtn.hidden = true;
      if (rerunBeatsBtn) rerunBeatsBtn.hidden = true;
      if (rerunChordsBtn) rerunChordsBtn.hidden = true;
      if (detectChordsBtn) detectChordsBtn.hidden = true;
      if (deviceSel) {
        const lab = deviceSel.closest("label");
        if (lab) lab.hidden = true;
      }
      const takesWrap = document.getElementById("takesWrap");
      if (takesWrap) takesWrap.hidden = true;
      if (recordBtn) recordBtn.hidden = true;
      const demoNote = document.createElement("p");
      demoNote.className = "footer-note";
      demoNote.innerHTML =
        'Static demo · Track: Lost Sky - Fearless pt.II (feat. Chris Linton) [NCS] · ' +
        '<a href="https://ncs.io/usage-policy" target="_blank" rel="noopener">NCS usage policy</a> · ' +
        'Full app: run <code>python app.py</code> locally.';
      const wrap = document.querySelector(".wrap");
      if (wrap) wrap.appendChild(demoNote);
    })();
"""


def copy_stems() -> Path:
    dest = DOCS / "demo" / DEMO_ID
    dest.mkdir(parents=True, exist_ok=True)
    if not SRC_JOB.is_dir():
        raise SystemExit(f"Missing demo song folder: {SRC_JOB}")
    for name in STEM_ORDER + ["source"]:
        src = SRC_JOB / f"{name}.mp3"
        if not src.is_file():
            raise SystemExit(f"Missing stem: {src}")
        shutil.copy2(src, dest / f"{name}.mp3")
    return dest


def copy_assets() -> None:
    out = DOCS / "static"
    if out.exists():
        shutil.rmtree(out)
    out.mkdir(parents=True)
    shutil.copy2(STATIC / "app.css", out / "app.css")

    loopz_js = (STATIC / "loopz.js").read_text(encoding="utf-8")
    loopz_js = loopz_js.replace('"/static/loopz/kit/', '"static/loopz/kit/')
    (out / "loopz.js").write_text(loopz_js, encoding="utf-8")

    kit_src = STATIC / "loopz" / "kit"
    kit_dst = out / "loopz" / "kit"
    kit_dst.mkdir(parents=True)
    for mp3 in kit_src.glob("*.mp3"):
        shutil.copy2(mp3, kit_dst / mp3.name)
    attr = STATIC / "loopz" / "ATTRIBUTION.md"
    if attr.is_file():
        shutil.copy2(attr, out / "loopz" / "ATTRIBUTION.md")


def build_boot() -> dict:
    meta = json.loads((SRC_JOB / "meta.json").read_text(encoding="utf-8"))
    stems = {name: f"demo/{DEMO_ID}/{name}.mp3" for name in STEM_ORDER}
    return {
        "job_id": DEMO_ID,
        "title": meta.get("title")
        or "Lost Sky - Fearless pt.II (feat. Chris Linton) [NCS]",
        "hub_url": "./player.html",
        "player_url": "./player.html",
        "source_url": f"demo/{DEMO_ID}/source.mp3",
        "stem_count": len(stems),
        "has_stems": True,
        "bpm": meta.get("bpm"),
        "bpm_meta": meta.get("bpm_meta"),
        "time_signature": meta.get("time_signature")
        or (meta.get("bpm_meta") or {}).get("time_signature"),
        "beats_per_bar": meta.get("beats_per_bar")
        or (meta.get("bpm_meta") or {}).get("beats_per_bar")
        or 4,
        "chords_status": meta.get("chords_status") or "done",
        "chords": meta.get("chords") or [],
        "chords_source": meta.get("chords_source"),
        "chords_engine": meta.get("chords_engine"),
        "chord_count": meta.get("chord_count") or len(meta.get("chords") or []),
        "key": meta.get("key"),
        "key_meta": meta.get("key_meta"),
        "stems": stems,
        "stem_order": STEM_ORDER,
        "recordings": [],
        "static_demo": True,
    }


def write_player(boot: dict) -> None:
    html = (STATIC / "player.html").read_text(encoding="utf-8")
    html = html.replace('href="/static/app.css"', 'href="static/app.css"')
    boot_json = json.dumps(boot).replace("<", "\\u003c")
    html = html.replace("__BOOT_JSON__", boot_json)
    if "init();" not in html:
        raise SystemExit("player.html: expected init(); marker")
    html = html.replace("    init();\n", STATIC_SHIM + "\n    init();\n", 1)
    (DOCS / "player.html").write_text(html, encoding="utf-8")


def write_loopz() -> None:
    html = (STATIC / "loopz.html").read_text(encoding="utf-8")
    html = html.replace('href="/static/app.css"', 'href="static/app.css"')
    html = html.replace('href="/"', 'href="./index.html"')
    html = html.replace('src="/static/loopz.js"', 'src="static/loopz.js"')
    (DOCS / "loopz.html").write_text(html, encoding="utf-8")


def write_index() -> None:
    (DOCS / "index.html").write_text(
        """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="theme-color" content="#0b0d12" />
  <title>Practice Stems · Demo</title>
  <link rel="stylesheet" href="static/app.css" />
</head>
<body>
  <div class="wrap">
    <div class="brand">
      <h1>Practice Stems</h1>
      <span class="tag">Static demo · GitHub Pages</span>
      <a class="btn primary brand-loopz" href="loopz.html">Loopz</a>
    </div>
    <div class="hero">
      <p>Try the stem mixer and Loopz in the browser. Upload, Demucs, HQ pitch/speed, and detection need the full local app.</p>
    </div>

    <a class="loopz-home-card" href="player.html">
      <div>
        <strong>Stem mixer demo</strong>
        <p>Lost Sky — Fearless pt.II (feat. Chris Linton) · NCS. Play, mute, solo, volume, presets, chords, metronome.</p>
      </div>
      <span class="loopz-home-go">Open mixer →</span>
    </a>

    <a class="loopz-home-card" href="loopz.html" style="margin-top: 12px;">
      <div>
        <strong>Loopz</strong>
        <p>Drum loops, piano + bass jam chords, tempo &amp; metronome. Fully client-side.</p>
      </div>
      <span class="loopz-home-go">Practice →</span>
    </a>

    <div class="card" style="margin-top: 18px;">
      <div class="library-head"><h2>Run the full app</h2></div>
      <p class="section-sub" style="margin-top:0">YouTube / upload → Demucs 6-stem split, HQ Rubber Band, chord &amp; lyric detect, mix download.</p>
      <pre style="margin:0;white-space:pre-wrap;font-size:13px;opacity:.9">conda activate practice-stems
python app.py
# → http://127.0.0.1:7860</pre>
    </div>

    <p class="footer-note">
      Music: Lost Sky - Fearless pt.II (feat. Chris Linton) [NCS Release] ·
      provided by <a href="https://ncs.io" target="_blank" rel="noopener">NoCopyrightSounds</a> ·
      <a href="https://ncs.io/usage-policy" target="_blank" rel="noopener">Usage policy</a> ·
      see <a href="demo/ATTRIBUTION.md">demo/ATTRIBUTION.md</a>
    </p>
  </div>
</body>
</html>
""",
        encoding="utf-8",
    )


def write_attribution() -> None:
    (DOCS / "demo" / "ATTRIBUTION.md").write_text(
        """# Demo music attribution

## Stem mixer sample

- **Track:** Lost Sky - Fearless pt.II (feat. Chris Linton) [NCS Release]
- **Provided by:** [NoCopyrightSounds (NCS)](https://ncs.io)
- **Listen / download:** check the official NCS upload for this release
- **Usage:** Follow the [NCS Usage Policy](https://ncs.io/usage-policy). This static demo hosts stems for an open-source practice UI; NCS’s free licence is primarily for YouTube/Twitch UGC with credit — review their terms for your use case.

Suggested credit text:

```
Track: Lost Sky - Fearless pt.II (feat. Chris Linton) [NCS Release]
Music provided by NoCopyrightSounds.
Free Download / Stream: http://ncs.io
```

## Loopz kit

See `static/loopz/ATTRIBUTION.md` (Virtuosity Drums, CC0).
""",
        encoding="utf-8",
    )


def main() -> None:
    DOCS.mkdir(parents=True, exist_ok=True)
    (DOCS / ".nojekyll").write_text("", encoding="utf-8")
    copy_stems()
    copy_assets()
    boot = build_boot()
    write_player(boot)
    write_loopz()
    write_index()
    write_attribution()
    # Keep screenshot assets; remove nothing else under docs/
    print(f"Built GitHub Pages demo in {DOCS}")
    print(f"  player stems: demo/{DEMO_ID}/ ({len(STEM_ORDER)} + source)")
    print("  Enable Pages: Settings → Pages → Deploy from branch → /docs")


if __name__ == "__main__":
    main()
