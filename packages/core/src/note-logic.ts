import { Note, Folder } from './types';

export function createNote(title: string, content: string = '', folderId?: string): Note {
    const timestamp = Date.now();
    const id = `note_${timestamp}_${Math.random().toString(36).substr(2, 9)}`;

    return {
        id,
        title,
        content,
        folderId,
        tags: [],
        linkedNoteIds: [],
        createdAt: timestamp,
        updatedAt: timestamp,
    };
}

export function createFolder(name: string): Folder {
    const timestamp = Date.now();
    return {
        id: `folder_${timestamp}`,
        name,
        createdAt: timestamp,
    };
}

export function updateNote(note: Note, updates: Partial<Pick<Note, 'title' | 'content' | 'tags' | 'folderId'>>): Note {
    return {
        ...note,
        ...updates,
        updatedAt: Date.now(),
    };
}
