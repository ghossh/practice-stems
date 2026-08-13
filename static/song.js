async function fetchJSON(url, opts) {
  const res = await fetch(url, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const detail = data.detail;
    const msg = typeof detail === "string" ? detail : data.message || res.statusText;
    throw new Error(msg);
  }
  return data;
}

const BOOT = window.__SONG_BOOT__ || {};
const titleEl = document.getElementById("title");
const preview = document.getElementById("preview");
const previewNote = document.getElementById("previewNote");
const stemsStatus = document.getElementById("stemsStatus");
const stemsBtn = document.getElementById("stemsBtn");
const mixerLink = document.getElementById("mixerLink");
const stemsProgress = document.getElementById("stemsProgress");
const stemsBar = document.getElementById("stemsBar");
const stemsMsg = document.getElementById("stemsMsg");
const bpmStatus = document.getElementById("bpmStatus");
const bpmBtn = document.getElementById("bpmBtn");
const chordsStatus = document.getElementById("chordsStatus");
const chordsBtn = document.getElementById("chordsBtn");
const chordPlayer = document.getElementById("chordPlayer");
const chordPlayerSub = document.getElementById("chordPlayerSub");
const chordTimeline = document.getElementById("chordTimeline");
const chordSlideView = document.getElementById("chordSlideView");
const chordSheetView = document.getElementById("chordSheetView");
const chordSheetScroll = document.getElementById("chordSheetScroll");
const chordPrev = document.getElementById("chordPrev");
const chordNow = document.getElementById("chordNow");
const chordNext = document.getElementById("chordNext");
const chordNext2 = document.getElementById("chordNext2");
const chordNowMeta = document.getElementById("chordNowMeta");
const viewSlide = document.getElementById("viewSlide");
const viewSheet = document.getElementById("viewSheet");
const deviceEl = document.getElementById("device");

let pollStop = false;
let chordList = [];
let activeChordIdx = -1;
let chordViewMode = "slide"; // slide | sheet
let syncRaf = 0;

function fmtTime(sec) {
  if (!isFinite(sec) || sec < 0) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return m + ":" + String(s).padStart(2, "0");
}

function indexAtTime(t) {
  if (!chordList.length) return -1;
  for (let i = 0; i < chordList.length; i++) {
    const c = chordList[i];
    const start = c.start || 0;
    const end = c.end != null ? c.end : start;
    if (t >= start && t < end) return i;
  }
  if (t < (chordList[0].start || 0)) return 0;
  return chordList.length - 1;
}

function seekToChord(i) {
  if (i < 0 || i >= chordList.length || !preview) return;
  const start = chordList[i].start || 0;
  preview.currentTime = start;
  preview.play().catch(() => {});
  setActiveChord(i, true);
}

