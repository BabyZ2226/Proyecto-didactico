// Web Audio API Retro Arcade Synthesizer for Balatro-style click & card sounds

let audioCtx: AudioContext | null = null;
let sfxMuted = false;
let sfxVolume = 1.0;

export const setSfxMuted = (muted: boolean) => {
  sfxMuted = muted;
};

export const isSfxMuted = () => sfxMuted;
export const getSfxMuted = () => sfxMuted;

export const setSfxVolume = (vol: number) => {
  sfxVolume = Math.max(0, Math.min(1, vol));
  sfxMuted = sfxVolume === 0;
};

export const getSfxVolume = () => (sfxMuted ? 0 : sfxVolume);

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

const lastPlayedMap: Record<string, number> = {};

export const playBalatroSound = (type: 'hover' | 'click' | 'play' | 'deal' | 'bubble' | 'select' = 'click') => {
  if (sfxMuted || sfxVolume <= 0) return;
  const nowMs = Date.now();
  if (lastPlayedMap[type] && nowMs - lastPlayedMap[type] < 25) {
    return; // Rate limit duplicate audio nodes within 25ms
  }
  lastPlayedMap[type] = nowMs;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    if (type === 'hover') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.04);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'click') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.08);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'play') {
      // Chunky Balatro Start Chord
      [440, 554.37, 659.25, 880].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.03);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.2 + i * 0.03);
        gain.gain.setValueAtTime(0.08, now + i * 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35 + i * 0.03);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.03);
        osc.stop(now + 0.35 + i * 0.03);
      });
    } else if (type === 'deal') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.07);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    } else if (type === 'bubble') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(350 + Math.random() * 200, now);
      osc.frequency.exponentialRampToValueAtTime(700 + Math.random() * 300, now + 0.09);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } else if (type === 'select') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.05);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    }
  } catch {
    // AudioContext autoplay restrictions or error ignored
  }
};

// Procedural Horror Jumpscare Sound
export const playJumpscareSound = () => {
  if (sfxMuted || sfxVolume <= 0) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. Sub-bass earthquake drop (rumble & stomach-drop)
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(140, now);
    subOsc.frequency.exponentialRampToValueAtTime(26, now + 0.8);
    subGain.gain.setValueAtTime(0.8 * sfxVolume, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    subOsc.connect(subGain);
    subGain.connect(ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 1.2);

    // 2. Discordant horror cluster screech (dissonant detuned tritones & minor 2nds)
    const screechFreqs = [110, 155.56, 220, 311.13, 622.25, 932.33];
    screechFreqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx % 2 === 0 ? 'sawtooth' : 'square';
      osc.frequency.setValueAtTime(freq * (1 + (Math.random() - 0.5) * 0.04), now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.65, now + 0.7);
      
      gain.gain.setValueAtTime(0.22 * sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      // Lowpass filter to shape the scream
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(3500, now);
      filter.frequency.exponentialRampToValueAtTime(800, now + 0.7);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.85);
    });

    // 3. Noise burst / Screaming breath impact
    const bufferSize = ctx.sampleRate * 0.6;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(2200, now);
    noiseFilter.Q.setValueAtTime(3.5, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(350, now + 0.5);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.45 * sfxVolume, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    whiteNoise.start(now);
    whiteNoise.stop(now + 0.6);

    // 4. Secondary visceral claw slash / metallic impact at +0.12s
    setTimeout(() => {
      try {
        if (!ctx || ctx.state === 'closed') return;
        const hitNow = ctx.currentTime;
        const metalOsc = ctx.createOscillator();
        const metalGain = ctx.createGain();
        metalOsc.type = 'triangle';
        metalOsc.frequency.setValueAtTime(440, hitNow);
        metalOsc.frequency.exponentialRampToValueAtTime(60, hitNow + 0.35);
        metalGain.gain.setValueAtTime(0.5 * sfxVolume, hitNow);
        metalGain.gain.exponentialRampToValueAtTime(0.001, hitNow + 0.4);
        metalOsc.connect(metalGain);
        metalGain.connect(ctx.destination);
        metalOsc.start(hitNow);
        metalOsc.stop(hitNow + 0.4);
      } catch {
        // Safe fallback
      }
    }, 120);

    // 5. Mobile / Device vibration haptics
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([100, 40, 220, 60, 450]);
      } catch {
        // Ignore haptic failures
      }
    }
  } catch {
    // Audio context error safe catch
  }
};
