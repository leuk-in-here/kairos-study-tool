import { create } from 'zustand';
import { type Note, type Folder, createNote, createFolder, updateNote, createActivityLog } from '@studyos/core';
import { noteRepository, activityRepository } from '../lib/storage';

const repository = noteRepository;

interface NoteState {
    notes: Note[];
    folders: Folder[];
    isLoading: boolean;
    activeNoteId: string | null;
    activeFolderId: string | null;

    fetchNotes: () => Promise<void>;
    createNote: (title: string) => Promise<string>;
    createFolder: (name: string) => Promise<void>;
    deleteFolder: (id: string) => Promise<void>;
    setActiveFolder: (id: string | null) => void;
    updateNoteContent: (id: string, content: string) => Promise<void>;
    setActiveNote: (id: string | null) => void;
    deleteNote: (id: string) => Promise<void>;
}

export const useNoteStore = create<NoteState>((set, get) => ({
    notes: [],
    folders: [],
    isLoading: false,
    activeNoteId: null,
    activeFolderId: null, // null = All Notes

    fetchNotes: async () => {
        set({ isLoading: true });
        try {
            const [notes, folders] = await Promise.all([
                repository.getAllNotes(),
                repository.getAllFolders()
            ]);
            set({ notes, folders });
        } finally {
            set({ isLoading: false });
        }
    },

    createNote: async (title: string) => {
        const state = get();
        // If activeFolderId is set, adding to that folder
        const folderId = state.activeFolderId || undefined;
        const newNote = createNote(title, '', folderId);
        await repository.saveNote(newNote);
        await activityRepository.logActivity(createActivityLog('NOTE_CREATED', newNote.id));
        set((state) => ({
            notes: [...state.notes, newNote],
            activeNoteId: newNote.id
        }));
        return newNote.id;
    },

    createFolder: async (name: string) => {
        const newFolder = createFolder(name);
        await repository.saveFolder(newFolder);
        set((state) => ({
            folders: [...state.folders, newFolder],
            activeFolderId: newFolder.id // Switch to new folder? Optional.
        }));
    },

    deleteFolder: async (id: string) => {
        // Option: move notes to Inbox (undefined) or delete them?
        // Let's move them to inbox for safety
        const state = get();
        const notesInFolder = state.notes.filter(n => n.folderId === id);

        for (const note of notesInFolder) {
            const updated = updateNote(note, { folderId: undefined });
            await repository.saveNote(updated);
        }

        await repository.deleteFolder(id);

        set((state) => ({
            folders: state.folders.filter(f => f.id !== id),
            notes: state.notes.map(n => n.folderId === id ? { ...n, folderId: undefined } : n),
            activeFolderId: state.activeFolderId === id ? null : state.activeFolderId
        }));
    },

    setActiveFolder: (id) => set({ activeFolderId: id }),

    updateNoteContent: async (id: string, content: string) => {
        const state = get();
        const note = state.notes.find((n) => n.id === id);
        if (!note) return;

        const updated = updateNote(note, { content });
        await repository.saveNote(updated);

        set((state) => ({
            notes: state.notes.map((n) => (n.id === id ? updated : n)),
        }));
    },

    setActiveNote: (id) => set({ activeNoteId: id }),

    deleteNote: async (id: string) => {
        await repository.deleteNote(id);
        set((state) => ({
            notes: state.notes.filter((n) => n.id !== id),
            activeNoteId: state.activeNoteId === id ? null : state.activeNoteId
        }));
    },
}));
