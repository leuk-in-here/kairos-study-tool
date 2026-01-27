import { Note } from '@studyos/core';
import { StorageAdapter } from '../adapters/types';

export class NoteRepository {
    private collection = 'notes';

    constructor(private adapter: StorageAdapter) { }

    async saveNote(note: Note): Promise<void> {
        await this.adapter.save(this.collection, note.id, note);
    }

    async getNote(id: string): Promise<Note | null> {
        return this.adapter.get<Note>(this.collection, id);
    }

    async getAllNotes(): Promise<Note[]> {
        return this.adapter.getAll<Note>(this.collection);
    }

    async deleteNote(id: string): Promise<void> {
        await this.adapter.delete(this.collection, id);
    }

    // Folders
    async saveFolder(folder: any): Promise<void> {
        await this.adapter.save('folders', folder.id, folder);
    }

    async getAllFolders(): Promise<any[]> {
        return this.adapter.getAll('folders');
    }

    async deleteFolder(id: string): Promise<void> {
        await this.adapter.delete('folders', id);
    }
}
