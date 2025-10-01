// This file contains functions to generate and play sound effects using the Web Audio API.

// A single AudioContext is created and reused. It's initialized on the first user 
// interaction to comply with modern browser autoplay policies.
let audioContext: AudioContext | null = null;
let hasInitialized = false;
let isMuted = false;

/**
 * Sets the global mute state for all sound effects.
 * @param muted - Whether audio should be muted.
 */
export const setAudioMuted = (muted: boolean) => {
    isMuted = muted;
};

const getAudioContext = (): AudioContext | null => {
    if (!audioContext && typeof window !== 'undefined') {
        try {
            audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            console.error("Web Audio API is not supported in this browser");
            return null;
        }
    }
    return audioContext;
};

/**
 * Initializes the audio context. Must be called after a user interaction (e.g., a click).
 */
export const initAudio = () => {
    if (hasInitialized) return;
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
        ctx.resume();
    }
    hasInitialized = true;
};

/**
 * Plays a more realistic "bark" sound effect.
 * This combines a tonal sawtooth wave with a noise burst for a more authentic sound.
 */
export const playBarkSound = () => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Tonal part of the bark (the "woof")
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth'; // A bit gritty, like a real bark
    osc.frequency.setValueAtTime(220, now); // Start at a low-ish pitch
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.05); // Quick drop in pitch

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, now);
    // Increased volume for more punch
    gainNode.gain.linearRampToValueAtTime(0.7, now + 0.01); // Very fast attack
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15); // Decay quickly

    osc.connect(gainNode).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);

    // Add a short burst of noise for the sharp "b" sound at the beginning
    const noise = ctx.createBufferSource();
    const bufferSize = ctx.sampleRate * 0.05;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    noise.buffer = buffer;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0, now);
    // Increased volume for more punch
    noiseGain.gain.linearRampToValueAtTime(0.3, now + 0.005); // Very short, sharp attack
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05); // And gone

    noise.connect(noiseGain).connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.05);
};


/**
 * Plays a high-pitched, chattering "squirrel laugh" sound effect.
 * This is simulated with a high-frequency square-wave oscillator that rapidly changes pitch.
 */
export const playSquirrelLaughSound = () => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    oscillator.type = 'square';

    const gainNode = ctx.createGain();
    // Adjusted volume for better balance
    gainNode.gain.value = 0.25;

    oscillator.connect(gainNode).connect(ctx.destination);
    
    // Create a series of high-pitched chirps
    const chirpLength = 0.06;
    for (let i = 0; i < 5; i++) {
        const startTime = now + i * (chirpLength + 0.02);
        const pitch = 1800 + Math.random() * 400;
        oscillator.frequency.setValueAtTime(pitch, startTime);
        gainNode.gain.setValueAtTime(0.25, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + chirpLength);
    }

    oscillator.start(now);
    oscillator.stop(now + 0.5);
};

/**
 * Plays a classic ascending arpeggio for a "power-up" effect.
 * This is simulated with a triangle-wave oscillator playing a quick sequence of rising notes.
 */
export const playPowerUpSound = () => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    oscillator.type = 'triangle'; // Smoother sound

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, now);
    // Adjusted volume for better balance
    gainNode.gain.linearRampToValueAtTime(0.4, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);

    oscillator.connect(gainNode).connect(ctx.destination);

    // Play a rising sequence of notes
    const baseFreq = 440; // A4
    oscillator.frequency.setValueAtTime(baseFreq, now);
    oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 1.25, now + 0.1); 
    oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.2);  
    oscillator.frequency.exponentialRampToValueAtTime(baseFreq * 2, now + 0.3);

    oscillator.start(now);
    oscillator.stop(now + 0.4);
};

/**
 * Plays a more impactful "pow" sound for when a squirrel is caught.
 * This combines a low-frequency thump with a high-frequency click.
 */
export const playSquirrelCatchSound = () => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // The "thump" part - a fast-decaying sine wave
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now); // Low frequency for the "thump"
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, now);
    // Reduced volume to be less fatiguing on repeat plays
    gainNode.gain.linearRampToValueAtTime(0.5, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gainNode).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);

    // The "click" part - a short burst of high-passed noise
    const noise = ctx.createBufferSource();
    const bufferSize = ctx.sampleRate * 0.05;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    noise.buffer = buffer;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'highpass';
    bandpass.frequency.value = 1000; // Only let high frequencies through for a "click"

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0, now);
    // Reduced volume to be less fatiguing on repeat plays
    noiseGain.gain.linearRampToValueAtTime(0.25, now + 0.005); // Very short and sharp
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    noise.connect(bandpass).connect(noiseGain).connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.05);
};

/**
 * Plays a "cha-ching" like sound for catching the mailman.
 * Uses two sine waves to create a pleasant interval.
 */
export const playMailmanCatchSound = () => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const duration = 0.2;
    const volume = 0.4;

    // First note
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now); // A5

    const gain1 = ctx.createGain();
    gain1.gain.setValueAtTime(volume, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc1.connect(gain1).connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + duration);

    // Second note (a major third above)
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1108.73, now + 0.08); // C#6

    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(volume, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.08 + duration);

    osc2.connect(gain2).connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.08 + duration);
};

/**
 * Plays a frantic "squawk" sound for when a bird is scared.
 * Uses a high-frequency, quickly modulated sine wave.
 */
export const playBirdScareSound = () => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const duration = 0.2;
    const volume = 0.3;

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    
    // Start high and flutter down and up
    osc.frequency.setValueAtTime(1500, now);
    osc.frequency.linearRampToValueAtTime(1200, now + duration * 0.5);
    osc.frequency.linearRampToValueAtTime(1800, now + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
};

/**
 * Plays a quick, "bouncy" sound for the zoomies power-up.
 */
export const playZoomiesSound = () => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.5, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
    osc.frequency.exponentialRampToValueAtTime(700, now + 0.2);

    osc.connect(gainNode).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
};

/**
 * Plays a "hissing" spray sound for the skunk game over.
 * Uses filtered white noise.
 */
export const playSkunkSpraySound = () => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const duration = 0.4;

    // White noise for the "spray"
    const noise = ctx.createBufferSource();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    noise.buffer = buffer;
    
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 1500;
    bandpass.Q.value = 0.8;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(0.4, now + 0.02); // Sharp attack
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(bandpass).connect(noiseGain).connect(ctx.destination);
    noise.start(now);
    noise.stop(now + duration);
};
