import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { playFocusEndSound, playBreakEndSound } from '../lib/sound';

export type PomodoroMode = 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK';

interface PomodoroState {
    timeLeft: number; // in seconds
    isActive: boolean;
    mode: PomodoroMode;
    totalSessions: number;

    startTimer: () => void;
    pauseTimer: () => void;
    resetTimer: () => void;
    setMode: (mode: PomodoroMode) => void;
    tick: () => void;
}

const DURATIONS = {
    FOCUS: 25 * 60,
    SHORT_BREAK: 5 * 60,
    LONG_BREAK: 15 * 60,
};

export const usePomodoroStore = create<PomodoroState>()(
    persist(
        (set, get) => ({
            timeLeft: DURATIONS.FOCUS,
            isActive: false,
            mode: 'FOCUS',
            totalSessions: 0,

            startTimer: () => set({ isActive: true }),
            pauseTimer: () => set({ isActive: false }),
            resetTimer: () => {
                const { mode } = get();
                set({ isActive: false, timeLeft: DURATIONS[mode] });
            },
            setMode: (mode) => set({ mode, timeLeft: DURATIONS[mode], isActive: false }),

            tick: () => {
                const { timeLeft, isActive, mode, totalSessions } = get();
                if (!isActive) return;

                if (timeLeft > 0) {
                    set({ timeLeft: timeLeft - 1 });
                } else {
                    // Timer finished
                    set({ isActive: false });

                    // Logic to auto-switch or notify could go here
                    if (mode === 'FOCUS') {
                        set({ totalSessions: totalSessions + 1 });
                        // Notify?
                        new Notification("Pomodoro Complete!", { body: "Time for a break." });
                        playFocusEndSound();
                    } else {
                        new Notification("Break Over!", { body: "Ready to focus?" });
                        playBreakEndSound();
                    }
                }
            },
        }),
        {
            name: 'pomodoro-storage',
            partialize: (state) => ({
                mode: state.mode,
                totalSessions: state.totalSessions
                // Don't persist timeLeft/isActive perfectly across reloads to avoid confusion? 
                // Actually users might like persisting timeLeft.
                // Let's persist all for now.
            }),
        }
    )
);
