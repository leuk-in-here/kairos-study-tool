import { Task, EisenhowerQuadrant, TaskStatus } from './types';

export const BASE_POINTS = 10;
export const Q2_MULTIPLIER = 1.5;

export function calculateTaskPoints(task: Task): number {
    let points = BASE_POINTS;

    if (task.quadrant === EisenhowerQuadrant.Q2_NOT_URGENT_IMPORTANT) {
        points = Math.ceil(points * Q2_MULTIPLIER);
    }

    // Additional multipliers (e.g. detailed description, tags) could go here
    return points;
}

export function createTask(
    title: string,
    quadrant: EisenhowerQuadrant = EisenhowerQuadrant.Q2_NOT_URGENT_IMPORTANT,
    reminderTime?: number
): Task {
    const timestamp = Date.now();

    // Simple ID generation - in real app, use UUID lib or crypto.randomUUID
    const id = `task_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;

    const task: Task = {
        id,
        title,
        status: TaskStatus.TODO,
        quadrant,
        reminderTime,
        tags: [],
        pointsValue: 0, // Calculated on completion or dynamic
        createdAt: timestamp,
        updatedAt: timestamp,
    };

    task.pointsValue = calculateTaskPoints(task);
    return task;
}

export function completeTask(task: Task): Task {
    return {
        ...task,
        status: TaskStatus.COMPLETED,
        completedAt: Date.now(),
        updatedAt: Date.now(),
    };
}
