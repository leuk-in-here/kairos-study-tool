import React, { useState } from 'react';
import { EisenhowerQuadrant } from '@studyos/core';
import { useTaskStore } from '../stores/useTaskStore';

export const TaskInput: React.FC = () => {
    const [title, setTitle] = useState('');
    const [quadrant, setQuadrant] = useState<EisenhowerQuadrant>(EisenhowerQuadrant.Q2_NOT_URGENT_IMPORTANT);
    const [reminderDate, setReminderDate] = useState('');
    const addTask = useTaskStore((state) => state.addTask);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        const reminderTime = reminderDate ? new Date(reminderDate).getTime() : undefined;
        await addTask(title, quadrant, reminderTime);
        setTitle('');
        setReminderDate('');
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-4 bg-secondary rounded-lg shadow-md border border-border">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What needs to be done?"
                    className="flex-1 p-3 bg-tertiary text-primary rounded border border-border focus:border-accent focus:outline-none placeholder-primary-muted"
                />
                <input
                    type="datetime-local"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    className="p-3 bg-tertiary text-primary rounded border border-border focus:border-accent focus:outline-none text-sm"
                />
                <button
                    type="submit"
                    className="px-6 py-2 bg-accent text-white rounded hover:bg-blue-600 transition font-medium shadow-sm"
                >
                    Add
                </button>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-primary-muted">
                <label className="flex items-center gap-1 cursor-pointer hover:text-primary transition">
                    <input
                        type="radio"
                        name="quadrant"
                        checked={quadrant === EisenhowerQuadrant.Q1_URGENT_IMPORTANT}
                        onChange={() => setQuadrant(EisenhowerQuadrant.Q1_URGENT_IMPORTANT)}
                        className="accent-red-500"
                    />
                    Urgent & Important (Do)
                </label>
                <label className="flex items-center gap-1 cursor-pointer hover:text-primary transition">
                    <input
                        type="radio"
                        name="quadrant"
                        checked={quadrant === EisenhowerQuadrant.Q2_NOT_URGENT_IMPORTANT}
                        onChange={() => setQuadrant(EisenhowerQuadrant.Q2_NOT_URGENT_IMPORTANT)}
                        className="accent-blue-500"
                    />
                    Not Urgent & Important (Schedule)
                </label>
                <label className="flex items-center gap-1 cursor-pointer hover:text-primary transition">
                    <input
                        type="radio"
                        name="quadrant"
                        checked={quadrant === EisenhowerQuadrant.Q3_URGENT_NOT_IMPORTANT}
                        onChange={() => setQuadrant(EisenhowerQuadrant.Q3_URGENT_NOT_IMPORTANT)}
                        className="accent-yellow-500"
                    />
                    Urgent & Not Important (Delegate)
                </label>
                <label className="flex items-center gap-1 cursor-pointer hover:text-primary transition">
                    <input
                        type="radio"
                        name="quadrant"
                        checked={quadrant === EisenhowerQuadrant.Q4_NOT_URGENT_NOT_IMPORTANT}
                        onChange={() => setQuadrant(EisenhowerQuadrant.Q4_NOT_URGENT_NOT_IMPORTANT)}
                        className="accent-green-500"
                    />
                    Not Urgent & Not Important (Eliminate)
                </label>
            </div>
        </form>
    );
};
