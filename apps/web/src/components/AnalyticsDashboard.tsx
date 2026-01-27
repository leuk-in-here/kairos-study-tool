import React, { useEffect } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { useAnalyticsStore } from '../stores/useAnalyticsStore';

export const AnalyticsDashboard: React.FC = () => {
    const { heatmapData, currentStreak, longestStreak, fetchAnalytics, logs } = useAnalyticsStore();

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    // Transform data for heatmap (needs filtered date range usually)
    // We'll show last 365 days
    const today = new Date();

    return (
        <div className="p-8 bg-secondary rounded-xl border border-border shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-primary">Your Activity</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
                <div className="bg-tertiary p-4 rounded-lg text-center border border-border">
                    <div className="text-3xl font-bold text-blue-500">{logs.length}</div>
                    <div className="text-primary-muted text-xs uppercase tracking-wider">Total Activities</div>
                </div>
                <div className="bg-tertiary p-4 rounded-lg text-center border border-border">
                    <div className="text-3xl font-bold text-orange-400">{currentStreak}</div>
                    <div className="text-primary-muted text-xs uppercase tracking-wider">Current Streak</div>
                </div>
                <div className="bg-tertiary p-4 rounded-lg text-center border border-border">
                    <div className="text-3xl font-bold text-yellow-400">{longestStreak}</div>
                    <div className="text-primary-muted text-xs uppercase tracking-wider">Longest Streak</div>
                </div>
            </div>

            <div className="bg-tertiary p-6 rounded-lg overflow-x-auto border border-border">
                <h3 className="text-sm text-primary-muted mb-4 uppercase">Last 365 Days</h3>
                <div className="min-w-[600px]">
                    <CalendarHeatmap
                        startDate={new Date(today.getFullYear(), today.getMonth() - 11, today.getDate())}
                        endDate={today}
                        values={heatmapData}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        titleForValue={(value: { date: string, count: number, details: any } | null) => {
                            if (!value) return '';
                            const { tasksCompleted, flashcardsNew, flashcardsReviewed } = value.details;
                            return `Date: ${value.date}\nTasks: ${tasksCompleted}\nNew Cards: ${flashcardsNew}\nReviewed: ${flashcardsReviewed}`;
                        }}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        classForValue={(value: { count: number } | null) => {
                            if (!value) {
                                return 'color-empty';
                            }
                            // Simple scale 1-4
                            let scale = value.count;
                            if (scale > 4) scale = 4;
                            return `color-scale-${scale}`;
                        }}
                    />
                </div>
            </div>

            <style>{`
        .react-calendar-heatmap text {
          font-size: 10px;
          fill: var(--text-secondary);
        }
        .react-calendar-heatmap .color-empty {
          fill: var(--bg-secondary);
          rx: 2px;
        }
        .react-calendar-heatmap .color-scale-1 { fill: #0e4429; }
        .react-calendar-heatmap .color-scale-2 { fill: #006d32; }
        .react-calendar-heatmap .color-scale-3 { fill: #26a641; }
        .react-calendar-heatmap .color-scale-4 { fill: #39d353; }
        [data-theme='day'] .react-calendar-heatmap .color-scale-1 { fill: #bbf7d0; }
        [data-theme='day'] .react-calendar-heatmap .color-scale-2 { fill: #86efac; }
        [data-theme='day'] .react-calendar-heatmap .color-scale-3 { fill: #4ade80; }
        [data-theme='day'] .react-calendar-heatmap .color-scale-4 { fill: #22c55e; }
      `}</style>
        </div>
    );
};
