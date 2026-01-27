import React, { useEffect, useState } from 'react';
import { useNoteStore } from '../stores/useNoteStore';
import clsx from 'clsx';
import { TinyEditor } from './TinyEditor';

export const NoteEditor: React.FC = () => {
    const {
        notes, folders, activeNoteId, activeFolderId,
        fetchNotes, createNote, createFolder, deleteFolder, setActiveFolder,
        updateNoteContent, setActiveNote, deleteNote
    } = useNoteStore();
    const [newNoteTitle, setNewNoteTitle] = useState('');
    const [newFolderMode, setNewFolderMode] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');

    const activeNote = notes.find((n) => n.id === activeNoteId);

    // Filter notes by folder
    const filteredNotes = notes.filter(n => {
        if (activeFolderId === null) return true; // Show all? or just Inbox? 
        // Usually clicking "All" shows all. Clicking "Inbox" shows un-foldered.
        // Let's assume activeFolderId === 'inbox' for no folder? 
        // Or let's make null = All, and 'inbox' = undefined folderId.
        // For simplicity: Sidebar has "All Notes", "Inbox", and Folders.
        if (activeFolderId === 'all') return true;
        if (activeFolderId === 'inbox') return !n.folderId;
        return n.folderId === activeFolderId;
    });

    useEffect(() => {
        fetchNotes();
        // Set default view to 'all' if null? 
        if (activeFolderId === null) setActiveFolder('all');
    }, [fetchNotes, activeFolderId, setActiveFolder]);

    const handleCreateNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNoteTitle.trim()) return;
        await createNote(newNoteTitle);
        setNewNoteTitle('');
    };

    const handleCreateFolder = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFolderName.trim()) return;
        await createFolder(newFolderName);
        setNewFolderName('');
        setNewFolderMode(false);
    };

    return (
        <div className="flex flex-col md:flex-row h-[700px] border border-border rounded-lg overflow-hidden bg-background shadow-xl">
            {/* Sidebar: Folders & Notes - Hidden on mobile if note is active? Or collapsible? For now stacked. */}
            <div className={clsx(
                "w-full md:w-72 border-b md:border-b-0 md:border-r border-border flex flex-col bg-secondary transition-all",
                // Mobile: If active note, hide sidebar? Or maybe just minimal height?
                // Let's keep it simple: Stacked.
                activeNoteId && "hidden md:flex" // Hide sidebar on mobile if viewing a note
            )}>
                {/* Folders Section */}
                <div className="p-4 border-b border-border bg-tertiary/10">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold text-xs uppercase text-primary-muted tracking-wider">Folders</h3>
                        <button onClick={() => setNewFolderMode(!newFolderMode)} className="text-accent hover:text-white text-xs">+ Folder</button>
                    </div>
                    {newFolderMode && (
                        <form onSubmit={handleCreateFolder} className="mb-2">
                            <input
                                className="w-full bg-background text-primary px-2 py-1 rounded text-xs border border-border"
                                placeholder="Folder Name"
                                autoFocus
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                            />
                        </form>
                    )}
                    <div className="space-y-1 max-h-32 overflow-y-auto mb-4">
                        <div
                            onClick={() => setActiveFolder('all')}
                            className={clsx("cursor-pointer px-2 py-1 rounded text-sm flex justify-between", activeFolderId === 'all' ? "bg-accent text-white" : "text-primary hover:bg-tertiary")}
                        >
                            <span>All Notes</span>
                            <span className="opacity-50 text-xs">{notes.length}</span>
                        </div>
                        <div
                            onClick={() => setActiveFolder('inbox')}
                            className={clsx("cursor-pointer px-2 py-1 rounded text-sm flex justify-between", activeFolderId === 'inbox' ? "bg-accent text-white" : "text-primary hover:bg-tertiary")}
                        >
                            <span>Inbox</span>
                            <span className="opacity-50 text-xs">{notes.filter(n => !n.folderId).length}</span>
                        </div>
                        {folders.map(folder => (
                            <div
                                key={folder.id}
                                onClick={() => setActiveFolder(folder.id)}
                                className={clsx("cursor-pointer px-2 py-1 rounded text-sm flex justify-between group", activeFolderId === folder.id ? "bg-accent text-white" : "text-primary hover:bg-tertiary")}
                            >
                                <span className="truncate">{folder.name}</span>
                                <div className="flex gap-2">
                                    <span className={clsx("text-xs", activeFolderId === folder.id ? "opacity-70" : "opacity-30")}>{notes.filter(n => n.folderId === folder.id).length}</span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); if (confirm('Delete folder?')) deleteFolder(folder.id); }}
                                        className={clsx("text-xs hover:text-red-400 opacity-0 group-hover:opacity-100 transition", activeFolderId === folder.id ? "text-white" : "text-primary-muted")}
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-border pt-4">
                        <form onSubmit={handleCreateNote} className="flex gap-2">
                            <input
                                className="w-full bg-tertiary text-primary px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                                placeholder={`New Note in ${activeFolderId === 'all' || activeFolderId === 'inbox' ? 'Inbox' : folders.find(f => f.id === activeFolderId)?.name || 'Inbox'}...`}
                                value={newNoteTitle}
                                onChange={(e) => setNewNoteTitle(e.target.value)}
                            />
                            <button type="submit" className="text-accent font-bold hover:text-white transition px-2">+</button>
                        </form>
                    </div>
                </div>

                {/* Notes List */}
                <div className="flex-1 overflow-y-auto">
                    {filteredNotes.length === 0 && (
                        <div className="p-4 text-center text-xs text-primary-muted italic">No notes found.</div>
                    )}
                    {filteredNotes.map((note) => (
                        <div
                            key={note.id}
                            onClick={() => setActiveNote(note.id)}
                            className={clsx(
                                "p-3 cursor-pointer border-b border-border hover:bg-tertiary transition",
                                activeNoteId === note.id ? "bg-accent/10 border-l-4 border-l-accent text-accent" : "text-primary-muted"
                            )}
                        >
                            <div className="font-medium text-sm truncate">{note.title}</div>
                            <div className="text-xs opacity-50 truncate flex justify-between">
                                <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                                {note.folderId && <span className="bg-tertiary px-1 rounded text-[10px]">{folders.find(f => f.id === note.folderId)?.name}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Area: Tiny Editor */}
            <div className="flex-1 flex flex-col bg-background">
                {activeNote ? (
                    <>
                        <div className="flex justify-between items-center p-4 border-b border-border bg-secondary">
                            <div className="flex items-center gap-2">
                                <button
                                    className="md:hidden text-primary mr-2"
                                    onClick={() => setActiveNote(null)}
                                >
                                    ←
                                </button>
                                <h2 className="font-bold text-lg text-primary truncate max-w-[200px]">{activeNote.title}</h2>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* Move Note Dropdown could go here, for now just simple delete */}
                                <span className="text-xs text-primary-muted mr-2">
                                    {activeNote.folderId ? folders.find(f => f.id === activeNote.folderId)?.name : 'Inbox'}
                                </span>
                                <button
                                    onClick={() => {
                                        if (confirm('Delete note?')) deleteNote(activeNote.id);
                                    }}
                                    className="text-red-400 text-xs hover:underline ml-2"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-hidden relative">
                            <TinyEditor
                                key={activeNote.id}
                                content={activeNote.content}
                                onChange={(newContent) => updateNoteContent(activeNote.id, newContent)}
                            />
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-primary-muted italic">
                        Select a note or create one to start writing.
                    </div>
                )}
            </div>
        </div>
    );
};
