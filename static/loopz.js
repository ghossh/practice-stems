(() => {
  const VOICES = [
    { id: "kick", name: "Kick" },
    { id: "snare", name: "Snare" },
    { id: "hat", name: "Hats" },
    { id: "open", name: "Open hat" },
    { id: "clap", name: "Rim" },
    { id: "ride", name: "Ride" },
    { id: "tom", name: "Tom" },
  ];

  const empty = "----------------";

  const LOOPS = [
    {
      id: "rock",
      name: "Rock Straight",
      genre: "Rock",
      bpm: 110,
      drums: {
        kick: "x-----x-x-------",
        snare: "----x-------x---",
        hat: "x-x-x-x-x-x-x-x-",
        open: "--------------x-",
      },
    },
    {
      id: "halftime",
      name: "Half-time",
      genre: "Rock",
      bpm: 70,
      drums: {
        kick: "x---------------",
        snare: "--------x-------",
        hat: "x-x-x-x-x-x-x-x-",
        open: "------x-------x-",
      },
    },
    {
      id: "punk",
      name: "Punk 8ths",
      genre: "Rock",
      bpm: 180,
      drums: {
        kick: "x-------x-------",
        snare: "----x-------x---",
        hat: "xxxxxxxxxxxxxxxx",
      },
    },
    {
      id: "metal",
      name: "Metal Drive",
      genre: "Rock",
      bpm: 160,
      drums: {
        kick: "x-x---x-x-x---x-",
        snare: "----x-------x---",
        hat: "xxxxxxxxxxxxxxxx",
        open: "------x-------x-",
      },
    },
    {
      id: "pop",
      name: "Pop Pulse",
      genre: "Pop",
      bpm: 100,
      drums: {
        kick: "x-----x---x-----",
        snare: "----x-------x---",
        hat: "x-x-x-x-x-x-x-x-",
        clap: "----x-------x---",
        open: "----------x-----",
      },
    },
    {
      id: "disco",
      name: "Four on the Floor",
      genre: "Pop",
      bpm: 120,
      drums: {
        kick: "x---x---x---x---",
        snare: "----x-------x---",
        hat: "x-x-x-x-x-x-x-x-",
        open: "--x---x---x---x-",
        clap: "----x-------x---",
      },
    },
    {
      id: "motown",
      name: "Motown",
      genre: "Pop",
      bpm: 108,
      drums: {
        kick: "x-----x-x-------",
        snare: "----x-------x---",
        hat: "x-x-x-x-x-x-x-x-",
        tom: "------------x-x-",
      },
    },
    {
      id: "funk",
      name: "Funk Ghost",
      genre: "Funk",
      bpm: 96,
      drums: {
        kick: "x--x--x-----x---",
        snare: "----x--o-o--x---",
        hat: "x-x-x-x-x-x-x-x-",
        open: "------x-------x-",
      },
    },
    {
      id: "rnb",
      name: "R&B Bounce",
      genre: "Funk",
      bpm: 92,
      drums: {
        kick: "x--x----x--x----",
        snare: "----x-------x---",
        hat: "x-xxx-x-x-xxx-x-",
        open: "------x-------x-",
        clap: "----x-------x---",
      },
    },
    {
      id: "boombap",
      name: "Boom Bap",
      genre: "Hip-Hop",
      bpm: 88,
      drums: {
        kick: "x------x--x-----",
        snare: "----x-------x---",
        hat: "x---x---x---x---",
        open: "----------x-----",
      },
    },
    {
      id: "trap",
      name: "Trap Hats",
      genre: "Hip-Hop",
      bpm: 140,
      drums: {
        kick: "x-------x--x----",
        snare: "--------x-------",
        hat: "x-xxx-x-x-xxx-x-",
        open: "------x-------x-",
        clap: "--------x-------",
      },
    },
    {
      id: "slowjam",
      name: "Slow Jam",
      genre: "Hip-Hop",
      bpm: 72,
      drums: {
        kick: "x--x------------",
        snare: "--------x-------",
        hat: "x-x-x-x-x-x-x-x-",
        open: "--------------x-",
        clap: "--------x-------",
      },
    },
    {
      id: "bossa",
      name: "Bossa Nova",
      genre: "Latin",
      bpm: 128,
      drums: {
        kick: "x---x--x--x-x---",
        snare: "--x--x--x---x---",
        hat: "x-x-x-x-x-x-x-x-",
        ride: "x---x---x---x---",
      },
    },
    {
      id: "afro",
      name: "Afrobeat",
      genre: "Latin",
      bpm: 108,
      drums: {
        kick: "x-----x-x-------",
        snare: "----x--x----x---",
        hat: "x-xxx-x-x-xxx-x-",
        tom: "--x-------x-----",
        open: "------x-------x-",
      },
    },
    {
      id: "reggae",
      name: "Reggae One-drop",
      genre: "Latin",
      bpm: 76,
      drums: {
        kick: "--------x-------",
        snare: "--------x-------",
        hat: "x-x-x-x-x-x-x-x-",
        open: "--x---x---x---x-",
      },
    },
    {
      id: "shuffle",
      name: "Blues Shuffle",
      genre: "Jazz",
      bpm: 84,
      swing: 0.58,
      drums: {
        kick: "x-------x-------",
        snare: "----x-------x---",
        hat: "x---x---x---x---",
        ride: "x---x-x-x---x-x-",
      },
    },
    {
      id: "swing",
      name: "Jazz Swing",
      genre: "Jazz",
      bpm: 140,
      swing: 0.66,
      drums: {
        kick: "x-----------x---",
        snare: "----x-------x---",
        hat: "----x-------x---",
        ride: "x---x-x-x---x-x-",
      },
    },
    {
      id: "ballad",
      name: "Ballad",
      genre: "Slow",
      bpm: 66,
      drums: {
        kick: "x---------------",
        snare: "--------x-------",
        hat: "x---x---x---x---",
        ride: "x-------x-------",
      },
    },
    {
      id: "train",
      name: "Train Beat",
      genre: "Rock",
      bpm: 130,
      drums: {
        kick: "x---x---x---x---",
        snare: "x-x-x-x-x-x-x-x-",
        hat: "x---x---x---x---",
      },
    },
    {
      id: "click",
      name: "Click only",
      genre: "Metro",
      bpm: 100,
      drums: {},
    },
    {
      id: "patch-rock",
      name: "Rock + fill",
      genre: "Patch",
      bpm: 110,
      bars: [
        {
          kick: "x-----x-x-------",
          snare: "----x-------x---",
          hat: "x-x-x-x-x-x-x-x-",
          open: "--------------x-",
        },
        {
          kick: "x-----x-x-------",
          snare: "----x-------x---",
          hat: "x-x-x-x-x-x-x-x-",
          open: "--------------x-",
        },
        {
          kick: "x-----x-x---x---",
          snare: "----x-------x---",
          hat: "xxxxxxxxxxxxxxxx",
          open: "------x-------x-",
        },
        {
          kick: "x-------x---x---",
          snare: "----x---xxxxxxxx",
          hat: "x-x-x-x---------",
          tom: "--------x-x-x-x-",
        },
      ],
    },
    {
      id: "patch-drop",
      name: "Full to half",
      genre: "Patch",
      bpm: 100,
      bars: [
        {
          kick: "x-----x-x-------",
          snare: "----x-------x---",
          hat: "x-x-x-x-x-x-x-x-",
        },
        {
          kick: "x-------x---x---",
          snare: "----x-------x---",
          hat: "xxxxxxxxxxxxxxxx",
          open: "------x---------",
        },
        {
          kick: "x---------------",
          snare: "--------x-------",
          hat: "x-x-x-x-x-x-x-x-",
          open: "------x-------x-",
        },
        {
          kick: "x-------x-------",
          snare: "--------x-------",
          hat: "x---x---x---x---",
          ride: "--------x-------",
        },
      ],
    },
    {
      id: "patch-pop",
      name: "Pop lift",
      genre: "Patch",
      bpm: 108,
      bars: [
        {
          kick: "x-----x---x-----",
          snare: "----x-------x---",
          hat: "x-x-x-x-x-x-x-x-",
          clap: "----x-------x---",
        },
        {
          kick: "x-----x---x-----",
          snare: "----x-------x---",
          hat: "x-x-x-x-x-x-x-x-",
          open: "----------x-----",
        },
        {
          kick: "x---x---x---x---",
          snare: "----x-------x---",
          hat: "x-x-x-x-x-x-x-x-",
          open: "--x---x---x---x-",
          clap: "----x-------x---",
        },
        {
          kick: "x---x---x-x-x---",
          snare: "----x-------x---",
          hat: "xxxxxxxxxxxxxxxx",
          open: "------x-------x-",
          clap: "----x-------x---",
        },
      ],
    },
    {
      id: "patch-funk",
      name: "Funk push",
      genre: "Patch",
      bpm: 96,
      bars: [
        {
          kick: "x--x--x-----x---",
          snare: "----x--o-o--x---",
          hat: "x-x-x-x-x-x-x-x-",
          open: "------x-------x-",
        },
        {
          kick: "x--x-----x--x---",
          snare: "----x--o----x--o",
          hat: "x-xxx-x-x-xxx-x-",
          open: "------x-------x-",
        },
        {
          kick: "x--x--x-----x---",
          snare: "----x--o-o--x---",
          hat: "x-x-x-x-x-x-x-x-",
          clap: "----x-------x---",
        },
        {
          kick: "x-----x---x-x---",
          snare: "----x---xxxx----",
          hat: "x-x-x-x---------",
          tom: "----------x-x-x-",
          open: "------x---------",
        },
      ],
    },
  ];

  const GENRES = ["All", ...Array.from(new Set(LOOPS.map((l) => l.genre)))];

  const JAM_PRESETS = [
    { id: "vif", name: "Am F C G", chords: ["Am", "F", "C", "G"] },
    { id: "axis", name: "C G Am F", chords: ["C", "G", "Am", "F"] },
    { id: "folk", name: "Em G D C", chords: ["Em", "G", "D", "C"] },
    { id: "ivv", name: "I–IV–V", chords: ["G", "G", "C", "D"] },
    { id: "andalusian", name: "Am G F E", chords: ["Am", "G", "F", "E"] },
    { id: "dorian", name: "Am G jam", chords: ["Am", "G", "Am", "G"] },
    { id: "blues", name: "A blues", chords: ["A7", "A7", "A7", "A7", "D7", "D7", "A7", "A7", "E7", "D7", "A7", "E7"] },
    { id: "iivI", name: "ii–V–I", chords: ["Dm7", "G7", "Cmaj7", "Cmaj7"] },
    { id: "minor", name: "Am Dm E7", chords: ["Am", "Dm", "E7", "Am"] },
    { id: "sweet", name: "F C Dm Bb", chords: ["F", "C", "Dm", "Bb"] },
  ];

  const PC_NAMES = ["C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
  const ROOT_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

  const KIT_URLS = {
    kick_s: "/static/loopz/kit/kick_s.mp3",
    kick_h: "/static/loopz/kit/kick_h.mp3",
    kick_h2: "/static/loopz/kit/kick_h2.mp3",
    snare_g: "/static/loopz/kit/snare_g.mp3",
    snare_m: "/static/loopz/kit/snare_m.mp3",
    snare_h: "/static/loopz/kit/snare_h.mp3",
    rim: "/static/loopz/kit/rim.mp3",
    hat_s: "/static/loopz/kit/hat_s.mp3",
    hat_h: "/static/loopz/kit/hat_h.mp3",
    hat_h2: "/static/loopz/kit/hat_h2.mp3",
    open: "/static/loopz/kit/open.mp3",
    ride: "/static/loopz/kit/ride.mp3",
    tom: "/static/loopz/kit/tom.mp3",
  };

  const playBtn = document.getElementById("playBtn");
  const tapBtn = document.getElementById("tapBtn");
  const metroBtn = document.getElementById("metroBtn");
  const tempoEl = document.getElementById("tempo");
  const bpmNum = document.getElementById("bpmNum");
  const bpmLab = document.getElementById("bpmLab");
  const loopVolEl = document.getElementById("loopVol");
  const loopVolVal = document.getElementById("loopVolVal");
  const metroVolEl = document.getElementById("metroVol");
  const metroVolVal = document.getElementById("metroVolVal");
  const countInEl = document.getElementById("countIn");
  const keepTempoEl = document.getElementById("keepTempo");
  const meterSel = document.getElementById("meterSel");
  const beatStrip = document.getElementById("beatStrip");
  const loopGrid = document.getElementById("loopGrid");
  const filtersEl = document.getElementById("filters");
  const drumMixEl = document.getElementById("drumMix");
  const nowName = document.getElementById("nowName");
  const nowMeta = document.getElementById("nowMeta");
  const bpmUp = document.getElementById("bpmUp");
  const bpmDown = document.getElementById("bpmDown");
  const jamOnEl = document.getElementById("jamOn");
  const jamNow = document.getElementById("jamNow");
  const jamNowMeta = document.getElementById("jamNowMeta");
  const jamNext = document.getElementById("jamNext");
  const jamProgEl = document.getElementById("jamProg");
  const jamApply = document.getElementById("jamApply");
  const jamPresetsEl = document.getElementById("jamPresets");
  const jamChips = document.getElementById("jamChips");
  const jamDown = document.getElementById("jamDown");
  const jamUp = document.getElementById("jamUp");
  const jamKeyVal = document.getElementById("jamKeyVal");
  const pianoVolEl = document.getElementById("pianoVol");
  const pianoVolVal = document.getElementById("pianoVolVal");
  const bassVolEl = document.getElementById("bassVol");
  const bassVolVal = document.getElementById("bassVolVal");
  const guitarVolEl = document.getElementById("guitarVol");
  const guitarVolVal = document.getElementById("guitarVolVal");
  const shapeSeg = document.getElementById("shapeSeg");
  const shapeEverySel = document.getElementById("shapeEverySel");
  const shapeHint = document.getElementById("shapeHint");
  const recordBtn = document.getElementById("recordBtn");
  const recordVideoBtn = document.getElementById("recordVideoBtn");
  const camPreview = document.getElementById("camPreview");
  const camVideo = document.getElementById("camVideo");
  const micSel = document.getElementById("micSel");
  const recTimer = document.getElementById("recTimer");
  const recNote = document.getElementById("recNote");
  const takeAudio = document.getElementById("takeAudio");
  const takeVideo = document.getElementById("takeVideo");

  let ctx = null;
  let masterGain = null;
  let metroGain = null;
  let roomGain = null;
  let mixBus = null;
  let pianoGain = null;
  let bassGain = null;
  let guitarGain = null;
  let voiceGain = {};
  let buffers = {};
  let kitReady = false;
  let kitLoading = null;
  let rr = { kick: 0, hat: 0 };
  let openHatGain = null;
  let playing = false;
  let timerId = null;
  let clockNode = null;
  let wakeLock = null;
  let nextStepTime = 0;
  let currentStep = 0;
  let countInLeft = 0;
  let displayStep = -1;
  let uiQueue = [];
  let genreFilter = "All";
  let loopId = "rock";
  let bpm = 110;
  let loopVol = 0.85;
  let metroVol = 0.7;
  let metroOn = false;
  let beatsPerBar = 4;
  let jamOn = true;
  let jamPresetId = "vif";
  let jamChords = ["Am", "F", "C", "G"];
  let jamTranspose = 0;
  let currentBar = 0;
  let displayBar = 0;
  let drumBar = 0;
  let pianoVol = 0.7;
  let bassVol = 0.8;
  let guitarVol = 0.55;
  let shape = "steady";
  let shapeEvery = 4;
  let playedBeats = 0;
  let selectedMicId = "";
  let recording = false;
  let recordKind = "audio";
  let camStream = null;
  let recordBusy = false;
  let mediaRecorder = null;
  let recChunks = [];
  let micStream = null;
  let micSource = null;
  let micGain = null;
  let recDest = null;
  let recTimerId = null;
  let recStartedAt = 0;
  let takeUrl = "";
  let muted = {};
  let voiceVol = {};
  VOICES.forEach((v) => {
    muted[v.id] = false;
    voiceVol[v.id] = 1;
  });
  const tapTimes = [];

  function currentLoop() {
    return LOOPS.find((l) => l.id === loopId) || LOOPS[0];
  }

  function drumsForBar(loop, bar) {
    if (loop.bars && loop.bars.length) {
      const i = ((bar % loop.bars.length) + loop.bars.length) % loop.bars.length;
      return loop.bars[i] || {};
    }
    return loop.drums || {};
  }

  function rampTempo(step) {
    if (step % 4 !== 0) return;
    if (playedBeats > 0 && shape !== "steady" && playedBeats % Math.max(1, shapeEvery) === 0) {
      bpm = Math.max(40, Math.min(220, bpm + (shape === "build" ? 1 : -1)));
    }
    playedBeats += 1;
  }

  function velAt(pattern, step) {
    const ch = (pattern || empty)[step] || "-";
    if (ch === "x" || ch === "X") return 1;
    if (ch === "o") return 0.42;
    return 0;
  }

  function ensureCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      masterGain = ctx.createGain();
      metroGain = ctx.createGain();
      roomGain = ctx.createGain();
      masterGain.gain.value = loopVol;
      metroGain.gain.value = metroVol;
      roomGain.gain.value = 0.22;
      const delay = ctx.createDelay(0.4);
      delay.delayTime.value = 0.068;
      const fb = ctx.createGain();
      fb.gain.value = 0.22;
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 3200;
      mixBus = ctx.createGain();
      mixBus.connect(ctx.destination);
      masterGain.connect(mixBus);
      masterGain.connect(delay);
      delay.connect(lp);
      lp.connect(fb);
      fb.connect(delay);
      lp.connect(roomGain);
      roomGain.connect(mixBus);
      metroGain.connect(ctx.destination);
      pianoGain = ctx.createGain();
      bassGain = ctx.createGain();
      guitarGain = ctx.createGain();
      pianoGain.gain.value = pianoVol;
      bassGain.gain.value = bassVol;
      guitarGain.gain.value = guitarVol;
      pianoGain.connect(mixBus);
      bassGain.connect(mixBus);
      guitarGain.connect(mixBus);
      VOICES.forEach((v) => {
        const g = ctx.createGain();
        g.gain.value = muted[v.id] ? 0 : voiceVol[v.id];
        g.connect(masterGain);
        voiceGain[v.id] = g;
      });
    }
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    ensureClock();
    return ctx;
  }

  function ensureClock() {
    if (clockNode || !ctx) return;
    const proc = ctx.createScriptProcessor(2048, 1, 1);
    const osc = ctx.createOscillator();
    const keep = ctx.createGain();
    osc.frequency.value = 440;
    keep.gain.value = 0.00001;
    proc.onaudioprocess = () => {
      try {
        pumpScheduler();
      } catch (_) {}
    };
    osc.connect(proc);
    proc.connect(keep);
    keep.connect(ctx.destination);
    osc.start();
    clockNode = proc;
  }

  async function holdWake() {
    if (!navigator.wakeLock || wakeLock) return;
    try {
      wakeLock = await navigator.wakeLock.request("screen");
      wakeLock.addEventListener("release", () => {
        wakeLock = null;
      });
    } catch (_) {}
  }

  function dropWake() {
    const lock = wakeLock;
    wakeLock = null;
    if (lock) lock.release().catch(() => {});
  }

  function syncSession() {
    if (playing || recording) holdWake();
    else dropWake();
    if (!navigator.mediaSession) return;
    navigator.mediaSession.playbackState = playing ? "playing" : "paused";
    if (typeof MediaMetadata === "function") {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentLoop().name,
          artist: "Loopz",
        });
      } catch (_) {}
    }
  }

  async function loadKit() {
    if (kitReady) return true;
    if (kitLoading) return kitLoading;
    if (!ensureCtx()) return false;
    kitLoading = (async () => {
      playBtn.disabled = true;
      setPlayUi(false);
      playBtn.title = "Loading kit…";
      const entries = Object.entries(KIT_URLS);
      await Promise.all(
        entries.map(async ([key, url]) => {
          const res = await fetch(url);
          if (!res.ok) throw new Error("Missing " + key);
          const arr = await res.arrayBuffer();
          buffers[key] = await ctx.decodeAudioData(arr.slice(0));
        })
      );
      kitReady = true;
      playBtn.disabled = false;
      setPlayUi(playing);
      return true;
    })();
    try {
      return await kitLoading;
    } catch (err) {
      kitLoading = null;
      playBtn.disabled = false;
      setPlayUi(false);
      alert("Could not load acoustic kit: " + err.message);
      return false;
    }
  }

  function applyGains() {
    if (!ctx) return;
    masterGain.gain.setTargetAtTime(loopVol, ctx.currentTime, 0.02);
    metroGain.gain.setTargetAtTime(metroVol, ctx.currentTime, 0.02);
    if (pianoGain) pianoGain.gain.setTargetAtTime(pianoVol, ctx.currentTime, 0.02);
    if (bassGain) bassGain.gain.setTargetAtTime(bassVol, ctx.currentTime, 0.02);
    if (guitarGain) guitarGain.gain.setTargetAtTime(guitarVol, ctx.currentTime, 0.02);
    VOICES.forEach((v) => {
      const val = muted[v.id] ? 0 : voiceVol[v.id];
      voiceGain[v.id].gain.setTargetAtTime(val, ctx.currentTime, 0.02);
    });
  }

  function dest(id) {
    return voiceGain[id];
  }

  function humanTime(t) {
    return t + (Math.random() - 0.45) * 0.014;
  }

  function humanVel(v) {
    return Math.max(0.08, v * (0.86 + Math.random() * 0.14));
  }

  function playSample(key, destNode, t, vel, gainMul) {
    const buf = buffers[key];
    if (!buf || !destNode) return null;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const g = ctx.createGain();
    const peak = Math.max(0.0001, vel * (gainMul == null ? 1 : gainMul));
    g.gain.setValueAtTime(peak, t);
    src.connect(g);
    g.connect(destNode);
    src.start(t);
    return g;
  }

  function chokeOpenHat(t) {
    if (!openHatGain) return;
    try {
      openHatGain.gain.cancelScheduledValues(t);
      openHatGain.gain.setValueAtTime(Math.max(0.0001, openHatGain.gain.value), t);
      openHatGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
    } catch (_) {}
    openHatGain = null;
  }

  function playKick(t, vel) {
    const key = vel < 0.62 ? "kick_s" : rr.kick++ % 2 === 0 ? "kick_h" : "kick_h2";
    playSample(key, dest("kick"), t, vel, 1.05);
  }

  function playSnare(t, vel) {
    const key = vel < 0.48 ? "snare_g" : vel < 0.82 ? "snare_m" : "snare_h";
    playSample(key, dest("snare"), t, vel, vel < 0.48 ? 0.7 : 1);
  }

  function playHat(t, vel, open) {
    if (open) {
      openHatGain = playSample("open", dest("open"), t, vel, 0.85);
      return;
    }
    chokeOpenHat(t);
    const key = vel < 0.55 ? "hat_s" : rr.hat++ % 2 === 0 ? "hat_h" : "hat_h2";
    playSample(key, dest("hat"), t, vel, 0.72);
  }

  function playClap(t, vel) {
    playSample("rim", dest("clap"), t, vel, 0.9);
  }

  function playRide(t, vel) {
    playSample("ride", dest("ride"), t, vel, 0.55);
  }

  function playTom(t, vel) {
    playSample("tom", dest("tom"), t, vel, 0.95);
  }

  function playClick(t, downbeat) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = downbeat ? 1400 : 980;
    g.gain.setValueAtTime(downbeat ? 0.28 : 0.16, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + (downbeat ? 0.07 : 0.045));
    osc.connect(g);
    g.connect(metroGain);
    osc.start(t);
    osc.stop(t + 0.08);
  }

  function midiFreq(midi) {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  function parseRootToken(token) {
    const m = String(token || "").trim().match(/^([A-G])([#b]?)(.*)$/i);
    if (!m) return null;
    let pc = ROOT_PC[m[1].toUpperCase()];
    if (m[2] === "#") pc += 1;
    if (m[2] === "b") pc -= 1;
    pc = ((pc % 12) + 12) % 12;
    return { pc, rest: m[3] || "", rootRaw: m[1].toUpperCase() + (m[2] || "") };
  }

  function parseChord(sym) {
    const raw = String(sym || "").trim();
    if (!raw) return null;
    const slash = raw.indexOf("/");
    const main = slash >= 0 ? raw.slice(0, slash) : raw;
    const bassTok = slash >= 0 ? raw.slice(slash + 1) : "";
    const root = parseRootToken(main);
    if (!root) return null;
    let q = root.rest.toLowerCase();
    let third = 4;
    let fifth = 7;
    let seventh = null;
    if (q.startsWith("maj7") || q.startsWith("ma7") || q.startsWith("Δ")) {
      seventh = 11;
    } else if (q === "maj") {
      third = 4;
    } else if (q.startsWith("min") || (q.startsWith("m") && !q.startsWith("maj"))) {
      third = 3;
      if (q.includes("7")) seventh = 10;
    } else if (q.startsWith("dim") || q.startsWith("o")) {
      third = 3;
      fifth = 6;
      if (q.includes("7")) seventh = 9;
    } else if (q.startsWith("aug") || q.startsWith("+")) {
      fifth = 8;
    } else if (q.startsWith("sus4")) {
      third = 5;
    } else if (q.startsWith("sus2")) {
      third = 2;
    } else if (q.includes("7")) {
      seventh = 10;
    }
    const ints = [0, third, fifth];
    if (seventh != null) ints.push(seventh);
    let bassPc = root.pc;
    if (bassTok) {
      const b = parseRootToken(bassTok);
      if (b) bassPc = b.pc;
    }
    return { pc: root.pc, bassPc, ints, quality: root.rest, name: raw };
  }

  function transposeSymbol(sym, n) {
    const raw = String(sym || "").trim();
    const slash = raw.indexOf("/");
    const main = slash >= 0 ? raw.slice(0, slash) : raw;
    const bassTok = slash >= 0 ? raw.slice(slash + 1) : "";
    const root = parseRootToken(main);
    if (!root) return raw;
    const name = PC_NAMES[((root.pc + n) % 12 + 12) % 12] + root.rest;
    if (!bassTok) return name;
    const b = parseRootToken(bassTok);
    if (!b) return name + "/" + bassTok;
    return name + "/" + PC_NAMES[((b.pc + n) % 12 + 12) % 12];
  }

  function liveChords() {
    return jamChords.map((c) => transposeSymbol(c, jamTranspose));
  }

  function chordAt(bar) {
    const list = liveChords();
    if (!list.length) return "C";
    return list[((bar % list.length) + list.length) % list.length];
  }

  function toMidiRange(pc, low, high) {
    let m = pc;
    while (m < low) m += 12;
    while (m > high) m -= 12;
    if (m < low) m += 12;
    return m;
  }

  function playEpNote(t, midi, vel) {
    if (!pianoGain) return;
    const f = midiFreq(midi);
    const dur = 1.45;
    const car = ctx.createOscillator();
    const mod = ctx.createOscillator();
    const modg = ctx.createGain();
    const g = ctx.createGain();
    car.type = "sine";
    car.frequency.setValueAtTime(f, t);
    mod.type = "sine";
    mod.frequency.value = f * 14;
    modg.gain.setValueAtTime(f * 1.1 * vel, t);
    modg.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    mod.connect(modg);
    modg.connect(car.frequency);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, 0.2 * vel), t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    car.connect(g);
    g.connect(pianoGain);
    car.start(t);
    car.stop(t + dur);
    mod.start(t);
    mod.stop(t + 0.22);
  }

  function playPianoChord(t, sym, accent) {
    const ch = parseChord(sym);
    if (!ch) return;
    const vel = accent ? 0.95 : 0.48;
    const thirds = ch.ints.filter((i) => i !== 0);
    const midis = [];
    midis.push(toMidiRange(ch.pc, 55, 64));
    thirds.forEach((iv, i) => {
      midis.push(toMidiRange((ch.pc + iv) % 12, i === 0 ? 60 : 64, i === 0 ? 72 : 76));
    });
    const uniq = [];
    midis.forEach((m) => {
      if (!uniq.includes(m)) uniq.push(m);
    });
    uniq.slice(0, 4).forEach((m, i) => playEpNote(t, m, vel * (1 - i * 0.08)));
  }

  const STRUM = [
    { step: 0, dir: 1, vel: 1 },
    { step: 4, dir: 1, vel: 0.7 },
    { step: 6, dir: -1, vel: 0.52 },
    { step: 8, dir: 1, vel: 0.82 },
    { step: 10, dir: -1, vel: 0.48 },
    { step: 12, dir: 1, vel: 0.74 },
    { step: 14, dir: -1, vel: 0.46 },
  ];

  function guitarNotes(ch) {
    const tones = ch.ints.slice();
    const notes = [];
    const low = toMidiRange(ch.pc, 40, 52);
    notes.push(low);
    let cursor = low;
    let guard = 0;
    while (notes.length < 5 && guard < 24) {
      guard += 1;
      const iv = tones[notes.length % tones.length];
      let n = ch.pc + iv;
      while (n <= cursor) n += 12;
      if (n > 76) break;
      notes.push(n);
      cursor = n;
    }
    return notes;
  }

  function playGuitarString(t, midi, vel) {
    if (!guitarGain || vel <= 0) return;
    const f = midiFreq(midi);
    const dur = 0.4 + vel * 0.32;
    const osc = ctx.createOscillator();
    const partial = ctx.createOscillator();
    const partialG = ctx.createGain();
    const lp = ctx.createBiquadFilter();
    const g = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(f * 1.012, t);
    osc.frequency.exponentialRampToValueAtTime(f, t + 0.028);
    partial.type = "sine";
    partial.frequency.value = f * 2;
    partialG.gain.value = 0.12;
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(1400 + vel * 1800, t);
    lp.frequency.exponentialRampToValueAtTime(700, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, 0.16 * vel), t + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(lp);
    partial.connect(partialG);
    partialG.connect(lp);
    lp.connect(g);
    g.connect(guitarGain);
    osc.start(t);
    osc.stop(t + dur + 0.02);
    partial.start(t);
    partial.stop(t + dur + 0.02);
  }

  function playGuitarStrum(t, sym, dir, vel) {
    const ch = parseChord(sym);
    if (!ch) return;
    const notes = guitarNotes(ch);
    const ordered = dir < 0 ? notes.slice().reverse() : notes;
    ordered.forEach((m, i) => playGuitarString(t + i * 0.012, m, vel * (1 - i * 0.06)));
  }

  function playGuitar(step, time) {
    if (!jamOn || guitarVol <= 0.001) return;
    const hit = STRUM.find((s) => s.step === step);
    if (!hit) return;
    playGuitarStrum(time, chordAt(currentBar), hit.dir, hit.vel);
  }

  function playBassNote(t, midi, vel) {
    if (!bassGain) return;
    const f = midiFreq(midi);
    const osc = ctx.createOscillator();
    const sub = ctx.createOscillator();
    const lp = ctx.createBiquadFilter();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(f * 1.06, t);
    osc.frequency.exponentialRampToValueAtTime(f, t + 0.03);
    sub.type = "sine";
    sub.frequency.value = f * 0.5;
    lp.type = "lowpass";
    lp.frequency.value = 480;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, 0.55 * vel), t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);
    osc.connect(lp);
    sub.connect(lp);
    lp.connect(g);
    g.connect(bassGain);
    osc.start(t);
    osc.stop(t + 0.4);
    sub.start(t);
    sub.stop(t + 0.4);
  }

  function playJam(step, time) {
    if (!jamOn || !jamChords.length) return;
    const sym = chordAt(currentBar);
    const ch = parseChord(sym);
    if (!ch) return;
    if (step === 0) playPianoChord(time, sym, true);
    else if (step === 8) playPianoChord(time, sym, false);
    if (step === 0 || step === 8) {
      const pc = step === 0 ? ch.bassPc : (ch.pc + 7) % 12;
      playBassNote(time, toMidiRange(pc, 28, 40), step === 0 ? 1 : 0.72);
    }
  }

  function stepDuration() {
    return 60 / Math.max(40, bpm) / 4;
  }

  function swingOffset(step) {
    const swing = currentLoop().swing || 0;
    if (!swing || step % 2 === 0) return 0;
    return stepDuration() * swing * 0.5;
  }

  function isMetroBeat(step) {
    if (beatsPerBar === 6) return step % 2 === 0;
    if (beatsPerBar === 3) return step % 4 === 0 && step < 12;
    if (beatsPerBar === 2) return step === 0 || step === 8;
    return step % 4 === 0;
  }

  function isDownbeat(step) {
    if (beatsPerBar === 6) return step === 0 || step === 8;
    if (beatsPerBar === 2) return step === 0 || step === 8;
    return step === 0;
  }

  function scheduleStep(step, time) {
    const drumsOn = countInLeft <= 0;
    const loop = currentLoop();
    const drums = drumsForBar(loop, drumBar);
    if (drumsOn) rampTempo(step);
    if (drumsOn) {
      const kick = velAt(drums.kick, step);
      const snare = velAt(drums.snare, step);
      const hat = velAt(drums.hat, step);
      const open = velAt(drums.open, step);
      const clap = velAt(drums.clap, step);
      const ride = velAt(drums.ride, step);
      const tom = velAt(drums.tom, step);
      if (kick) playKick(humanTime(time), humanVel(kick));
      if (snare) playSnare(humanTime(time), humanVel(snare));
      if (open) playHat(humanTime(time), humanVel(open), true);
      else if (hat) playHat(humanTime(time), humanVel(hat), false);
      if (clap) playClap(humanTime(time), humanVel(clap));
      if (ride) playRide(humanTime(time), humanVel(ride));
      if (tom) playTom(humanTime(time), humanVel(tom));
    }
    if (drumsOn) {
      playJam(step, time);
      playGuitar(step, time);
    }
    if (metroOn && isMetroBeat(step)) playClick(time, isDownbeat(step));
    uiQueue.push({ step, time, bar: currentBar });
  }

  function pumpScheduler() {
    if (!playing || !ctx) return;
    const ahead = 0.3;
    let guard = 0;
    while (nextStepTime < ctx.currentTime + ahead && guard < 64) {
      const wasCounting = countInLeft > 0;
      scheduleStep(currentStep, nextStepTime + swingOffset(currentStep));
      nextStepTime += stepDuration();
      currentStep = (currentStep + 1) % 16;
      if (countInLeft > 0) countInLeft -= 1;
      if (!wasCounting && currentStep === 0) {
        drumBar += 1;
        if (jamChords.length) currentBar = (currentBar + 1) % jamChords.length;
      }
      guard += 1;
    }
  }

  function scheduler() {
    ensureClock();
    pumpScheduler();
    if (timerId) clearTimeout(timerId);
    const tick = () => {
      if (!playing) return;
      try {
        pumpScheduler();
      } catch (_) {}
      timerId = setTimeout(tick, 25);
    };
    timerId = setTimeout(tick, 25);
  }

  function drainUI() {
    if (ctx) {
      const now = ctx.currentTime;
      while (uiQueue.length && uiQueue[0].time <= now) {
        const ev = uiQueue.shift();
        displayStep = ev.step;
        if (ev.bar != null) displayBar = ev.bar;
        paintBeats();
        paintJam();
        paintShape();
        bpmNum.classList.toggle("pulse", displayStep % 4 === 0);
      }
    }
    requestAnimationFrame(drainUI);
  }

  function paintBeats() {
    const cells = beatStrip.querySelectorAll(".beat-cell");
    cells.forEach((el, i) => {
      el.classList.toggle("on", playing && i === displayStep);
      el.classList.toggle("down", i % 4 === 0);
    });
  }

  function paintShape() {
    bpmNum.textContent = String(bpm);
    if (bpmLab) bpmLab.textContent = "BPM";
    if (tempoEl && document.activeElement !== tempoEl && tempoEl.value !== String(bpm)) {
      tempoEl.value = String(bpm);
    }
    if (shapeSeg) {
      shapeSeg.querySelectorAll("button").forEach((b) => {
        b.classList.toggle("on", b.dataset.shape === shape);
      });
    }
    if (!shapeHint) return;
    if (shape === "steady") {
      shapeHint.textContent = "";
      return;
    }
    const dir = shape === "build" ? "+1" : "−1";
    shapeHint.textContent = dir + " BPM every " + shapeEvery + " beats";
  }

  function paintJam() {
    const list = liveChords();
    const n = list.length || 1;
    const bar = ((displayBar % n) + n) % n;
    const cur = list[bar] || "—";
    const nxt = list[(bar + 1) % n] || "—";
    if (jamNow) jamNow.textContent = cur;
    if (jamNext) jamNext.textContent = nxt;
    if (jamNowMeta) {
      jamNowMeta.textContent = jamOn
        ? "Bar " + (bar + 1) + " / " + n + (jamTranspose ? " · " + (jamTranspose > 0 ? "+" : "") + jamTranspose : "")
        : "Piano + bass off";
    }
    if (jamKeyVal) {
      jamKeyVal.textContent = (jamTranspose > 0 ? "+" : "") + jamTranspose;
    }
    if (jamChips) {
      jamChips.querySelectorAll(".jam-chip").forEach((el, i) => {
        el.classList.toggle("on", i === bar);
      });
    }
  }

  function renderJamChips() {
    if (!jamChips) return;
    jamChips.innerHTML = "";
    liveChords().forEach((name, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "jam-chip" + (i === displayBar % Math.max(1, jamChords.length) ? " on" : "");
      b.textContent = name;
      b.onclick = () => {
        currentBar = i;
        displayBar = i;
        paintJam();
      };
      jamChips.appendChild(b);
    });
  }

  function setJamChords(chords, presetId) {
    const clean = chords.map((c) => String(c).trim()).filter(Boolean);
    if (!clean.length) return;
    jamChords = clean;
    jamPresetId = presetId || "custom";
    if (jamProgEl) jamProgEl.value = clean.join(" ");
    currentBar = 0;
    displayBar = 0;
    renderJamPresets();
    renderJamChips();
    paintJam();
    savePrefs();
  }

  function applyJamText() {
    const parts = (jamProgEl.value || "").split(/[\s,|]+/).filter(Boolean);
    const ok = parts.filter((p) => parseChord(p));
    if (!ok.length) {
      alert("Use chords like: Am F C G  or  Dm7 G7 Cmaj7");
      return;
    }
    setJamChords(ok, "custom");
  }

  function renderJamPresets() {
    if (!jamPresetsEl) return;
    jamPresetsEl.innerHTML = "";
    JAM_PRESETS.forEach((p) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = p.name;
      b.className = p.id === jamPresetId ? "on" : "";
      b.onclick = () => setJamChords(p.chords.slice(), p.id);
      jamPresetsEl.appendChild(b);
    });
  }

  function bumpTranspose(delta) {
    jamTranspose = Math.max(-6, Math.min(6, jamTranspose + delta));
    renderJamChips();
    paintJam();
    savePrefs();
  }

  function setBpm(next, fromLoop) {
    bpm = Math.max(40, Math.min(220, Math.round(next)));
    tempoEl.value = String(bpm);
    paintShape();
    if (!fromLoop) savePrefs();
  }

  function setPlayUi(on) {
    if (!playBtn) return;
    if (on) {
      playBtn.classList.add("playing");
      playBtn.classList.remove("primary");
    } else {
      playBtn.classList.remove("playing");
      playBtn.classList.add("primary");
    }
    playBtn.setAttribute("aria-label", on ? "Pause" : "Play");
    playBtn.title = on ? "Pause" : "Play";
  }
  function setPlaying(on) {
    playing = on;
    setPlayUi(on);
    syncSession();
  }
  setPlayUi(false);

  async function start(useCountIn) {
    if (!ensureCtx()) {
      alert("Web Audio is not available in this browser.");
      return;
    }
    const ok = await loadKit();
    if (!ok) return;
    if (!kitReady) return;
    stopScheduler();
    uiQueue = [];
    if (useCountIn) {
      currentStep = 0;
      displayStep = -1;
      currentBar = 0;
      displayBar = 0;
      countInLeft = countInEl.checked ? 16 : 0;
      drumBar = 0;
      playedBeats = 0;
    }
    paintJam();
    nextStepTime = ctx.currentTime + 0.06;
    setPlaying(true);
    scheduler();
    paintBeats();
  }

  function stopScheduler() {
    if (timerId) clearTimeout(timerId);
    timerId = null;
  }

  function stop(reset) {
    stopScheduler();
    setPlaying(false);
    uiQueue = [];
    if (reset) {
      currentStep = 0;
      displayStep = -1;
      currentBar = 0;
      displayBar = 0;
      countInLeft = 0;
    }
    bpmNum.classList.remove("pulse");
    paintBeats();
    paintJam();
  }

  let starting = false;

  async function togglePlay() {
    if (playing) {
      stop(false);
      return;
    }
    if (starting) return;
    starting = true;
    try {
      // iOS: resume AudioContext in the tap gesture before any kit fetch awaits.
      if (!ensureCtx()) {
        alert("Web Audio is not available in this browser.");
        return;
      }
      holdWake();
      if (ctx.state === "suspended") {
        try {
          await ctx.resume();
        } catch (_) {}
      }
      await start(displayStep < 0);
    } finally {
      starting = false;
    }
  }

  function selectLoop(id) {
    const loop = LOOPS.find((l) => l.id === id);
    if (!loop) return;
    loopId = loop.id;
    if (loop.id === "click") {
      metroOn = true;
      syncVolUI();
    }
    drumBar = 0;
    playedBeats = 0;
    if (!keepTempoEl.checked) setBpm(loop.bpm, true);
    nowName.textContent = loop.name;
    nowMeta.textContent =
      loop.genre +
      " · 4/4" +
      (loop.bars ? " · " + loop.bars.length + "-bar variation" : "") +
      (loop.swing ? " · swing" : "") +
      " · default " +
      loop.bpm +
      " BPM";
    renderLoops();
    savePrefs();
  }

  function renderFilters() {
    filtersEl.innerHTML = "";
    GENRES.forEach((g) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = g;
      b.className = g === genreFilter ? "on" : "";
      b.onclick = () => {
        genreFilter = g;
        renderFilters();
        renderLoops();
      };
      filtersEl.appendChild(b);
    });
  }

  function renderLoops() {
    loopGrid.innerHTML = "";
    LOOPS.filter((l) => genreFilter === "All" || l.genre === genreFilter).forEach((loop) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "loop-card" + (loop.id === loopId ? " on" : "");
      b.innerHTML =
        '<span class="loop-name"></span><span class="loop-meta"></span>';
      b.querySelector(".loop-name").textContent = loop.name;
      b.querySelector(".loop-meta").textContent =
        loop.genre +
        " · " +
        loop.bpm +
        " BPM" +
        (loop.bars ? " · variations" : "") +
        (loop.swing ? " · swing" : "");
      b.onclick = () => selectLoop(loop.id);
      loopGrid.appendChild(b);
    });
  }

  function renderDrums() {
    drumMixEl.innerHTML = "";
    VOICES.forEach((v) => {
      const row = document.createElement("div");
      row.className = "loopz-drum" + (muted[v.id] ? " muted" : "");
      row.innerHTML =
        '<span class="name"></span>' +
        '<input type="range" min="0" max="1" step="0.01" />' +
        '<span class="vol"></span>' +
        '<button type="button" class="mute">Mute</button>';
      row.querySelector(".name").textContent = v.name;
      const slider = row.querySelector("input");
      const volLab = row.querySelector(".vol");
      const muteBtn = row.querySelector(".mute");
      slider.value = String(voiceVol[v.id]);
      volLab.textContent = Math.round(voiceVol[v.id] * 100) + "%";
      muteBtn.classList.toggle("on", muted[v.id]);
      slider.oninput = () => {
        voiceVol[v.id] = parseFloat(slider.value) || 0;
        volLab.textContent = Math.round(voiceVol[v.id] * 100) + "%";
        applyGains();
        savePrefs();
      };
      muteBtn.onclick = () => {
        muted[v.id] = !muted[v.id];
        applyGains();
        renderDrums();
        savePrefs();
      };
      drumMixEl.appendChild(row);
    });
  }

  function savePrefs() {
    try {
      localStorage.setItem(
        "loopzPrefs",
        JSON.stringify({
          loopId,
          bpm,
          loopVol,
          metroVol,
          metroOn,
          beatsPerBar,
          keepTempo: !!keepTempoEl.checked,
          countIn: !!countInEl.checked,
          muted,
          voiceVol,
          jamOn,
          jamChords,
          jamPresetId,
          jamTranspose,
          pianoVol,
          bassVol,
          guitarVol,
          shape,
          shapeEvery,
          selectedMicId,
        })
      );
    } catch (_) {}
  }

  function loadPrefs() {
    try {
      const raw = localStorage.getItem("loopzPrefs");
      if (!raw) return;
      const p = JSON.parse(raw);
      if (p.loopId && LOOPS.some((l) => l.id === p.loopId)) loopId = p.loopId;
      if (p.bpm) bpm = p.bpm;
      if (p.loopVol != null) loopVol = p.loopVol;
      if (p.metroVol != null) metroVol = p.metroVol;
      if (typeof p.metroOn === "boolean") metroOn = p.metroOn;
      if (p.beatsPerBar) beatsPerBar = p.beatsPerBar;
      if (p.muted) muted = { ...muted, ...p.muted };
      if (p.voiceVol) voiceVol = { ...voiceVol, ...p.voiceVol };
      if (typeof p.jamOn === "boolean") jamOn = p.jamOn;
      if (Array.isArray(p.jamChords) && p.jamChords.length) jamChords = p.jamChords;
      if (p.jamPresetId) jamPresetId = p.jamPresetId;
      if (typeof p.jamTranspose === "number") jamTranspose = p.jamTranspose;
      if (p.pianoVol != null) pianoVol = p.pianoVol;
      if (p.bassVol != null) bassVol = p.bassVol;
      if (p.guitarVol != null) guitarVol = p.guitarVol;
      if (p.shape === "steady" || p.shape === "build" || p.shape === "thin") shape = p.shape;
      if ([2, 4, 8, 16].includes(p.shapeEvery)) shapeEvery = p.shapeEvery;
      if (typeof p.selectedMicId === "string") selectedMicId = p.selectedMicId;
      keepTempoEl.checked = !!p.keepTempo;
      countInEl.checked = !!p.countIn;
    } catch (_) {}
  }

  function syncVolUI() {
    loopVolEl.value = String(loopVol);
    metroVolEl.value = String(metroVol);
    loopVolVal.textContent = Math.round(loopVol * 100) + "%";
    metroVolVal.textContent = Math.round(metroVol * 100) + "%";
    metroBtn.classList.toggle("on", metroOn);
    metroBtn.textContent = metroOn ? "Metronome: On" : "Metronome: Off";
    if (jamOnEl) jamOnEl.checked = jamOn;
    if (pianoVolEl) pianoVolEl.value = String(pianoVol);
    if (bassVolEl) bassVolEl.value = String(bassVol);
    if (guitarVolEl) guitarVolEl.value = String(guitarVol);
    if (pianoVolVal) pianoVolVal.textContent = Math.round(pianoVol * 100) + "%";
    if (bassVolVal) bassVolVal.textContent = Math.round(bassVol * 100) + "%";
    if (guitarVolVal) guitarVolVal.textContent = Math.round(guitarVol * 100) + "%";
    if (shapeEverySel) shapeEverySel.value = String(shapeEvery);
    paintShape();
    if (jamProgEl) jamProgEl.value = jamChords.join(" ");
    meterSel.value = String(beatsPerBar);
    tempoEl.value = String(bpm);
    paintShape();
  }

  function onTap() {
    const now = performance.now();
    if (tapTimes.length && now - tapTimes[tapTimes.length - 1] > 1800) tapTimes.length = 0;
    tapTimes.push(now);
    if (tapTimes.length < 2) return;
    const gaps = [];
    for (let i = 1; i < tapTimes.length; i++) gaps.push(tapTimes[i] - tapTimes[i - 1]);
    const avg = gaps.slice(-4).reduce((a, b) => a + b, 0) / Math.min(4, gaps.length);
    setBpm(60000 / avg);
  }

  beatStrip.innerHTML = "";
  for (let i = 0; i < 16; i++) {
    const d = document.createElement("div");
    d.className = "beat-cell" + (i % 4 === 0 ? " down" : "");
    beatStrip.appendChild(d);
  }

  loadPrefs();
  const savedBpm = bpm;
  selectLoop(loopId);
  setBpm(savedBpm, true);
  syncVolUI();
  renderFilters();
  renderLoops();
  renderDrums();
  renderJamPresets();
  renderJamChips();
  paintJam();
  drainUI();
  Object.values(KIT_URLS).forEach((url) => fetch(url).catch(() => {}));

  function fmtRec(sec) {
    const s = Math.max(0, Math.floor(sec));
    return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
  }

  function pickRecorderMime(kind) {
    const types =
      kind === "video"
        ? [
            "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
            "video/mp4;codecs=avc1,mp4a.40.2",
            "video/mp4",
            "video/webm;codecs=vp9,opus",
            "video/webm;codecs=vp8,opus",
            "video/webm",
          ]
        : ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
    for (const t of types) {
      if (window.MediaRecorder && MediaRecorder.isTypeSupported(t)) return t;
    }
    return "";
  }

  async function refreshMics() {
    if (!micSel || !navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const mics = devices.filter((d) => d.kind === "audioinput");
      const prev = selectedMicId || micSel.value || "";
      micSel.innerHTML = "";
      if (!mics.length) {
        const o = document.createElement("option");
        o.value = "";
        o.textContent = "Default microphone";
        micSel.appendChild(o);
      } else {
        mics.forEach((d, i) => {
          const o = document.createElement("option");
          o.value = d.deviceId || "";
          o.textContent = d.label || "Microphone " + (i + 1);
          micSel.appendChild(o);
        });
      }
      if (prev && Array.from(micSel.options).some((o) => o.value === prev)) micSel.value = prev;
      selectedMicId = micSel.value || "";
    } catch (_) {}
  }

  function setRecordUi(on) {
    if (recordBtn) {
      const active = on && recordKind === "audio";
      recordBtn.classList.toggle("on", active);
      recordBtn.textContent = active ? "● Stop" : "● Record audio";
      recordBtn.disabled = on && recordKind !== "audio";
      recordBtn.setAttribute("aria-label", active ? "Stop recording" : "Record audio");
    }
    if (recordVideoBtn) {
      const active = on && recordKind === "video";
      recordVideoBtn.classList.toggle("on", active);
      recordVideoBtn.textContent = active ? "● Stop" : "● Record video";
      recordVideoBtn.disabled = on && recordKind !== "video";
      recordVideoBtn.setAttribute("aria-label", active ? "Stop recording" : "Record video");
    }
    if (recTimer) recTimer.hidden = !on;
    if (!on) hideCamPreview();
  }

  function startRecTimer() {
    recStartedAt = Date.now();
    if (recTimer) recTimer.textContent = "0:00";
    if (recTimerId) clearInterval(recTimerId);
    recTimerId = setInterval(() => {
      if (recTimer) recTimer.textContent = fmtRec((Date.now() - recStartedAt) / 1000);
    }, 200);
  }

  function stopRecTimer() {
    if (recTimerId) clearInterval(recTimerId);
    recTimerId = null;
  }

  function showCamPreview(stream) {
    if (!camPreview || !camVideo || !stream) return;
    camVideo.srcObject = stream;
    camVideo.muted = true;
    camVideo.setAttribute("playsinline", "");
    camPreview.hidden = false;
    camVideo.play().catch(() => {});
  }

  function hideCamPreview() {
    if (camVideo) {
      try {
        camVideo.pause();
      } catch (_) {}
      camVideo.srcObject = null;
    }
    if (camPreview) camPreview.hidden = true;
  }

  function stopTracks(stream) {
    if (!stream) return;
    stream.getTracks().forEach((t) => {
      try {
        t.stop();
      } catch (_) {}
    });
  }

  async function getMedia(constraints) {
    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (err) {
      if (constraints.audio && typeof constraints.audio === "object" && constraints.audio.deviceId) {
        const retry = { ...constraints, audio: { ...constraints.audio } };
        delete retry.audio.deviceId;
        return await navigator.mediaDevices.getUserMedia(retry);
      }
      throw err;
    }
  }

  function cleanupMic() {
    stopRecTimer();
    hideCamPreview();
    try {
      if (micGain) micGain.disconnect();
    } catch (_) {}
    try {
      if (micSource) micSource.disconnect();
    } catch (_) {}
    if (camStream && camStream !== micStream) stopTracks(camStream);
    stopTracks(micStream);
    try {
      if (recDest && mixBus) mixBus.disconnect(recDest);
    } catch (_) {}
    micGain = null;
    micSource = null;
    micStream = null;
    camStream = null;
    recDest = null;
    mediaRecorder = null;
  }

  function floatTo16(float32) {
    const out = new Int16Array(float32.length);
    for (let i = 0; i < float32.length; i++) {
      const s = Math.max(-1, Math.min(1, float32[i]));
      out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return out;
  }

  function encodeMp3(audioBuf) {
    const Encoder = window.lamejs && window.lamejs.Mp3Encoder;
    if (!Encoder) throw new Error("MP3 encoder missing");
    const channels = Math.min(2, audioBuf.numberOfChannels);
    const enc = new Encoder(channels, audioBuf.sampleRate, 128);
    const left = floatTo16(audioBuf.getChannelData(0));
    const right = channels > 1 ? floatTo16(audioBuf.getChannelData(1)) : left;
    const block = 1152;
    const parts = [];
    for (let i = 0; i < left.length; i += block) {
      const l = left.subarray(i, i + block);
      const r = right.subarray(i, i + block);
      const buf = channels > 1 ? enc.encodeBuffer(l, r) : enc.encodeBuffer(l);
      if (buf && buf.length) parts.push(buf);
    }
    const end = enc.flush();
    if (end && end.length) parts.push(end);
    return new Blob(parts, { type: "audio/mpeg" });
  }

  function publishTake(blob, ext, isVideo) {
    const fname =
      (currentLoop().name || "loopz").replace(/[^\w\s\-]+/g, "").replace(/\s+/g, "-") +
      (isVideo ? "-video-take." : "-take.") +
      ext;
    if (takeUrl) URL.revokeObjectURL(takeUrl);
    takeUrl = URL.createObjectURL(blob);
    if (takeAudio) {
      takeAudio.hidden = !!isVideo;
      if (!isVideo) takeAudio.src = takeUrl;
    }
    if (takeVideo) {
      takeVideo.hidden = !isVideo;
      if (isVideo) {
        takeVideo.src = takeUrl;
        takeVideo.load();
      } else {
        takeVideo.removeAttribute("src");
        takeVideo.load();
      }
    }
    downloadBlob(blob, fname);
  }

  function downloadBlob(blob, fname) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fname;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  async function sniffContainer(blob) {
    try {
      const buf = new Uint8Array(await blob.slice(0, 16).arrayBuffer());
      if (buf.length >= 8 && buf[4] === 0x66 && buf[5] === 0x74 && buf[6] === 0x79 && buf[7] === 0x70) return "mp4";
      if (buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3) return "webm";
    } catch (_) {}
    return "";
  }

  async function finishRecording(mime) {
    const chunks = recChunks.slice();
    recChunks = [];
    const kind = recordKind;
    cleanupMic();
    syncSession();
    if (!chunks.length) {
      if (recNote) {
        recNote.hidden = false;
        recNote.textContent = "Recording was empty.";
      }
      return;
    }
    const isVideo = kind === "video" || String(mime || "").startsWith("video/");
    const blob = new Blob(chunks, { type: mime || (isVideo ? "video/webm" : "audio/webm") });
    if (isVideo) {
      const sniffed = await sniffContainer(blob);
      const ext = sniffed === "mp4" || String(mime || "").includes("mp4") ? "mp4" : "webm";
      const typed = ext === "mp4" ? new Blob([blob], { type: "video/mp4" }) : blob;
      publishTake(typed, ext, true);
      if (recNote) {
        recNote.hidden = false;
        recNote.textContent =
          ext === "mp4"
            ? "MP4 saved — camera plus drums, piano, bass, guitar, and your mic."
            : "Saved as WebM. This browser cannot record MP4 (iPhone and Safari can).";
      }
      return;
    }
    if (recNote) {
      recNote.hidden = false;
      recNote.textContent = "Making MP3…";
    }
    try {
      if (!ensureCtx()) throw new Error("no audio");
      const raw = await blob.arrayBuffer();
      const decoded = await ctx.decodeAudioData(raw.slice(0));
      const mp3 = encodeMp3(decoded);
      publishTake(mp3, "mp3", false);
      if (recNote) recNote.textContent = "MP3 saved — drums, piano, bass, guitar, and your mic.";
    } catch (e) {
      const ext = (mime || "").includes("mp4") ? "m4a" : (mime || "").includes("ogg") ? "ogg" : "webm";
      publishTake(blob, ext, false);
      if (recNote) recNote.textContent = "Could not make MP3 (" + (e.message || e) + "). Saved the original file.";
    }
  }

  async function startRecording(kind) {
    kind = kind === "video" ? "video" : "audio";
    if (recording || recordBusy) return;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Recording needs microphone permission in this browser.");
      return;
    }
    recordBusy = true;
    recordKind = kind;
    holdWake();
    try {
      if (!ensureCtx()) {
        alert("Web Audio is not available in this browser.");
        return;
      }
      const audioOpts = {
        echoCancellation: { ideal: true },
        noiseSuppression: { ideal: true },
        autoGainControl: { ideal: true },
        channelCount: { ideal: 1 },
      };
      if (selectedMicId) audioOpts.deviceId = { exact: selectedMicId };
      const videoOpts = {
        facingMode: { ideal: "user" },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      };
      if (kind === "video") {
        try {
          const both = await getMedia({ video: videoOpts, audio: audioOpts });
          micStream = both;
          camStream = both;
        } catch (_) {
          camStream = await navigator.mediaDevices.getUserMedia({ video: videoOpts });
          micStream = await getMedia({ audio: audioOpts });
        }
      } else {
        micStream = await getMedia({ audio: audioOpts });
        camStream = null;
      }
      await refreshMics();
      const track = micStream.getAudioTracks()[0];
      if (track && track.getSettings) {
        const id = track.getSettings().deviceId;
        if (id && micSel && Array.from(micSel.options).some((o) => o.value === id)) {
          selectedMicId = id;
          micSel.value = id;
          savePrefs();
        }
      }
      micSource = ctx.createMediaStreamSource(micStream);
      micGain = ctx.createGain();
      micGain.gain.value = 1.4;
      recDest = ctx.createMediaStreamDestination();
      mixBus.connect(recDest);
      micSource.connect(micGain);
      micGain.connect(recDest);
      let recStream = recDest.stream;
      if (kind === "video") {
        const videoTrack = (camStream || micStream).getVideoTracks()[0];
        if (!videoTrack) throw new Error("No camera");
        recStream = new MediaStream([videoTrack, ...recDest.stream.getAudioTracks()]);
        showCamPreview(camStream || micStream);
      }
      recChunks = [];
      const mime = pickRecorderMime(kind);
      const recOpts =
        kind === "video"
          ? { audioBitsPerSecond: 192000, videoBitsPerSecond: 2500000 }
          : { audioBitsPerSecond: 192000 };
      if (mime) recOpts.mimeType = mime;
      try {
        mediaRecorder = new MediaRecorder(recStream, recOpts);
      } catch (_) {
        mediaRecorder = new MediaRecorder(recStream, mime ? { mimeType: mime } : {});
      }
      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size) recChunks.push(e.data);
      };
      mediaRecorder.onstop = () =>
        finishRecording(mediaRecorder.mimeType || mime || (kind === "video" ? "video/webm" : "audio/webm"));
      mediaRecorder.start(200);
      recording = true;
      setRecordUi(true);
      startRecTimer();
      if (!playing) await togglePlay();
    } catch (e) {
      cleanupMic();
      recording = false;
      setRecordUi(false);
      alert(
        "Record failed: " +
          (e.message || e) +
          (kind === "video" ? " — allow the camera and microphone." : " — allow the microphone.")
      );
    } finally {
      recordBusy = false;
    }
  }

  function stopRecording() {
    if (!recording || !mediaRecorder) return;
    recording = false;
    setRecordUi(false);
    if (playing) stop(false);
    try {
      if (mediaRecorder.state !== "inactive") mediaRecorder.stop();
    } catch (_) {
      finishRecording(recordKind === "video" ? "video/webm" : "audio/webm");
    }
  }

  async function toggleRecord(kind) {
    if (recording) stopRecording();
    else await startRecording(kind);
  }

  playBtn.onclick = togglePlay;
  tapBtn.onclick = onTap;
  bpmUp.onclick = () => setBpm(bpm + 5);
  bpmDown.onclick = () => setBpm(bpm - 5);
  tempoEl.oninput = () => setBpm(parseInt(tempoEl.value, 10) || bpm);
  loopVolEl.oninput = () => {
    loopVol = parseFloat(loopVolEl.value) || 0;
    loopVolVal.textContent = Math.round(loopVol * 100) + "%";
    applyGains();
    savePrefs();
  };
  metroVolEl.oninput = () => {
    metroVol = parseFloat(metroVolEl.value) || 0;
    metroVolVal.textContent = Math.round(metroVol * 100) + "%";
    applyGains();
    savePrefs();
  };
  if (pianoVolEl) {
    pianoVolEl.oninput = () => {
      pianoVol = parseFloat(pianoVolEl.value) || 0;
      if (pianoVolVal) pianoVolVal.textContent = Math.round(pianoVol * 100) + "%";
      applyGains();
      savePrefs();
    };
  }
  if (bassVolEl) {
    bassVolEl.oninput = () => {
      bassVol = parseFloat(bassVolEl.value) || 0;
      if (bassVolVal) bassVolVal.textContent = Math.round(bassVol * 100) + "%";
      applyGains();
      savePrefs();
    };
  }
  if (guitarVolEl) {
    guitarVolEl.oninput = () => {
      guitarVol = parseFloat(guitarVolEl.value) || 0;
      if (guitarVolVal) guitarVolVal.textContent = Math.round(guitarVol * 100) + "%";
      applyGains();
      savePrefs();
    };
  }
  if (shapeSeg) {
    shapeSeg.onclick = (e) => {
      const b = e.target.closest("button");
      if (!b || !b.dataset.shape) return;
      shape = b.dataset.shape;
      playedBeats = 0;
      paintShape();
      savePrefs();
    };
  }
  if (shapeEverySel) {
    shapeEverySel.onchange = () => {
      shapeEvery = parseInt(shapeEverySel.value, 10) || 4;
      playedBeats = 0;
      paintShape();
      savePrefs();
    };
  }
  if (micSel) {
    micSel.onchange = () => {
      selectedMicId = micSel.value || "";
      savePrefs();
    };
  }
  if (recordBtn) recordBtn.onclick = () => toggleRecord("audio");
  if (recordVideoBtn) recordVideoBtn.onclick = () => toggleRecord("video");
  refreshMics();
  if (navigator.mediaDevices && navigator.mediaDevices.addEventListener) {
    navigator.mediaDevices.addEventListener("devicechange", refreshMics);
  }
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;
    if (ctx && ctx.state === "suspended" && (playing || recording)) ctx.resume().catch(() => {});
    if (playing || recording) holdWake();
  });
  if (navigator.mediaSession) {
    try {
      navigator.mediaSession.setActionHandler("play", () => {
        if (!playing) togglePlay();
      });
      navigator.mediaSession.setActionHandler("pause", () => {
        if (playing) stop(false);
      });
    } catch (_) {}
  }
  if (jamOnEl) {
    jamOnEl.onchange = () => {
      jamOn = !!jamOnEl.checked;
      paintJam();
      savePrefs();
    };
  }
  if (jamApply) jamApply.onclick = applyJamText;
  if (jamProgEl) {
    jamProgEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        applyJamText();
      }
    });
  }
  if (jamDown) jamDown.onclick = () => bumpTranspose(-1);
  if (jamUp) jamUp.onclick = () => bumpTranspose(1);
  metroBtn.onclick = () => {
    metroOn = !metroOn;
    syncVolUI();
    savePrefs();
  };
  meterSel.onchange = () => {
    beatsPerBar = parseInt(meterSel.value, 10) || 4;
    savePrefs();
  };
  countInEl.onchange = savePrefs;
  keepTempoEl.onchange = savePrefs;

  document.addEventListener("keydown", (e) => {
    if (e.target && /input|select|textarea/i.test(e.target.tagName)) return;
    if (e.code === "Space") {
      e.preventDefault();
      togglePlay();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setBpm(bpm + 1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setBpm(bpm - 1);
    }
  });
})();
