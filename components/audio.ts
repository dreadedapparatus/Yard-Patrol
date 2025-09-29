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
 * This combines a tonal square wave, a filter envelope, and a noise burst for a more authentic sound.
 */
export const playBarkSound = () => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const barkLength = 0.2;

    // The main tonal component of the bark
    const osc = ctx.createOscillator();
    osc.type = 'square'; // Square wave provides a harsher, more complex tone

    // Pitch envelope: A sharp drop in pitch
    osc.frequency.setValueAtTime(350, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.05);
    osc.frequency.linearRampToValueAtTime(100, now + barkLength * 0.8);

    // The filter will shape the tone to sound more organic
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.Q.value = 2; // A slight resonance

    // Filter envelope: Starts open for a sharp attack, then closes to muffle the sound
    filter.frequency.setValueAtTime(4000, now);
    filter.frequency.exponentialRampToValueAtTime(400, now + 0.07);
    filter.frequency.linearRampToValueAtTime(200, now + barkLength);

    // The main volume envelope for the bark
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.5, now + 0.01); // Very fast attack
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + barkLength);

    // Routing: Oscillator -> Filter -> Gain -> Output
    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + barkLength);

    // A separate noise burst for the initial percussive "b" sound
    const noise = ctx.createBufferSource();
    const bufferSize = ctx.sampleRate * 0.1;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.5; // reduce noise amplitude
    }
    noise.buffer = buffer;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(0.3, now + 0.005);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    // Routing: Noise -> Gain -> Output
    noise.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    
    noise.start(now);
    noise.stop(now + 0.1);
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
    gainNode.gain.value = 0.15; // Lower volume to avoid being too harsh

    oscillator.connect(gainNode).connect(ctx.destination);
    
    // Create a series of high-pitched chirps
    const chirpLength = 0.06;
    for (let i = 0; i < 5; i++) {
        const startTime = now + i * (chirpLength + 0.02);
        const pitch = 1800 + Math.random() * 400;
        oscillator.frequency.setValueAtTime(pitch, startTime);
        gainNode.gain.setValueAtTime(0.15, startTime);
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
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
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
    gainNode.gain.linearRampToValueAtTime(0.7, now + 0.01); // Louder attack
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
    noiseGain.gain.linearRampToValueAtTime(0.4, now + 0.005); // Very short and sharp
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    noise.connect(bandpass).connect(noiseGain).connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.05);
};