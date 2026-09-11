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
    kick_s: "static/loopz/kit/kick_s.mp3",
    kick_h: "static/loopz/kit/kick_h.mp3",
    kick_h2: "static/loopz/kit/kick_h2.mp3",
    snare_g: "static/loopz/kit/snare_g.mp3",
    snare_m: "static/loopz/kit/snare_m.mp3",
    snare_h: "static/loopz/kit/snare_h.mp3",
    rim: "static/loopz/kit/rim.mp3",
    hat_s: "static/loopz/kit/hat_s.mp3",
    hat_h: "static/loopz/kit/hat_h.mp3",
    hat_h2: "static/loopz/kit/hat_h2.mp3",
    open: "static/loopz/kit/open.mp3",
    ride: "static/loopz/kit/ride.mp3",
    tom: "static/loopz/kit/tom.mp3",
  };

  const playBtn = document.getElementById("playBtn");
  const tapBtn = document.getElementById("tapBtn");
  const metroBtn = document.getElementById("metroBtn");
  const tempoEl = document.getElementById("tempo");
  const bpmNum = document.getElementById("bpmNum");
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

  let ctx = null;
  let masterGain = null;
  let metroGain = null;
  let roomGain = null;
  let pianoGain = null;
  let bassGain = null;
  let voiceGain = {};
  let buffers = {};
  let kitReady = false;
  let kitLoading = null;
  let rr = { kick: 0, hat: 0 };
  let openHatGain = null;
  let playing = false;
  let timerId = null;
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
  let pianoVol = 0.7;
  let bassVol = 0.8;
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
      masterGain.connect(ctx.destination);
      masterGain.connect(delay);
      delay.connect(lp);
      lp.connect(fb);
      fb.connect(delay);
      lp.connect(roomGain);
      roomGain.connect(ctx.destination);
      metroGain.connect(ctx.destination);
      pianoGain = ctx.createGain();
      bassGain = ctx.createGain();
      pianoGain.gain.value = pianoVol;
      bassGain.gain.value = bassVol;
      pianoGain.connect(ctx.destination);
      bassGain.connect(ctx.destination);
      VOICES.forEach((v) => {
        const g = ctx.createGain();
        g.gain.value = muted[v.id] ? 0 : voiceVol[v.id];
        g.connect(masterGain);
        voiceGain[v.id] = g;
      });
    }
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
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
    const drums = loop.drums || {};
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
    if (drumsOn) playJam(step, time);
    if (metroOn && isMetroBeat(step)) playClick(time, isDownbeat(step));
    uiQueue.push({ step, time, bar: currentBar });
  }

  function scheduler() {
    if (!playing || !ctx) return;
    const ahead = 0.12;
    while (nextStepTime < ctx.currentTime + ahead) {
      const wasCounting = countInLeft > 0;
      scheduleStep(currentStep, nextStepTime + swingOffset(currentStep));
      nextStepTime += stepDuration();
      currentStep = (currentStep + 1) % 16;
      if (countInLeft > 0) countInLeft -= 1;
      if (!wasCounting && currentStep === 0 && jamChords.length) {
        currentBar = (currentBar + 1) % jamChords.length;
      }
    }
    timerId = setTimeout(scheduler, 25);
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
    bpmNum.textContent = String(bpm);
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
    if (!keepTempoEl.checked) setBpm(loop.bpm, true);
    nowName.textContent = loop.name;
    nowMeta.textContent =
      loop.genre +
      " · 4/4" +
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
        loop.genre + " · " + loop.bpm + " BPM" + (loop.swing ? " · swing" : "");
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
    if (pianoVolVal) pianoVolVal.textContent = Math.round(pianoVol * 100) + "%";
    if (bassVolVal) bassVolVal.textContent = Math.round(bassVol * 100) + "%";
    if (jamProgEl) jamProgEl.value = jamChords.join(" ");
    meterSel.value = String(beatsPerBar);
    tempoEl.value = String(bpm);
    bpmNum.textContent = String(bpm);
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
