import React, { useEffect } from 'react';
import { usePomodoroStore } from '../stores/usePomodoroStore';
import clsx from 'clsx';

// Wait, I don't recall installing lucide-react. I should use simple SVGs or text to be safe in MVP.

export const PomodoroTimer: React.FC = () => {
    const { timeLeft, isActive, mode, startTimer, pauseTimer, resetTimer, setMode, tick } = usePomodoroStore();

    useEffect(() => {
        const interval = setInterval(() => {
            tick();
        }, 1000);
        return () => clearInterval(interval);
    }, [tick]);

    // Request notification permission
    useEffect(() => {
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex items-center gap-4 bg-tertiary p-2 rounded-lg border border-border">
            {/* Mode Selectors */}
            <div className="flex gap-1">
                <button
                    onClick={() => setMode('FOCUS')}
                    className={clsx("p-1 rounded text-xs font-bold transition", mode === 'FOCUS' ? "bg-red-500/20 text-red-500" : "text-primary-muted hover:text-primary")}
                    title="Focus (25m)"
                >
                    F
                </button>
                <button
                    onClick={() => setMode('SHORT_BREAK')}
                    className={clsx("p-1 rounded text-xs font-bold transition", mode === 'SHORT_BREAK' ? "bg-green-500/20 text-green-500" : "text-primary-muted hover:text-primary")}
                    title="Short Break (5m)"
                >
                    S
                </button>
                <button
                    onClick={() => setMode('LONG_BREAK')}
                    className={clsx("p-1 rounded text-xs font-bold transition", mode === 'LONG_BREAK' ? "bg-blue-500/20 text-blue-500" : "text-primary-muted hover:text-primary")}
                    title="Long Break (15m)"
                >
                    L
                </button>
            </div>

            {/* Timer Display */}
            <div className="font-mono text-xl font-bold min-w-[60px] text-center text-primary">
                {formatTime(timeLeft)}
            </div>

            {/* Controls */}
            <div className="flex gap-2">
                {!isActive ? (
                    <button onClick={startTimer} className="p-1 hover:bg-accent/20 rounded text-accent transition">
                        {/* Play Icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                    </button>
                ) : (
                    <button onClick={pauseTimer} className="p-1 hover:bg-yellow-500/20 rounded text-yellow-500 transition">
                        {/* Pause Icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
                    </button>
                )}
                <button onClick={resetTimer} className="p-1 hover:bg-red-500/20 rounded text-red-400 transition">
                    {/* Reset Icon */}
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
                </button>
            </div>
        </div>
    );
};
