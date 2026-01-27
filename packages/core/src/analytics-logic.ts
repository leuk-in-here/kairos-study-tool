import { ActivityLog } from './types';

// Helper to normalize date string to YYYY-MM-DD
export function getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
}

export function createActivityLog(type: ActivityLog['type'], referenceId?: string, value: number = 1, metadata?: Record<string, any>): ActivityLog {
    return {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        date: getTodayDate(),
        type,
        referenceId,
        value,
        metadata,
        timestamp: Date.now()
    };
}

/**
 * Calculates current streak based on activity logs.
 * Assumes logs are sorted by date or we sort them.
 * Streak = Consecutive days with at least one activity ending at yesterday or today.
 */
export function calculateStreak(logs: ActivityLog[]): { currentStreak: number; longestStreak: number } {
    if (logs.length === 0) return { currentStreak: 0, longestStreak: 0 };

    // Get unique dates
    const dates = Array.from(new Set(logs.map(l => l.date))).sort();

    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    const today = getTodayDate();
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split('T')[0];

    // Iterate through dates to find consecutive days
    // This simple logic assumes dates are 'YYYY-MM-DD' and we can just check diff

    for (let i = 0; i < dates.length; i++) {
        if (i === 0) {
            tempStreak = 1;
        } else {
            const prev = new Date(dates[i - 1]);
            const curr = new Date(dates[i]);
            const diffTime = Math.abs(curr.getTime() - prev.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                tempStreak++;
            } else {
                tempStreak = 1;
            }
        }
        if (tempStreak > longestStreak) longestStreak = tempStreak;
    }

    // Check if streak is active (last date is today or yesterday)
    const lastDate = dates[dates.length - 1];
    if (lastDate === today) {
        currentStreak = tempStreak;
    } else if (lastDate === yesterday) {
        currentStreak = tempStreak;
    } else {
        currentStreak = 0;
    }

    return { currentStreak, longestStreak };
}

export type HeatmapData = {
    date: string;
    count: number;
    details: {
        tasksCompleted: number;
        flashcardsNew: number;
        flashcardsReviewed: number;
    }
};

export function aggregateHeatmapData(logs: ActivityLog[]): HeatmapData[] {
    const map: Record<string, HeatmapData> = {};

    for (const log of logs) {
        if (!map[log.date]) {
            map[log.date] = {
                date: log.date,
                count: 0,
                details: { tasksCompleted: 0, flashcardsNew: 0, flashcardsReviewed: 0 }
            };
        }

        map[log.date].count += 1;

        if (log.type === 'TASK_COMPLETE') {
            map[log.date].details.tasksCompleted += 1;
        } else if (log.type === 'FLASHCARD_REVIEW') {
            if (log.metadata && log.metadata.isNew) {
                map[log.date].details.flashcardsNew += 1;
            } else {
                map[log.date].details.flashcardsReviewed += 1;
            }
        }
    }

    return Object.values(map);
}
