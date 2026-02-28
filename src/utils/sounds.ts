/** Web Audio API sound effects — no audio files needed */

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
