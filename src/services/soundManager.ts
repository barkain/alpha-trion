// ── Sound Manager — Web Audio API synthesis (no external files) ──

export type SoundId = "correct" | "wrong" | "streak" | "levelUp" | "click" | "unlock";

let ctx: AudioContext | null = null;
let muted = false;

export function preloadSounds(): void {
  if (ctx) return;
  ctx = new AudioContext();
}

export function setMuted(m: boolean): void {
  muted = m;
}

export function isMuted(): boolean {
  return muted;
}

export function playSound(id: SoundId): void {
  if (muted) return;
  if (!ctx) {
    try {
      ctx = new AudioContext();
    } catch {
      return;
    }
  }
  const ac = ctx;
  if (ac.state === "suspended") {
    ac.resume().catch(() => {});
  }

  try {
    switch (id) {
      case "correct":
        playCorrect(ac);
        break;
      case "wrong":
        playWrong(ac);
        break;
      case "streak":
        playStreak(ac);
        break;
      case "levelUp":
        playLevelUp(ac);
        break;
      case "click":
        playClick(ac);
        break;
      case "unlock":
        playUnlock(ac);
        break;
    }
  } catch {
    // Silently ignore audio errors
  }
}

// ── Sound Synthesizers ──

function playNote(ac: AudioContext, freq: number, start: number, dur: number, gain = 0.15, type: OscillatorType = "sine") {
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, ac.currentTime + start);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + start + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(ac.currentTime + start);
  osc.stop(ac.currentTime + start + dur);
}

// Ascending two-note chime (C5→E5)
function playCorrect(ac: AudioContext) {
  playNote(ac, 523.25, 0, 0.2, 0.12);
  playNote(ac, 659.25, 0.1, 0.25, 0.12);
}

// Gentle low tone (C3)
function playWrong(ac: AudioContext) {
  playNote(ac, 130.81, 0, 0.4, 0.08, "triangle");
}

// Quick whoosh sweep (400→1200Hz)
function playStreak(ac: AudioContext) {
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(400, ac.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1200, ac.currentTime + 0.25);
  g.gain.setValueAtTime(0.08, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.25);
  osc.connect(g).connect(ac.destination);
  osc.start(ac.currentTime);
  osc.stop(ac.currentTime + 0.25);
}

// 3-note fanfare (C5→E5→G5)
function playLevelUp(ac: AudioContext) {
  playNote(ac, 523.25, 0, 0.2, 0.12);
  playNote(ac, 659.25, 0.15, 0.2, 0.12);
  playNote(ac, 783.99, 0.3, 0.35, 0.15);
}

// Short tick
function playClick(ac: AudioContext) {
  playNote(ac, 800, 0, 0.05, 0.06);
}

// Shimmer sweep up
function playUnlock(ac: AudioContext) {
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(300, ac.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1500, ac.currentTime + 0.4);
  g.gain.setValueAtTime(0.1, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.4);
  osc.connect(g).connect(ac.destination);
  osc.start(ac.currentTime);
  osc.stop(ac.currentTime + 0.4);
}
