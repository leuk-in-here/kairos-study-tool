import { StorageAdapter } from './types';

export class InMemoryAdapter implements StorageAdapter {
    private db: Record<string, Record<string, any>> = {};

    async save<T>(collection: string, id: string, data: T): Promise<void> {
        if (!this.db[collection]) {
            this.db[collection] = {};
        }
        this.db[collection][id] = data;
    }

    async get<T>(collection: string, id: string): Promise<T | null> {
        if (!this.db[collection]) return null;
        return (this.db[collection][id] as T) || null;
    }

    async getAll<T>(collection: string): Promise<T[]> {
        if (!this.db[collection]) return [];
        return Object.values(this.db[collection]) as T[];
    }

    async delete(collection: string, id: string): Promise<void> {
        if (this.db[collection]) {
            delete this.db[collection][id];
        }
    }
}
