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

const urlEl = document.getElementById("url");
const fileEl = document.getElementById("file");
const goBtn = document.getElementById("goBtn");
const lastBtn = document.getElementById("lastBtn");
const cancelBtn = document.getElementById("cancelBtn");
const progress = document.getElementById("progress");
const barFill = document.getElementById("barFill");
const statusEl = document.getElementById("status");
const songList = document.getElementById("songList");
const refreshLib = document.getElementById("refreshLib");

let activeTaskId = null;
let pollStop = false;

function setStatus(msg, isError) {
  statusEl.textContent = msg || "";
  statusEl.classList.toggle("error", !!isError);
}

function setProgress(frac) {
  progress.classList.add("on");
  barFill.style.width = Math.round(Math.max(0, Math.min(1, frac)) * 100) + "%";
}

function setBusy(busy) {
  goBtn.disabled = busy;
  lastBtn.disabled = busy;
  cancelBtn.hidden = !busy;
  if (!busy) activeTaskId = null;
}

function fmtWhen(ts) {
  if (!ts) return "Never opened";
  const d = new Date(ts * 1000);
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function looksLikeYoutube(s) {
  return /youtu\.?be|youtube\.com/i.test(s || "");
}

async function loadLibrary() {
  songList.innerHTML = '<div class="empty">Loading…</div>';
  try {
    const { jobs } = await fetchJSON("/api/jobs");
    if (!jobs || !jobs.length) {
      songList.innerHTML = '<div class="empty">No songs yet — open a track above.</div>';
      return;
    }
    songList.innerHTML = "";
    for (const job of jobs) {
      const href = job.hub_url || "/song/" + job.job_id;
      const row = document.createElement("a");
      row.className = "song-row";
      row.href = href;
      const bits = [];
      if (job.has_stems) bits.push(job.stem_count + " stems");
      else bits.push("opened");
      if (job.key) bits.push(job.key);
      if (job.bpm) {
        bits.push(
          job.bpm + " BPM" + (job.time_signature ? " · " + job.time_signature : "")
        );
      }
      bits.push(fmtWhen(job.last_played_at));
      row.innerHTML =
        '<div class="song-main">' +
        '  <div class="song-title"></div>' +
        '  <div class="song-meta"></div>' +
        "</div>" +
        '<button type="button" class="btn-del" title="Delete" aria-label="Delete">✕</button>';
      row.querySelector(".song-title").textContent = job.title;
      row.querySelector(".song-meta").textContent = bits.join(" · ");
      row.querySelector(".btn-del").addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm('Delete "' + job.title + '" from the library?')) return;
        try {
          await fetchJSON("/api/library/" + encodeURIComponent(job.job_id), {
            method: "DELETE",
          });
          await loadLibrary();
        } catch (err) {
          alert("Delete failed: " + err.message);
        }
      });
      songList.appendChild(row);
    }
  } catch (e) {
    songList.innerHTML =
      '<div class="empty error">Could not load library: ' + e.message + "</div>";
  }
}

async function openLatest() {
  setProgress(0.2);
  setStatus("Loading last song…");
  try {
    const meta = await fetchJSON("/api/jobs/latest");
    window.location.href = meta.hub_url || "/song/" + meta.job_id;
  } catch (e) {
    setStatus(String(e.message || e), true);
  }
}

async function cancelActive() {
  if (!activeTaskId) return;
  pollStop = true;
  cancelBtn.disabled = true;
  setStatus("Cancelling…");
  try {
    await fetchJSON("/api/tasks/" + activeTaskId + "/cancel", { method: "POST" });
  } catch (_) {
    /* ignore */
  }
  setStatus("Cancelled", true);
  setBusy(false);
  cancelBtn.disabled = false;
  setProgress(0);
}

async function pollTask(taskId) {
  pollStop = false;
  activeTaskId = taskId;
  for (;;) {
    if (pollStop) return;
    const job = await fetchJSON("/api/tasks/" + taskId);
    if (pollStop) return;
    setProgress(job.progress || 0);
    setStatus(job.message || job.status);
    if (job.status === "done" && (job.hub_url || job.job_id)) {
      setBusy(false);
      window.location.href = job.hub_url || "/song/" + job.job_id;
      return;
    }
    if (job.status === "error") {
      setStatus(job.message || "Open failed", true);
      setBusy(false);
      return;
    }
    if (job.status === "cancelled") {
      setStatus("Cancelled", true);
      setBusy(false);
      setProgress(0);
      return;
    }
    await new Promise((r) => setTimeout(r, 800));
  }
}

async function startOpen() {
  let url = (urlEl.value || "").trim();
  const file = fileEl.files && fileEl.files[0];

  // Soft-normalize common YouTube paste formats
  if (url && !/^https?:\/\//i.test(url) && looksLikeYoutube(url)) {
    url = "https://" + url.replace(/^\/+/, "");
    urlEl.value = url;
  }

  if (!url && !file) {
    setProgress(0);
    progress.classList.add("on");
    setStatus("Paste a YouTube URL or choose a local audio/video file.", true);
    return;
  }

  setBusy(true);
  setProgress(0.02);
  setStatus(url ? "Opening YouTube…" : "Opening file…");

  const body = new FormData();
  if (url) body.append("url", url);
  if (file && !url) body.append("file", file);

  try {
    const { task_id } = await fetchJSON("/api/open", { method: "POST", body });
    await pollTask(task_id);
  } catch (e) {
    setStatus(String(e.message || e), true);
    setBusy(false);
  }
}

goBtn.addEventListener("click", startOpen);
lastBtn.addEventListener("click", openLatest);
cancelBtn.addEventListener("click", cancelActive);
refreshLib.addEventListener("click", loadLibrary);
urlEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    startOpen();
  }
});
loadLibrary();
