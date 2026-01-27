import Dexie, { Table } from 'dexie';
import { StorageAdapter } from './types';

// Database Definition
class StudyDB extends Dexie {
    tasks!: Table<any, string>;
    notes!: Table<any, string>;
    decks!: Table<any, string>;
    flashcards!: Table<any, string>;

    activities!: Table<any, string>;
    folders!: Table<any, string>;
    calendar_events!: Table<any, string>;

    constructor() {
        super('StudyOS_DB');
        this.version(1).stores({
            tasks: 'id, quadrant, status, createdAt',
            notes: 'id, title, createdAt',
            decks: 'id',
            flashcards: 'id, deckId, nextReviewDate'
        });

        // Version 2: Add activities
        this.version(2).stores({
            activities: 'id, date, type, timestamp'
        });

        // Version 3: Add folders
        this.version(3).stores({
            folders: 'id, name, createdAt'
        });

        // Version 4: Add calendar_events
        this.version(4).stores({
            calendar_events: 'id, startTime, endTime'
        });
    }
}

export class DexieAdapter implements StorageAdapter {
    private db = new StudyDB();

    async save<T>(collection: string, id: string, data: T): Promise<void> {
        // Dexie tables are properties on the db instance
        // We cast 'any' because we are using a generic string access for collection
        const table = (this.db as any)[collection] as Table<any, string>;
        if (table) {
            await table.put({ ...data, id });
        } else {
            console.error(`Collection ${collection} not found in StudyDB`);
        }
    }

    async get<T>(collection: string, id: string): Promise<T | null> {
        const table = (this.db as any)[collection] as Table<any, string>;
        if (!table) return null;
        const result = await table.get(id);
        return result || null;
    }

    async getAll<T>(collection: string): Promise<T[]> {
        const table = (this.db as any)[collection] as Table<any, string>;
        if (!table) return [];
        return await table.toArray();
    }

    async delete(collection: string, id: string): Promise<void> {
        const table = (this.db as any)[collection] as Table<any, string>;
        if (table) {
            await table.delete(id);
        }
    }
}
