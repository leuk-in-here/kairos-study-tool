import React, { useEffect, useState } from 'react';
import { useFlashcardStore } from '../stores/useFlashcardStore';
import { CsvImporter } from './CsvImporter';
import { FlashcardEditor } from './FlashcardEditor';
import { DeckBrowser } from './DeckBrowser';
import type { Flashcard } from '@studyos/core';
import { CardType, Rating } from '@studyos/core';
import Papa from 'papaparse';
import clsx from 'clsx';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

type ViewMode = 'home' | 'review' | 'browser' | 'add' | 'edit' | 'import';

export const FlashcardManager: React.FC = () => {
    const store = useFlashcardStore();
    const [newDeckTitle, setNewDeckTitle] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('home');
    const [isReviewing, setIsReviewing] = useState(false); // Legacy flag, sync with viewMode eventually
    const [showBack, setShowBack] = useState(false);

    // Editing state
    const [editingCard, setEditingCard] = useState<Flashcard | null>(null);

    // Context Menu State
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, deckId: string } | null>(null);

    useEffect(() => {
        store.fetchDecks();
    }, [store.fetchDecks]);

    const handleCreateDeck = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newDeckTitle.trim()) {
            await store.createDeck(newDeckTitle);
            setNewDeckTitle('');
        }
    };

    // Close context menu on click elsewhere
    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    const handleContextMenu = (e: React.MouseEvent, deckId: string) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, deckId });
    };

    const handleMenuAction = (action: 'review' | 'browse' | 'add') => {
        if (!contextMenu) return;
        store.setActiveDeck(contextMenu.deckId);

        switch (action) {
            case 'review':
                startSession(); // This sets isReviewing=true
                setViewMode('review');
                break;
            case 'browse':
                setViewMode('browser');
                setIsReviewing(false);
                break;
            case 'add':
                setViewMode('add');
                setIsReviewing(false);
                break;
        }
        setContextMenu(null); // Close context menu after action
    };

    const startSession = async () => {
        if (store.activeDeckId) {
            await store.startReview(store.activeDeckId);
            setIsReviewing(true);
            setShowBack(false);
            setViewMode('review');
        }
    };

    const handleRate = async (rating: Rating) => {
        await store.submitReview(rating);
        setShowBack(false);
    };

    // Export Logic
    const handleExport = async () => {
        if (!store.activeDeckId) {
            alert('Please select a deck to export.');
            return;
        }

        const deck = store.decks.find(d => d.id === store.activeDeckId);
        if (!deck) return;

        const cards = await store.getCardsForDeck(store.activeDeckId);

        // Format for CSV
        // We need: Front, Back, Type, Options (joined?), Explanation (Back?)
        // Standard format: Front, Back, Type, Options, ClozeIndex, Extra
        const csvData = cards.map(c => ({
            Front: c.front,
            Back: c.back,
            Type: c.type,
            Options: c.options?.join('|'),
            ClozeIndex: c.clozeIndex,
            // Reusing fields for convenience
        }));

        const csvString = Papa.unparse(csvData);
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${deck.title}_export.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Render Logic Based on ViewMode
    const renderMainContent = () => {
        if (viewMode === 'import') {
            return (
                <div className="flex flex-col h-full max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold text-primary mb-6">Import Deck</h2>
                    <div className="bg-tertiary/20 p-8 rounded-xl border border-border">
                        <p className="text-primary-muted mb-6">
                            Upload a CSV file to add cards to the current deck.
                            Supported columns: Front, Back.
                        </p>
                        {store.activeDeckId ? (
                            <>
                                <div className="mb-4 text-sm text-accent font-bold">
                                    Target Deck: {store.decks.find(d => d.id === store.activeDeckId)?.title}
                                </div>
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                <CsvImporter onImport={async (data: any[]) => {
                                    if (!store.activeDeckId) return;
                                    let count = 0;
                                    for (const row of data) {
                                        let f = '', b = '';
                                        // Simple heuristic mapping
                                        if (Array.isArray(row)) {
                                            if (row.length >= 2) { f = row[0]; b = row[1]; }
                                        } else {
                                            f = row['Front'] || row['front'] || row['Question'] || Object.values(row)[0] as string;
                                            b = row['Back'] || row['back'] || row['Answer'] || Object.values(row)[1] as string;
                                        }

                                        if (f && b) {
                                            await store.addCard(store.activeDeckId!, f, b);
                                            count++;
                                        }
                                    }
                                    alert(`Successfully imported ${count} cards!`);
                                    setViewMode('browser');
                                }} />
                            </>
                        ) : (
                            <div className="text-red-400">Please select a deck from the sidebar first.</div>
                        )}
                    </div>
                </div>
            );
        }

        if (!store.activeDeckId) {
            return (
                <div className="flex-1 flex items-center justify-center text-primary-muted italic text-lg">
                    Select a deck to manage cards. (Right-click deck for options)
                </div>
            );
        }

        if (viewMode === 'browser') {
            return (
                <div className="flex flex-col h-full">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-primary">Deck Cards</h2>
                        <button onClick={() => setViewMode('add')} className="px-4 py-2 bg-accent text-white rounded font-bold text-sm">+ Add Card</button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <DeckBrowser
                            deckId={store.activeDeckId}
                            onEdit={(card) => {
                                setEditingCard(card);
                                setViewMode('edit');
                            }}
                        />
                    </div>
                </div>
            );
        }

        if (viewMode === 'add' || viewMode === 'edit') {
            return (
                <div className="bg-tertiary/20 p-6 rounded-xl border border-border">
                    <FlashcardEditor
                        initialData={viewMode === 'edit' ? editingCard : null}
                        onSave={async (f, b, extra) => {
                            if (store.activeDeckId) {
                                if (extra.type === CardType.CLOZE) {
                                    const matches = Array.from(f.matchAll(/{{c(\d+)::(.*?)}}/g));
                                    const indices = new Set(matches.map(m => parseInt(m[1])));

                                    if (indices.size > 0) {
                                        for (const idx of indices) {
                                            await store.addCard(store.activeDeckId, f, b, { ...extra, clozeIndex: idx });
                                        }
                                        alert(`Created ${indices.size} Cloze cards!`);
                                    } else {
                                        await store.addCard(store.activeDeckId, f, b, extra);
                                        alert('Saved (No cloze deletions found)');
                                    }
                                } else {
                                    await store.addCard(store.activeDeckId, f, b, extra);
                                    alert('Saved!');
                                }
                                if (viewMode === 'edit') setViewMode('browser');
                            }
                        }}
                        onCancel={() => setViewMode('browser')}
                    />
                </div>
            );
        }

        // Default Home/Review Start Mode UI
        return (
            <div className="flex flex-col items-center justify-center h-full">
                <div className="flex justify-between items-center mb-8 w-full max-w-md">
                    <h2 className="text-3xl font-bold text-primary">{store.decks.find(d => d.id === store.activeDeckId)?.title}</h2>
                </div>
                <button onClick={startSession} className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold shadow-lg">Start Review Session</button>
            </div>
        );
    };

    // Intercept existing review render
    if (isReviewing && store.currentReviewCard) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-background rounded-xl h-[600px] border border-border">
                <div className="w-full max-w-2xl bg-secondary p-12 rounded-xl min-h-[400px] flex flex-col items-center justify-center text-center shadow-2xl border border-border">
                    <div className="text-2xl font-medium mb-8 text-primary overflow-y-auto max-h-[300px] w-full prose prose-invert prose-headings:my-2 prose-p:my-1 text-center flex flex-col items-center">
                        {store.currentReviewCard.type === CardType.CLOZE ? (
                            <div className="leading-relaxed">
                                {store.currentReviewCard.front.split(/({{c\d+::.*?}})/g).map((part, i) => {
                                    const match = part.match(/{{c(\d+)::(.*?)}}/);
                                    if (match) {
                                        const index = parseInt(match[1]);
                                        const content = match[2];
                                        const isTarget = index === store.currentReviewCard?.clozeIndex;

                                        if (isTarget) {
                                            return (
                                                <span key={i} className="font-bold text-accent bg-accent/20 px-2 rounded mx-1 inline-block">
                                                    {showBack ? (
                                                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={{ p: 'span' }}>
                                                            {content}
                                                        </ReactMarkdown>
                                                    ) : '[...]'}
                                                </span>
                                            );
                                        } else {
                                            return (
                                                <span key={i} className="font-medium text-primary inline-block">
                                                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={{ p: 'span' }}>
                                                        {content}
                                                    </ReactMarkdown>
                                                </span>
                                            );
                                        }
                                    }
                                    // Regular text part
                                    return (
                                        <span key={i} className="inline">
                                            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={{ p: 'span' }}>
                                                {part}
                                            </ReactMarkdown>
                                        </span>
                                    );
                                })}
                            </div>
                        ) : (
                            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                {store.currentReviewCard.front}
                            </ReactMarkdown>
                        )}
                    </div>

                    {showBack ? (
                        <div className="mt-8 pt-8 border-t border-border w-full animate-in fade-in flex flex-col items-center">
                            {/* Correct Answer / Explanation Section */}
                            {store.currentReviewCard.type === CardType.MCQ ? (
                                <div className="mb-8 w-full">
                                    <div className="text-xl text-green-400 font-bold mb-2">
                                        Correct Answer: {store.currentReviewCard.options?.[store.currentReviewCard.correctAnswerIndex || 0]}
                                    </div>
                                    {store.currentReviewCard.back && (
                                        <div className="p-4 bg-tertiary/50 rounded text-primary text-sm prose prose-invert prose-sm max-w-none text-left">
                                            <span className="font-bold block mb-1 text-primary-muted uppercase text-xs">Explanation:</span>
                                            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                                {store.currentReviewCard.back}
                                            </ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-xl text-accent mb-12 prose prose-invert prose-lg text-center">
                                    {store.currentReviewCard.type === CardType.CLOZE
                                        ? (store.currentReviewCard.back ? (
                                            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                                {store.currentReviewCard.back}
                                            </ReactMarkdown>
                                        ) : 'Well done!')
                                        : (
                                            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                                {store.currentReviewCard.back}
                                            </ReactMarkdown>
                                        )
                                    }
                                </div>
                            )}

                            <div className="grid grid-cols-4 gap-4 w-full">
                                <button onClick={() => handleRate(Rating.AGAIN)} className="p-4 bg-red-900/50 hover:bg-red-900 rounded-lg text-red-200 text-sm font-bold border border-red-900 transition">Again</button>
                                <button onClick={() => handleRate(Rating.HARD)} className="p-4 bg-orange-900/50 hover:bg-orange-900 rounded-lg text-orange-200 text-sm font-bold border border-orange-900 transition">Hard</button>
                                <button onClick={() => handleRate(Rating.GOOD)} className="p-4 bg-green-900/50 hover:bg-green-900 rounded-lg text-green-200 text-sm font-bold border border-green-900 transition">Good</button>
                                <button onClick={() => handleRate(Rating.EASY)} className="p-4 bg-blue-900/50 hover:bg-blue-900 rounded-lg text-blue-200 text-sm font-bold border border-blue-900 transition">Easy</button>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full mt-8">
                            {store.currentReviewCard.type === CardType.MCQ ? (
                                <div className="grid grid-cols-1 gap-3 max-w-md mx-auto">
                                    {store.currentReviewCard.options?.map((opt, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setShowBack(true)}
                                            // Note: User feedback "Clicking an answer will go to the next page".
                                            // Ideally we check if clicking WRONG option shows immediate fail?
                                            // User said "show you the question as well as the correct answer (next page)".
                                            // So any click flips it? Or only correct? Usually any click flips and reveals.
                                            // Let's make it flip on any click, and they self-rate.
                                            className="p-4 bg-tertiary hover:bg-accent hover:text-white rounded-lg text-left text-primary transition border border-border"
                                        >
                                            <span className="font-bold mr-2 text-primary-muted">{String.fromCharCode(65 + idx)}:</span> {opt}
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowBack(true)}
                                    className="px-8 py-3 bg-accent text-white rounded-full hover:bg-blue-600 transition font-bold shadow-lg"
                                >
                                    Show Answer
                                </button>
                            )}
                        </div>
                    )}
                </div>
                <div className="mt-6 text-primary-muted text-sm">
                    {store.dueCards.length} cards remaining
                </div>
                <button onClick={() => { setIsReviewing(false); setViewMode('browser'); }} className="mt-8 text-primary-muted hover:text-primary transition">Exit Review</button>
            </div>
        )
    }

    if (isReviewing && !store.currentReviewCard) {
        return (
            <div className="flex flex-col items-center justify-center h-[500px] text-center bg-secondary rounded-xl border border-border">
                <h2 className="text-3xl font-bold text-green-400 mb-4">Session Complete!</h2>
                <p className="text-primary-muted text-lg">You have reviewed all due cards for this deck.</p>
                <button
                    onClick={() => { setIsReviewing(false); setViewMode('browser'); }}
                    className="mt-8 px-6 py-3 bg-tertiary text-primary rounded-lg hover:bg-gray-600 transition"
                >
                    Back to Decks
                </button>
            </div>
        )
    }

    return (
        <div className="flex flex-col md:flex-row gap-6 h-[700px]">
            {/* Sidebar: Decks */}
            <div className="w-full md:w-72 bg-secondary rounded-xl p-4 flex flex-col border border-border relative">
                <h2 className="font-bold mb-4 text-primary-muted uppercase text-xs tracking-wider">Decks</h2>
                <div className="flex-1 space-y-2 overflow-y-auto">
                    {store.decks.map((deck) => (
                        <div
                            key={deck.id}
                            onClick={() => { store.setActiveDeck(deck.id); setViewMode('browser'); }}
                            onContextMenu={(e) => handleContextMenu(e, deck.id)}
                            className={clsx(
                                "p-3 rounded cursor-pointer transition font-medium select-none",
                                store.activeDeckId === deck.id ? "bg-accent text-white shadow-md" : "bg-tertiary text-primary-muted hover:text-primary hover:bg-gray-600"
                            )}
                        >
                            {deck.title}
                        </div>
                    ))}
                </div>

                {/* Context Menu */}
                {contextMenu && (
                    <div
                        className="fixed bg-popover border border-border rounded-lg shadow-xl z-50 py-1 min-w-[150px] animate-in fade-in zoom-in-95 duration-100"
                        style={{ top: contextMenu.y, left: contextMenu.x }}
                    >
                        <button onClick={() => handleMenuAction('review')} className="w-full text-left px-4 py-2 hover:bg-tertiary text-sm text-primary">Review Cards</button>
                        <button onClick={() => handleMenuAction('browse')} className="w-full text-left px-4 py-2 hover:bg-tertiary text-sm text-primary">Edit Cards</button>
                        <button onClick={() => handleMenuAction('add')} className="w-full text-left px-4 py-2 hover:bg-tertiary text-sm text-primary">Add New Card</button>
                    </div>
                )}

                <form onSubmit={handleCreateDeck} className="mt-4 pt-4 border-t border-border">
                    <input
                        className="w-full bg-tertiary text-primary px-3 py-2 rounded text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-accent border border-transparent focus:border-transparent"
                        placeholder="New Deck Name"
                        value={newDeckTitle}
                        onChange={(e) => setNewDeckTitle(e.target.value)}
                    />
                    <button type="submit" className="w-full bg-tertiary hover:bg-gray-600 text-primary py-2 rounded text-sm transition border border-border font-medium mb-2">Create Deck</button>
                </form>

                {/* Import / Export Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setViewMode('import')}
                        className="flex-1 bg-tertiary hover:bg-gray-600 text-primary py-2 rounded text-xs transition border border-border font-medium"
                    >
                        Import Deck
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex-1 bg-tertiary hover:bg-gray-600 text-primary py-2 rounded text-xs transition border border-border font-medium"
                    >
                        Export Deck
                    </button>
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 bg-secondary rounded-xl p-8 flex flex-col border border-border overflow-y-auto">
                {renderMainContent()}
            </div>
        </div>
    );
};
