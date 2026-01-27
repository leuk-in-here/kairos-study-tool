import { Task } from '@studyos/core';
import { StorageAdapter } from '../adapters/types';

export class TaskRepository {
    private collection = 'tasks';

    constructor(private adapter: StorageAdapter) { }

    async saveTask(task: Task): Promise<void> {
        await this.adapter.save(this.collection, task.id, task);
    }

    async getTask(id: string): Promise<Task | null> {
        return this.adapter.get<Task>(this.collection, id);
    }

    async getAllTasks(): Promise<Task[]> {
        return this.adapter.getAll<Task>(this.collection);
    }

    async deleteTask(id: string): Promise<void> {
        await this.adapter.delete(this.collection, id);
    }
}
