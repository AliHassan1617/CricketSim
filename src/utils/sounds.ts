/** Web Audio API sound effects and ambient music — no audio files needed */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  try {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** White-noise burst filtered into a crowd roar that rises or falls */
function noiseBurst(
  duration: number,
  freqStart: number,
  freqEnd: number,
  vol: number,
) {
  const a = getCtx();
  if (!a) return;

  const sr  = a.sampleRate;
  const buf = a.createBuffer(2, Math.ceil(sr * duration), sr);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }

  const src = a.createBufferSource();
  src.buffer = buf;

  const bpf = a.createBiquadFilter();
  bpf.type = "bandpass";
  bpf.frequency.setValueAtTime(freqStart, a.currentTime);
  bpf.frequency.linearRampToValueAtTime(freqEnd, a.currentTime + duration * 0.45);
  bpf.Q.value = 1.8;

  const gain = a.createGain();
  gain.gain.setValueAtTime(0, a.currentTime);
  gain.gain.linearRampToValueAtTime(vol, a.currentTime + 0.09);
  gain.gain.setValueAtTime(vol, a.currentTime + duration * 0.35);
  gain.gain.exponentialRampToValueAtTime(0.001, a.currentTime + duration);

  src.connect(bpf);
  bpf.connect(gain);
  gain.connect(a.destination);
  src.start();
  src.stop(a.currentTime + duration + 0.05);
}

/** Rising-pitch sting tone */
function sting(freqStart: number, freqEnd: number, duration: number, vol: number) {
  const a = getCtx();
  if (!a) return;
  const osc = a.createOscillator();
  const g   = a.createGain();
  osc.connect(g);
  g.connect(a.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(freqStart, a.currentTime);
  osc.frequency.linearRampToValueAtTime(freqEnd, a.currentTime + duration * 0.6);
  g.gain.setValueAtTime(vol, a.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + duration);
  osc.start(a.currentTime);
  osc.stop(a.currentTime + duration);
}

/**
 * Crowd cheer — rising excitement.
 * Play when: user bats a SIX, or user's team takes a WICKET.
 */
export function playCheer() {
  noiseBurst(1.5, 500, 2400, 0.22);
  sting(220, 440, 0.45, 0.07);
}

/**
 * Crowd groan — disappointed, falling pitch.
 * Play when: user loses a WICKET while batting, or concedes a SIX while bowling.
 */
export function playGroan() {
  noiseBurst(1.0, 450, 160, 0.18);
  sting(300, 140, 0.55, 0.06);
}

// ── Ambient crowd hum ─────────────────────────────────────────────────────────

interface AmbientNodes {
  src: AudioBufferSourceNode;
  gainNode: GainNode;
}
let ambient: AmbientNodes | null = null;

/**
 * Start a continuous low-level crowd buzz — looping filtered white noise that
 * sounds like tens of thousands of people murmuring between deliveries.
 * Call once when the MatchScreen mounts; safe to call multiple times.
 */
export function startAmbientCrowd() {
  const a = getCtx();
  if (!a || ambient) return;

  const sr       = a.sampleRate;
  const duration = 6; // seconds — long enough for smooth looping
  const buf = a.createBuffer(2, Math.ceil(sr * duration), sr);

  // Fill with white noise — different per channel for stereo width
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    // Apply simple pink-noise shaping (integrate white noise slightly)
    let prev = 0;
    for (let i = 0; i < d.length; i++) {
      const w = Math.random() * 2 - 1;
      prev = 0.97 * prev + 0.03 * w;     // very gentle low-pass → warmer rumble
      d[i] = prev * 3.5;                  // scale back up (gain lost in filtering)
    }
  }

  const src = a.createBufferSource();
  src.buffer = buf;
  src.loop   = true;

  // Low-pass: removes harsh hiss, keeps the warm crowd body
  const lpf = a.createBiquadFilter();
  lpf.type            = "lowpass";
  lpf.frequency.value = 900;
  lpf.Q.value         = 0.7;

  // Second band-pass centred on crowd speech frequencies (~400 Hz)
  const bpf = a.createBiquadFilter();
  bpf.type            = "bandpass";
  bpf.frequency.value = 420;
  bpf.Q.value         = 0.6;

  const gainNode = a.createGain();
  gainNode.gain.setValueAtTime(0, a.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.07, a.currentTime + 2.0); // slow fade-in

  src.connect(lpf);
  lpf.connect(bpf);
  bpf.connect(gainNode);
  gainNode.connect(a.destination);
  src.start();

  ambient = { src, gainNode };
}

/**
 * Fade out and stop the ambient crowd loop.
 * Call when MatchScreen unmounts or match ends.
 */
