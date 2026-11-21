// Twin Lanterns — all sound is synthesized with WebAudio oscillators, so the
// game ships no audio files at all. Sounds start only after a user gesture.

let audioCtx = null;
let muted = false;

export function isMuted() {
  return muted;
}

export function setMuted(value) {
  muted = Boolean(value);
}

function ctx() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function tone(freq, startIn, dur, type, vol, slideTo) {
  if (muted) return;
  const ac = ctx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  const t0 = ac.currentTime + startIn;
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export function soundClick() {
  tone(660, 0, 0.07, 'sine', 0.12);
}

export function soundFound() {
  tone(523.25, 0, 0.12, 'triangle', 0.2);
  tone(659.25, 0.09, 0.12, 'triangle', 0.2);
  tone(783.99, 0.18, 0.22, 'triangle', 0.22);
}

export function soundWrong() {
  tone(180, 0, 0.18, 'sawtooth', 0.1, 110);
}

export function soundHint() {
  tone(880, 0, 0.1, 'sine', 0.14);
  tone(1174.66, 0.08, 0.16, 'sine', 0.14);
}

export function soundRoundClear() {
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((f, i) => tone(f, i * 0.11, 0.2, 'triangle', 0.2));
}

export function soundGameComplete() {
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98];
  notes.forEach((f, i) => tone(f, i * 0.12, 0.26, 'triangle', 0.2));
}

export function soundTick() {
  tone(980, 0, 0.05, 'square', 0.05);
}
