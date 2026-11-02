// Web Audio API Procedural Retro Balatro/Alchemical Lo-Fi Synth Music Engine

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let isPlaying = false;
let currentVolume = 0.35; // default 35%
let timerId: number | null = null;
let currentStep = 0;

// Musical scale & chord definitions for ambient alchemical mystery (D minor pentatonic / Dorian)
const BPM = 92;
const STEP_TIME = (60 / BPM) / 4; // 16th notes

// Frequency map (Hz)
const NOTES: Record<string, number> = {
  'D2': 73.42, 'F2': 87.31, 'G2': 98.00, 'A2': 110.00, 'Bb2': 116.54, 'C3': 130.81,
  'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'Bb3': 233.08, 'C4': 261.63,
  'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'C5': 523.25, 'D5': 587.33
};

// 4-Bar Chord Progression
const CHORDS = [
  { name: 'Dm9', bass: NOTES['D2'], pad: [NOTES['D3'], NOTES['F3'], NOTES['A3'], NOTES['C4'], NOTES['E4']] },
  { name: 'Bbmaj7', bass: NOTES['Bb2'], pad: [NOTES['Bb2'], NOTES['D3'], NOTES['F3'], NOTES['A3'], NOTES['D4']] },
  { name: 'Fmaj7', bass: NOTES['F2'], pad: [NOTES['F2'], NOTES['A2'], NOTES['C3'], NOTES['E3'], NOTES['A3']] },
  { name: 'Cadd9', bass: NOTES['C3'], pad: [NOTES['C3'], NOTES['E3'], NOTES['G3'], NOTES['Bb3'], NOTES['D4']] },
];

// Arpeggio patterns over 16 steps per bar
const ARPEGGIO_PATTERN = [
  'D4', 'F4', 'A4', 'D5', 'A4', 'F4', 'D4', 'A3',
  'F4', 'A4', 'C5', 'A4', 'F4', 'D4', 'A4', 'F4'
];

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function startMusic() {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (isPlaying) return;
  isPlaying = true;

  if (!masterGain) {
    masterGain = ctx.createGain();
    
    // Add warm low-pass filter for retro analog chill vibe
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1800; // soft warm top-end
    
    masterGain.connect(filter);
    filter.connect(ctx.destination);
  }

  masterGain.gain.setValueAtTime(currentVolume, ctx.currentTime);

  currentStep = 0;
  scheduleNextStep();
}

function scheduleNextStep() {
  if (!isPlaying || !audioCtx || !masterGain) return;

  const now = audioCtx.currentTime;
  const barIndex = Math.floor((currentStep / 16) % CHORDS.length);
  const stepInBar = currentStep % 16;
  const currentChord = CHORDS[barIndex];

  // 1. Bassline (Plays on step 0, 6, 10, 12)
  if (stepInBar === 0 || stepInBar === 6 || stepInBar === 10) {
    playBassNote(currentChord.bass, now, stepInBar === 0 ? 0.6 : 0.35);
  }

  // 2. Warm Ambient Pad Chords (Sustained at bar start)
  if (stepInBar === 0) {
    playPadChord(currentChord.pad, now, 16 * STEP_TIME * 0.95);
  }

  // 3. Arpeggio Lead (Plays on various 16th notes for melodic movement)
  if ([0, 2, 4, 6, 8, 10, 12, 14].includes(stepInBar)) {
    const noteName = ARPEGGIO_PATTERN[stepInBar];
    if (NOTES[noteName]) {
      playArpNote(NOTES[noteName], now);
    }
  }

  // 4. Soft Percussive Chemistry Bubble / Hi-Hat Tick
  if (stepInBar % 2 === 0) {
    playPercussionTick(now, stepInBar % 4 === 2 ? 0.03 : 0.015);
  }

  currentStep++;

  // Schedule next step
  timerId = window.setTimeout(scheduleNextStep, STEP_TIME * 1000);
}

function playBassNote(freq: number, startTime: number, durationMultiplier = 0.5) {
  if (!audioCtx || !masterGain) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, startTime);

  const duration = STEP_TIME * 3 * durationMultiplier;
  gain.gain.setValueAtTime(0.25, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.connect(gain);
  gain.connect(masterGain);

  osc.start(startTime);
  osc.stop(startTime + duration);
}

function playPadChord(freqs: number[], startTime: number, duration: number) {
  if (!audioCtx || !masterGain) return;

  freqs.forEach((freq) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(0.035, startTime + 0.4); // slow attack
    gain.gain.linearRampToValueAtTime(0.02, startTime + duration - 0.4);
    gain.gain.linearRampToValueAtTime(0.001, startTime + duration); // smooth release

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration);
  });
}

function playArpNote(freq: number, startTime: number) {
  if (!audioCtx || !masterGain) return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, startTime);

  const duration = STEP_TIME * 1.5;
  gain.gain.setValueAtTime(0.04, startTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(masterGain);

  osc.start(startTime);
  osc.stop(startTime + duration);
}

function playPercussionTick(startTime: number, volume = 0.02) {
  if (!audioCtx || !masterGain) return;

  // Subtle chemistry bubble / soft tick sound
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(1200 + Math.random() * 400, startTime);
  osc.frequency.exponentialRampToValueAtTime(300, startTime + 0.03);

  gain.gain.setValueAtTime(volume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.03);

  osc.connect(gain);
  gain.connect(masterGain);

  osc.start(startTime);
  osc.stop(startTime + 0.03);
}

export function stopMusic() {
  isPlaying = false;
  if (timerId !== null) {
    clearTimeout(timerId);
    timerId = null;
  }
  if (masterGain && audioCtx) {
    masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
  }
}

export function setMusicVolume(vol: number) {
  currentVolume = Math.max(0, Math.min(1, vol));
  if (masterGain && audioCtx && isPlaying) {
    masterGain.gain.setValueAtTime(currentVolume, audioCtx.currentTime);
  }
}

export function getMusicVolume(): number {
  return currentVolume;
}

export function isMusicPlaying(): boolean {
  return isPlaying;
}

export function toggleMusic(): boolean {
  if (isPlaying) {
    stopMusic();
    return false;
  } else {
    startMusic();
    return true;
  }
}
