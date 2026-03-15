// Timer completion sound & vibration utilities
// Uses Web Audio API — no external audio files needed, works fully offline in PWA

let audioCtx: AudioContext | null = null;

/**
 * Get or create the singleton AudioContext.
 * Must be called within a user gesture on iOS.
 */
function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  // Resume if suspended (iOS suspends AudioContext until user gesture)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a gentle meditation bell/chime.
 * Creates a C major chord (C5 + E5 + G5) with smooth exponential fade-out.
 */
export function playTimerChime(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    // C major chord frequencies for a rich, warm bell tone
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
    const duration = 1.8;

    frequencies.forEach((freq, i) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(freq, now);

      // Root note louder, upper harmonics softer for warmth
      const baseVolume = i === 0 ? 0.12 : 0.06;
      gainNode.gain.setValueAtTime(0, now);
      // Quick fade in (25ms) — avoids click
      gainNode.gain.linearRampToValueAtTime(baseVolume, now + 0.025);
      // Smooth exponential fade out — natural bell decay
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(now);
      oscillator.stop(now + duration);
    });
  } catch {
    // Silently fail — audio is enhancement, not critical
  }
}

/**
 * Warm up the AudioContext on first user interaction.
 * Call this on timer start to ensure iOS compatibility.
 */
export function warmUpAudio(): void {
  try {
    getAudioContext();
  } catch {
    // ignore
  }
}

/**
 * Trigger a gentle vibration pattern.
 * Pattern: vibrate 200ms, pause 100ms, vibrate 200ms
 * No-op on devices that don't support it (iOS Safari).
 */
export function triggerVibration(): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([200, 100, 200]);
    } catch {
      // Silently fail
    }
  }
}