export function stopAmbientCrowd() {
  if (!ambient) return;
  const a = getCtx();
  const { src, gainNode } = ambient;
  ambient = null;
  if (a) {
    gainNode.gain.setValueAtTime(gainNode.gain.value, a.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 1.2);
    setTimeout(() => { try { src.stop(); } catch { /* already stopped */ } }, 1400);
  } else {
    try { src.stop(); } catch { /* ignore */ }
  }
}

// ── Menu / lobby ambient music ─────────────────────────────────────────────

interface MenuMusicState {
  masterGain: GainNode;
  oscillators: OscillatorNode[];
  stopArp: () => void;
}
let menuMusic: MenuMusicState | null = null;

// D-minor pentatonic melody (D4, F4, G4, A4, C5) — ascends then descends
const MENU_ARP = [293.66, 349.23, 392.00, 440.00, 523.25, 440.00, 392.00, 349.23];

/**
 * Start layered ambient music for all menu / setup / summary screens.
 * Safe to call multiple times — only one instance runs at a time.
 */
export function startMenuMusic() {
  const a = getCtx();
  if (!a || menuMusic) return;

  const masterGain = a.createGain();
  masterGain.gain.setValueAtTime(0, a.currentTime);
  masterGain.gain.linearRampToValueAtTime(0.13, a.currentTime + 3.5); // slow fade-in
  masterGain.connect(a.destination);

  const oscillators: OscillatorNode[] = [];

  function addPad(freq: number, type: OscillatorType, vol: number, detune = 0) {
    const osc = a!.createOscillator();
    const g   = a!.createGain();
    osc.type            = type;
    osc.frequency.value = freq;
    osc.detune.value    = detune;
    g.gain.value        = vol;
    osc.connect(g);
    g.connect(masterGain);
    osc.start();
    oscillators.push(osc);
  }

  // Bass drone — D2 (two slightly detuned sines for warmth)
  addPad(73.42, "sine", 0.55);
  addPad(73.42, "sine", 0.22, 6);

  // Pad chord — Dm (D3, F3, A3)
  addPad(146.83, "triangle", 0.26);
  addPad(174.61, "sine",     0.20);
  addPad(220.00, "sine",     0.17);

  // High shimmer — D5
  addPad(587.33, "sine", 0.055);

  // ── Feedback delay for the arpeggio ─────────────────────────────────────
  const delay       = a.createDelay(1.0);
  delay.delayTime.value = 0.42;

  const fbGain = a.createGain();
  fbGain.gain.value = 0.36;

  const delayLpf = a.createBiquadFilter();
  delayLpf.type            = "lowpass";
  delayLpf.frequency.value = 1600;

  delay.connect(delayLpf);
  delayLpf.connect(fbGain);
  fbGain.connect(delay);
  delay.connect(masterGain);

  // ── Arpeggio ─────────────────────────────────────────────────────────────
  let arpIdx  = 0;
  let stopped = false;

  function playArpNote() {
    if (stopped) return;
    const a2 = getCtx();
    if (!a2) return;

    const osc = a2.createOscillator();
    const g   = a2.createGain();
    osc.type            = "triangle";
    osc.frequency.value = MENU_ARP[arpIdx % MENU_ARP.length];
    arpIdx++;

    const len = 1.0;
    g.gain.setValueAtTime(0,    a2.currentTime);
    g.gain.linearRampToValueAtTime(0.09, a2.currentTime + 0.04);
    g.gain.setValueAtTime(0.09, a2.currentTime + len * 0.5);
    g.gain.exponentialRampToValueAtTime(0.001, a2.currentTime + len);

    osc.connect(g);
    g.connect(delay); // routed through the delay for echo tail
    osc.start(a2.currentTime);
    osc.stop(a2.currentTime + len + 0.1);
  }

  playArpNote();
  const arpTimer = setInterval(playArpNote, 1250);

  menuMusic = {
    masterGain,
    oscillators,
    stopArp: () => { stopped = true; clearInterval(arpTimer); },
  };
}

/**
 * Fade out and stop the menu music.
 * Call when transitioning into active gameplay.
 */
export function stopMenuMusic() {
  if (!menuMusic) return;
  const a = getCtx();
  const { masterGain, oscillators, stopArp } = menuMusic;
  menuMusic = null;
  stopArp();
  if (a) {
    masterGain.gain.setValueAtTime(masterGain.gain.value, a.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 1.8);
    setTimeout(() => {
      oscillators.forEach(osc => { try { osc.stop(); } catch { /* already gone */ } });
      try { masterGain.disconnect(); } catch { /* ignore */ }
    }, 2100);
  } else {
    oscillators.forEach(osc => { try { osc.stop(); } catch { /* ignore */ } });
  }
}
