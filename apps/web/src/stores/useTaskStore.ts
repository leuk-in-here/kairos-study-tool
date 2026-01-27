import { create } from 'zustand';
import { type Task, EisenhowerQuadrant, createTask, completeTask, createActivityLog } from '@studyos/core';
import { taskRepository, activityRepository } from '../lib/storage';

// Repository instance imported from shared lib
const repository = taskRepository;

interface TaskState {
    tasks: Task[];
    isLoading: boolean;

    // Actions
    fetchTasks: () => Promise<void>;
    addTask: (title: string, quadrant: EisenhowerQuadrant, reminderTime?: number) => Promise<void>;
    toggleTaskCompletion: (taskId: string) => Promise<void>;
    deleteTask: (taskId: string) => Promise<void>;
    moveTask: (taskId: string, newQuadrant: EisenhowerQuadrant, newIndex: number) => Promise<void>;
    updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
    tasks: [],
    isLoading: false,

    fetchTasks: async () => {
        set({ isLoading: true });
        try {
            const tasks = await repository.getAllTasks();
            set({ tasks });
        } finally {
            set({ isLoading: false });
        }
    },

    addTask: async (title: string, quadrant: EisenhowerQuadrant, reminderTime?: number) => {
        const newTask = createTask(title, quadrant, reminderTime);
        await repository.saveTask(newTask);
        set((state) => ({ tasks: [...state.tasks, newTask] }));
    },

    toggleTaskCompletion: async (taskId: string) => {
        const state = get();
        const task = state.tasks.find((t) => t.id === taskId);
        if (!task) return;

        // Toggle logic (revert not fully implemented in core yet, assuming forward only for now or simple toggle)
        // For MVP we just use completeTask if it's not completed.
        // If we wanted to un-complete, we'd need a core function for that.
        // Let's assume just completing for now.

        // UPDATE: We need to handle re-saving
        let updatedTask = task;
        if (task.status !== 'COMPLETED') {
            updatedTask = completeTask(task);
            await activityRepository.logActivity(createActivityLog('TASK_COMPLETE', task.id, task.pointsValue));
        }
        // If already completed, we might want to un-complete, but let's stick to PRD FR1: "Create, edit, complete, delete"

        await repository.saveTask(updatedTask);

        set((state) => ({
            tasks: state.tasks.map((t) => (t.id === taskId ? updatedTask : t)),
        }));
    },

    moveTask: async (taskId: string, newQuadrant: EisenhowerQuadrant, newIndex: number) => {
        const state = get();
        const allTasks = [...state.tasks];
        const taskIndex = allTasks.findIndex((t) => t.id === taskId);

        if (taskIndex === -1) return;

        const task = { ...allTasks[taskIndex] };
        const oldQuadrant = task.quadrant;

        // Update task properties
        task.quadrant = newQuadrant;

        // Remove from main array for manipulation
        allTasks.splice(taskIndex, 1);

        // Filter tasks by quadrant to calculate new order
        const targetQuadrantTasks = allTasks
            .filter((t) => t.quadrant === newQuadrant)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

        // Insert at new index
        targetQuadrantTasks.splice(newIndex, 0, task);

        // Recalculate sort orders for the target quadrant
        const updates: Promise<void>[] = [];
        targetQuadrantTasks.forEach((t, index) => {
            t.sortOrder = index;
            // Optimistic update in local state
            // We need to persist this. 
            // NOTE: In a real app we'd use a batch update. Here we'll just save the moved task 
            // and maybe others if we want perfect persistence of order, but for MVP 
            // saving the moved task is critical. Saving ALL might be too heavy if the list is long.
            // Let's safe-guard by updating the moved task and its immediate neighbors?
            // Actually, for dnd to work persistently, we need to save the new order.
            updates.push(repository.saveTask(t));
        });

        // Also Update the local state with the new full list
        // We construct the new state.tasks by taking all OTHER quadrants + new target quadrant
        const otherTasks = allTasks.filter(t => t.quadrant !== newQuadrant);
        const newTaskList = [...otherTasks, ...targetQuadrantTasks];

        set({ tasks: newTaskList });

        // Execute writes in background
        await Promise.all(updates);
    },

    deleteTask: async (taskId: string) => {
        set((state) => ({
            tasks: state.tasks.filter((t) => t.id !== taskId),
        }));
        await repository.deleteTask(taskId);
    },

    updateTask: async (taskId: string, updates: Partial<Task>) => {
        const state = get();
        const task = state.tasks.find((t) => t.id === taskId);
        if (!task) return;

        const updatedTask = { ...task, ...updates, updatedAt: Date.now() };

        set((state) => ({
            tasks: state.tasks.map((t) => (t.id === taskId ? updatedTask : t)),
        }));

        await repository.saveTask(updatedTask);
    },
}));
