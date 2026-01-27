export interface StorageAdapter {
    save<T>(collection: string, id: string, data: T): Promise<void>;
    get<T>(collection: string, id: string): Promise<T | null>;
    getAll<T>(collection: string): Promise<T[]>;
    delete(collection: string, id: string): Promise<void>;
}
