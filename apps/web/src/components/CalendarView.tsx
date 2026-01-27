import React, { useState, useEffect } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isToday
} from 'date-fns';
import { useCalendarStore } from '../stores/useCalendarStore';
import { useTaskStore } from '../stores/useTaskStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import clsx from 'clsx';


export const CalendarView: React.FC = () => {
    const { events, fetchEvents, addEvent } = useCalendarStore();
    const { tasks, fetchTasks } = useTaskStore();
    const { is24Hour } = useSettingsStore();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showTaskDueDates, setShowTaskDueDates] = useState(true);
    const [showCompletedTasks, setShowCompletedTasks] = useState(false); // Reflection mode

    useEffect(() => {
        fetchEvents();
        fetchTasks();
    }, [fetchEvents, fetchTasks]);

    const header = () => {
        const dateFormat = "MMMM yyyy";
        return (
            <div className="flex justify-between items-center py-4 px-2">
                <div className="flex gap-2">
                    <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-white/10 rounded">
                        ←
                    </button>
                    <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-white/10 rounded">
                        →
                    </button>
                    <button onClick={() => setCurrentDate(new Date())} className="px-3 py-2 text-sm bg-accent/20 hover:bg-accent/40 rounded text-accent">
                        Today
                    </button>
                </div>
                <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                    {format(currentDate, dateFormat)}
                </div>

                {/* Toggles */}
                <div className="flex gap-4 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showTaskDueDates}
                            onChange={e => setShowTaskDueDates(e.target.checked)}
                            className="rounded border-gray-600 bg-gray-800 text-blue-500"
                        />
                        Show Due Dates
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showCompletedTasks}
                            onChange={e => setShowCompletedTasks(e.target.checked)}
                            className="rounded border-gray-600 bg-gray-800 text-green-500"
                        />
                        Show Completed (Reflection)
                    </label>
                </div>
            </div>
        );
    };

    const daysOfWeek = () => {
        const days = [];
        const startDate = startOfWeek(currentDate);
        for (let i = 0; i < 7; i++) {
            days.push(
                <div key={i} className="text-center font-bold text-sm text-primary-muted py-2 uppercase">
                    {format(eachDayOfInterval({ start: startDate, end: endOfWeek(startDate) })[i], "eee")}
                </div>
            );
        }
        return <div className="grid grid-cols-7 border-b border-border">{days}</div>;
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const dateFormat = "d";
        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                formattedDate = format(day, dateFormat);
                const cloneDay = day;

                // Filter Items for this day
                const dayEvents = events.filter(e => isSameDay(new Date(e.startTime), cloneDay));
                const dayTasks = tasks.filter(t => {
                    const hasDueDate = t.reminderTime && isSameDay(new Date(t.reminderTime), cloneDay);
                    const isCompletedOnDay = showCompletedTasks && t.status === 'COMPLETED' && t.updatedAt && isSameDay(new Date(t.updatedAt), cloneDay); // Ideally use completedAt

                    if (showCompletedTasks && isCompletedOnDay) return true;
                    if (showTaskDueDates && hasDueDate && t.status !== 'COMPLETED') return true;
                    return false;
                });

                days.push(
                    <div
                        key={day.toString()}
                        className={clsx(
                            "min-h-[100px] border border-border/50 p-1 relative hover:bg-white/5 transition group overflow-hidden",
                            !isSameMonth(day, monthStart) && "opacity-30 bg-black/20",
                            isSameDay(day, selectedDate) && "bg-white/5",
                            isToday(day) && "border-accent border" // Highlight today
                        )}
                        onClick={() => setSelectedDate(cloneDay)}
                    >
                        <div className={clsx(
                            "absolute top-1 right-2 text-xs font-medium",
                            isToday(day) ? "text-accent" : "text-primary-muted"
                        )}>
                            {formattedDate}
                        </div>

                        {/* Events List */}
                        <div className="mt-6 flex flex-col gap-1 overflow-y-auto max-h-[80px] no-scrollbar">
                            {/* User Created Events */}
                            {dayEvents.map(event => (
                                <div key={event.id} className="text-[10px] px-1 rounded truncate text-white" style={{ backgroundColor: event.color || '#3b82f6' }}>
                                    {!event.isAllDay && <span className="opacity-75 mr-1">{format(new Date(event.startTime), is24Hour ? 'HH:mm' : 'h:mma')}</span>}
                                    {event.title}
                                </div>
                            ))}

                            {/* Task Items */}
                            {dayTasks.map(task => (
                                <div key={task.id} className={clsx(
                                    "text-[10px] px-1 rounded truncate border",
                                    task.status === 'COMPLETED' ? "bg-green-500/10 border-green-500 text-green-500 line-through decoration-white/50" : "bg-secondary border-accent/50 text-primary"
                                )}>
                                    <span className="mr-1">
                                        {task.status === 'COMPLETED' ? '✓' : '○'}
                                    </span>
                                    {task.title}
                                </div>
                            ))}
                        </div>

                        {/* Quick Add Button (Hidden by default, shown on hover) */}
                        <button
                            className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 bg-accent text-white rounded-full w-5 h-5 flex items-center justify-center text-xs pb-0.5"
                            onClick={(e) => {
                                e.stopPropagation();
                                const title = prompt("New Event Title:");
                                if (title) {
                                    // Default to 1 hour event at 9am or current time if today
                                    const start = new Date(cloneDay);
                                    start.setHours(9, 0, 0, 0);
                                    const end = new Date(start);
                                    end.setHours(10, 0, 0, 0);
                                    addEvent(title, start.getTime(), end.getTime());
                                }
                            }}
                        >
                            +
                        </button>
                    </div>
                );
                day = addMonths(day, 0); // Hack to clone? No, create new date above logic. 
                // date-fns addDays(day, 1) returns new date.

                // Fix for infinite loop potential if not careful
                const nextDay = new Date(day);
                nextDay.setDate(day.getDate() + 1);
                day = nextDay;
            }
            rows.push(
                <div key={day.toString()} className="grid grid-cols-7">
                    {days}
                </div>
            );
            days = [];
        }
        return <div className="flex flex-col">{rows}</div>;
    };

    return (
        <div className="h-full flex flex-col bg-secondary/30 rounded-xl border border-border">
            {header()}
            {daysOfWeek()}
            <div className="flex-1 overflow-y-auto">
                {renderCells()}
            </div>
        </div>
    );
};