function setActiveChord(i, forceScroll) {
  if (i === activeChordIdx && !forceScroll) {
    // still refresh slide labels if needed
  }
  activeChordIdx = i;
  const c = i >= 0 ? chordList[i] : null;
  const prev = i > 0 ? chordList[i - 1] : null;
  const next = i >= 0 && i + 1 < chordList.length ? chordList[i + 1] : null;
  const next2 = i >= 0 && i + 2 < chordList.length ? chordList[i + 2] : null;

  chordPrev.textContent = prev ? prev.label : "·";
  chordPrev.disabled = !prev;
  chordNow.textContent = c ? c.label : "—";
  chordNext.textContent = next ? next.label : "·";
  chordNext.disabled = !next;
  chordNext2.textContent = next2 ? next2.label : "·";
  chordNext2.disabled = !next2;

  if (c) {
    chordNowMeta.textContent =
      fmtTime(c.start) + " – " + fmtTime(c.end) + " · chord " + (i + 1) + " / " + chordList.length;
  } else {
    chordNowMeta.textContent = "Hit play";
  }

  // Timeline highlight
  chordTimeline.querySelectorAll(".chord-seg").forEach((el, idx) => {
    el.classList.toggle("active", idx === i);
  });

  // Sheet highlight + center
  const chips = chordSheetScroll.querySelectorAll(".chord-chip");
  chips.forEach((el, idx) => {
    const on = idx === i;
    el.classList.toggle("active", on);
    if (on && (forceScroll || chordViewMode === "sheet")) {
      el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  });
}

function syncChordsFromAudio(loop) {
  if (!chordList.length || !preview) return;
  const t = preview.currentTime || 0;
  const i = indexAtTime(t);
  if (i !== activeChordIdx) setActiveChord(i, false);
  else if (chordViewMode === "sheet") {
    const c = chordList[i];
    if (c) {
      chordNowMeta.textContent =
        fmtTime(c.start) + " – " + fmtTime(c.end) + " · chord " + (i + 1) + " / " + chordList.length;
    }
  }
  if (loop !== false && !preview.paused) {
    syncRaf = requestAnimationFrame(() => syncChordsFromAudio(true));
  }
}

function startChordSync() {
  cancelAnimationFrame(syncRaf);
  syncRaf = requestAnimationFrame(() => syncChordsFromAudio(true));
}

function stopChordSync() {
  cancelAnimationFrame(syncRaf);
  syncRaf = 0;
}

function setChordView(mode) {
  chordViewMode = mode;
  viewSlide.classList.toggle("on", mode === "slide");
  viewSheet.classList.toggle("on", mode === "sheet");
  chordSlideView.hidden = mode !== "slide";
  chordSheetView.hidden = mode !== "sheet";
  if (activeChordIdx >= 0) setActiveChord(activeChordIdx, true);
}

function renderChords(chords, meta) {
  chordList = chords || [];
  activeChordIdx = -1;

  if (!chordList.length) {
    chordPlayer.hidden = true;
    chordTimeline.innerHTML = "";
    chordSheetScroll.innerHTML = "";
    return;
  }

  chordPlayer.hidden = false;
  const src = meta && meta.chords_source ? meta.chords_source : "";
  chordPlayerSub.textContent =
    chordList.length +
    " chords" +
    (src ? " · " + src : "") +
    " — play audio; sliding view follows the song";

  const duration = Math.max(...chordList.map((c) => c.end || 0), 1);
  chordTimeline.innerHTML = "";
  chordList.forEach((c, i) => {
    const start = c.start || 0;
    const end = c.end || start;
    const left = (start / duration) * 100;
    const width = Math.max(((end - start) / duration) * 100, 0.35);
    const seg = document.createElement("button");
    seg.type = "button";
    seg.className = "chord-seg" + (i % 2 ? " alt" : "");
    seg.style.left = left + "%";
    seg.style.width = width + "%";
    seg.textContent = c.label || "?";
    seg.title = (c.label || "") + " · " + fmtTime(start) + "–" + fmtTime(end);
    seg.onclick = () => seekToChord(i);
    chordTimeline.appendChild(seg);
  });

  chordSheetScroll.innerHTML = "";
  chordList.forEach((c, i) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chord-chip";
    chip.innerHTML =
      '<span class="chord-chip-lab">' +
      (c.label || "?") +
      '</span><span class="chord-chip-t">' +
      fmtTime(c.start) +
      "</span>";
    chip.onclick = () => seekToChord(i);
    chordSheetScroll.appendChild(chip);
  });

  setChordView(chordViewMode);
  setActiveChord(indexAtTime(preview.currentTime || 0), true);
  chordPlayer.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function applySong(s) {
  titleEl.textContent = s.title || "Song";
  document.title = (s.title || "Song") + " · Practice Stems";

  if (s.source_url) {
    preview.src = s.source_url;
    previewNote.textContent = "Full track preview — chords follow when detected";
  } else {
    preview.removeAttribute("src");
    previewNote.textContent = "No source preview — run stems or re-open the song.";
  }

  if (s.has_stems && s.player_url) {
    stemsStatus.textContent = "Ready — " + (s.stem_count || 6) + " stems";
    stemsBtn.textContent = "Re-run stems";
    mixerLink.hidden = false;
    mixerLink.href = s.player_url;
  } else {
    stemsStatus.textContent = "Not run yet";
    stemsBtn.textContent = "Run stems";
    mixerLink.hidden = true;
  }

  if (s.bpm) {
    const beats = s.bpm_meta && s.bpm_meta.beat_count ? " · " + s.bpm_meta.beat_count + " beats" : "";
    bpmStatus.textContent = s.bpm + " BPM" + beats;
  } else {
    bpmStatus.textContent = "Not run yet";
  }

  if (s.chords_status === "done" && s.chords && s.chords.length) {
    chordsStatus.textContent =
      s.chord_count +
      " chords" +
      (s.chords_source ? " · " + s.chords_source : "") +
      (s.chords_engine ? " · " + s.chords_engine : "");
    renderChords(s.chords, s);
  } else {
    chordsStatus.textContent = "Not run yet";
    renderChords([], s);
  }
}

async function refreshSong() {
  const s = await fetchJSON("/api/songs/" + encodeURIComponent(BOOT.job_id));
  Object.assign(BOOT, s);
  applySong(BOOT);
}

async function pollTask(taskId) {
  pollStop = false;
  stemsProgress.classList.add("on");
  for (;;) {
    if (pollStop) return;
    const job = await fetchJSON("/api/tasks/" + taskId);
    stemsBar.style.width = Math.round((job.progress || 0) * 100) + "%";
    stemsMsg.textContent = job.message || job.status;
    if (job.status === "done") {
      stemsBtn.disabled = false;
      await refreshSong();
      stemsMsg.textContent = "Stems ready";
      return;
    }
    if (job.status === "error" || job.status === "cancelled") {
      stemsBtn.disabled = false;
      stemsMsg.textContent = job.message || job.status;
      stemsMsg.classList.add("error");
      return;
    }
    await new Promise((r) => setTimeout(r, 800));
  }
}

async function runStems() {
  stemsBtn.disabled = true;
  stemsMsg.classList.remove("error");
  stemsMsg.textContent = "Starting…";
  stemsBar.style.width = "2%";
  stemsProgress.classList.add("on");
  try {
    const body = new FormData();
    body.append("device", deviceEl.value);
    const { task_id } = await fetchJSON(
      "/api/jobs/" + encodeURIComponent(BOOT.job_id) + "/separate",
      { method: "POST", body }
    );
    await pollTask(task_id);
  } catch (e) {
    stemsBtn.disabled = false;
    stemsMsg.textContent = String(e.message || e);
    stemsMsg.classList.add("error");
  }
}

async function runBpm() {
  bpmBtn.disabled = true;
  bpmStatus.textContent = "Detecting…";
  try {
    const r = await fetchJSON("/api/jobs/" + encodeURIComponent(BOOT.job_id) + "/bpm", {
      method: "POST",
    });
    bpmStatus.textContent = r.bpm + " BPM · " + (r.beat_count || 0) + " beats";
    BOOT.bpm = r.bpm;
    BOOT.bpm_meta = r;
  } catch (e) {
    bpmStatus.textContent = "Failed: " + (e.message || e);
  } finally {
    bpmBtn.disabled = false;
  }
}

async function runChords() {
  chordsBtn.disabled = true;
  chordsStatus.textContent = "Detecting (madmom DeepChroma)…";
  try {
    const r = await fetchJSON("/api/jobs/" + encodeURIComponent(BOOT.job_id) + "/chords", {
      method: "POST",
    });
    BOOT.chords = r.chords;
    BOOT.chord_count = r.chord_count;
    BOOT.chords_status = "done";
    BOOT.chords_source = r.source;
    BOOT.chords_engine = r.engine;
    chordsStatus.textContent =
      r.chord_count +
      " chords · " +
      (r.source || "") +
      " · " +
      (r.engine || "madmom");
    renderChords(r.chords, BOOT);
    // Auto-start playback so chords move with audio
    if (preview && preview.src) {
      try {
        await preview.play();
      } catch (_) {
        /* user gesture may be required on some browsers — Detect click counts */
      }
      startChordSync();
    }
  } catch (e) {
    chordsStatus.textContent = "Failed: " + (e.message || e);
  } finally {
    chordsBtn.disabled = false;
  }
}

document.getElementById("homeBtn").onclick = () => {
  window.location.replace("/");
};
stemsBtn.onclick = runStems;
bpmBtn.onclick = runBpm;
chordsBtn.onclick = runChords;
viewSlide.onclick = () => setChordView("slide");
viewSheet.onclick = () => setChordView("sheet");
chordPrev.onclick = () => {
  if (activeChordIdx > 0) seekToChord(activeChordIdx - 1);
};
chordNext.onclick = () => {
  if (activeChordIdx >= 0 && activeChordIdx + 1 < chordList.length) seekToChord(activeChordIdx + 1);
};
chordNext2.onclick = () => {
  if (activeChordIdx >= 0 && activeChordIdx + 2 < chordList.length) seekToChord(activeChordIdx + 2);
};

preview.addEventListener("play", startChordSync);
preview.addEventListener("playing", startChordSync);
preview.addEventListener("pause", () => {
  stopChordSync();
  syncChordsFromAudio(false);
});
preview.addEventListener("seeked", () => {
  syncChordsFromAudio(false);
});
preview.addEventListener("timeupdate", () => {
  if (!syncRaf && !preview.paused) startChordSync();
  else if (preview.paused) syncChordsFromAudio(false);
});

applySong(BOOT);
if (BOOT.chords && BOOT.chords.length) startChordSync();
