import { create } from 'zustand';
import { type ActivityLog, calculateStreak, aggregateHeatmapData, type HeatmapData, createActivityLog } from '@studyos/core';
import { activityRepository } from '../lib/storage';

interface AnalyticsState {
    logs: ActivityLog[];
    currentStreak: number;
    longestStreak: number;
    heatmapData: HeatmapData[];
    isLoading: boolean;

    fetchAnalytics: () => Promise<void>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logActivity: (type: ActivityLog['type'], referenceId?: string, value?: number, metadata?: Record<string, any>) => Promise<void>;
}

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
    logs: [],
    currentStreak: 0,
    longestStreak: 0,
    heatmapData: [],
    isLoading: false,

    fetchAnalytics: async () => {
        set({ isLoading: true });
        const logs = await activityRepository.getActivities();

        // Improve: Sort logs by date? core logic assumes sort or set handling.
        // Let's sort just in case.
        logs.sort((a, b) => a.timestamp - b.timestamp);

        const { currentStreak, longestStreak } = calculateStreak(logs);
        const heatmapData = aggregateHeatmapData(logs);

        set({
            logs,
            currentStreak,
            longestStreak,
            heatmapData,
            isLoading: false
        });
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logActivity: async (type, referenceId, value = 1, metadata?: Record<string, any>) => {
        const log = createActivityLog(type, referenceId, value, metadata);
        await activityRepository.logActivity(log);

        // Refresh local state without full refetch if possible, or just append
        const state = get();
        const newLogs = [...state.logs, log].sort((a, b) => a.timestamp - b.timestamp);

        const { currentStreak, longestStreak } = calculateStreak(newLogs);
        const heatmapData = aggregateHeatmapData(newLogs);

        set({
            logs: newLogs,
            currentStreak,
            longestStreak,
            heatmapData
        });
    }
}));
