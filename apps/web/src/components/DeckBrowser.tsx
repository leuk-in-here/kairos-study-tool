import React, { useEffect, useState } from 'react';
import { useFlashcardStore } from '../stores/useFlashcardStore';
import type { Flashcard } from '@studyos/core';

interface DeckBrowserProps {
    deckId: string;
    onEdit: (card: Flashcard) => void;
}

export const DeckBrowser: React.FC<DeckBrowserProps> = ({ deckId, onEdit }) => {
    const store = useFlashcardStore();
    const [cards, setCards] = useState<Flashcard[]>([]);
    const [loading, setLoading] = useState(false);

    const loadCards = async () => {
        setLoading(true);
        const data = await store.getCardsForDeck(deckId);
        setCards(data);
        setLoading(false);
    };

    useEffect(() => {
        loadCards();
    }, [deckId]);

    if (loading) return <div className="p-4 text-primary-muted">Loading cards...</div>;

    if (cards.length === 0) {
        return <div className="p-8 text-center text-primary-muted bg-tertiary rounded-xl">No cards in this deck yet.</div>;
    }

    return (
        <div className="overflow-x-auto bg-tertiary rounded-xl border border-border">
            <table className="w-full text-left text-sm">
                <thead className="bg-secondary text-primary-muted uppercase text-xs">
                    <tr>
                        <th className="p-4 border-b border-border">Front</th>
                        <th className="p-4 border-b border-border">Back</th>
                        <th className="p-4 border-b border-border">Type</th>
                        <th className="p-4 border-b border-border">Next Review</th>
                        <th className="p-4 border-b border-border text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {cards.map(card => (
                        <tr key={card.id} className="hover:bg-opacity-50 hover:bg-black/5 transition group">
                            <td className="p-4 text-primary font-medium truncate max-w-[200px]">{card.front}</td>
                            <td className="p-4 text-primary-muted truncate max-w-[200px]">{card.back}</td>
                            <td className="p-4">
                                <span className="px-2 py-1 rounded text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                    {card.type}
                                </span>
                            </td>
                            <td className="p-4 text-primary-muted">
                                {new Date(card.nextReviewDate).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-right">
                                <button
                                    onClick={() => onEdit(card)}
                                    className="px-3 py-1 bg-secondary hover:bg-accent text-primary rounded border border-border hover:border-accent transition text-xs"
                                >
                                    Edit
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
