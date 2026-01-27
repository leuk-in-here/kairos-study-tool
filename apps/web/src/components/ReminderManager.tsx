import React, { useEffect } from 'react';
import { useTaskStore } from '../stores/useTaskStore';
import { notificationService } from '../lib/notification-service';

export const ReminderManager: React.FC = () => {
    const tasks = useTaskStore((state) => state.tasks);

    useEffect(() => {
        const timeouts: ReturnType<typeof setTimeout>[] = [];

        tasks.forEach((task) => {
            if (task.status === 'COMPLETED' || !task.reminderTime) return;

            const now = Date.now();
            if (task.reminderTime > now) {
                const delay = task.reminderTime - now;
                // Only schedule if it's within a reasonable timeframe (e.g. 24 hours) to avoid huge timeouts? 
                // JS timeouts support up to 24 days.

                const timeoutId = setTimeout(() => {
                    notificationService.sendNotification(`Reminder: ${task.title}`, {
                        body: 'It is time to work on this task!',
                        tag: task.id // Prevent duplicate notifications
                    });
                }, delay);

                timeouts.push(timeoutId);
            }
        });

        return () => {
            timeouts.forEach((id) => clearTimeout(id));
        };
    }, [tasks]);

    return null; // Headless component
};
