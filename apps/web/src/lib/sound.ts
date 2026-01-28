
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
    if (!audioContext) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
            audioContext = new AudioContextClass();
        }
    }
    return audioContext;
};

const playTone = (frequency: number, duration: number, type: OscillatorType = 'sine', startTime = 0) => {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Ensure context is running (sometimes needed if created in suspended state)
    if (ctx.state === 'suspended') {
        ctx.resume().catch(console.error);
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    const now = ctx.currentTime + startTime;

    oscillator.start(now);

    // Smooth attack and release
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05); // Attack
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration); // Release

    oscillator.stop(now + duration);
};

export const playFocusEndSound = () => {
    // Two dings
    // Ding 1
    playTone(880, 0.3, 'sine', 0);
    // Ding 2 (slightly longer)
    playTone(880, 0.6, 'sine', 0.4);
};

export const playBreakEndSound = () => {
    // One ding (Lower pitch)
    playTone(440, 0.8, 'sine', 0);
};
