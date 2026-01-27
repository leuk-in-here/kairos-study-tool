import { create } from 'zustand';
import { type Deck, type Flashcard, Rating, createDeck, createFlashcard, processReview, CardType, createActivityLog } from '@studyos/core';
import { flashcardRepository, activityRepository } from '../lib/storage';

const repository = flashcardRepository;

interface FlashcardState {
    decks: Deck[];
    activeDeckId: string | null;
    currentReviewCard: Flashcard | null;
    dueCards: Flashcard[];

    isLoading: boolean;

    fetchDecks: () => Promise<void>;
    createDeck: (title: string) => Promise<void>;
    setActiveDeck: (id: string | null) => void;
    getCardsForDeck: (deckId: string) => Promise<Flashcard[]>;

    // Card Actions
    addCard: (deckId: string, front: string, back: string, extra?: { type?: CardType, options?: string[], correctAnswerIndex?: number, clozeIndex?: number, imageUrl?: string }) => Promise<void>;
    startReview: (deckId: string) => Promise<void>;
    submitReview: (rating: Rating) => Promise<void>;
}

export const useFlashcardStore = create<FlashcardState>((set, get) => ({
    decks: [],
    activeDeckId: null,
    currentReviewCard: null,
    dueCards: [],
    isLoading: false,

    fetchDecks: async () => {
        set({ isLoading: true });
        const decks = await repository.getAllDecks();
        set({ decks, isLoading: false });
    },

    createDeck: async (title: string) => {
        const newDeck = createDeck(title);
        await repository.saveDeck(newDeck);

        // Refresh
        const decks = await repository.getAllDecks();
        set({ decks });
    },

    setActiveDeck: (id) => set({ activeDeckId: id }),

    addCard: async (deckId: string, front: string, back: string, extra?: { type?: CardType, options?: string[], correctAnswerIndex?: number, clozeIndex?: number, imageUrl?: string }) => {
        const card = createFlashcard(deckId, front, back, extra);
        await repository.saveCard(card);

        // Also update deck cardIds locally if strictly tracking, 
        // but repository currently implicitly tracks via deckId on card.
    },

    startReview: async (deckId: string) => {
        const due = await repository.getDueCards(deckId);
        if (due.length > 0) {
            set({ dueCards: due, currentReviewCard: due[0] });
        } else {
            set({ dueCards: [], currentReviewCard: null });
        }
    },

    getCardsForDeck: async (deckId: string): Promise<Flashcard[]> => {
        return await repository.getCardsByDeck(deckId);
    },

    submitReview: async (rating: Rating) => {
        const state = get();
        const current = state.currentReviewCard;
        if (!current) return;

        // Process Review
        const updated = processReview(current, rating);
        await repository.saveCard(updated);

        // Log activity
        await activityRepository.logActivity(createActivityLog('FLASHCARD_REVIEW', current.id, 1, { isNew: current.repetition === 0 }));

        const remaining = state.dueCards.slice(1);

        // Queue Management based on Rating
        let nextQueue = remaining;

        if (rating === Rating.AGAIN || rating === Rating.HARD) {
            // Failed (or hard): Re-queue in current session
            // We push the *updated* card back to the end or nearby?
            // For simplicity, push to end.
            // Note: 'updated' card has interval=1 day, but we want to review it NOW.
            // The store 'dueCards' is an in-memory session queue.
            // We re-insert the card (using the OLD id, but we might want to refresh the object so we don't overwrite the 'fail' too quickly in DB if we save again?)
            // Actually, we just saved 'updated' to DB.
            // If we review again and Pass, we save again. That's fine.
            nextQueue = [...remaining, updated];
        }

        set({
            dueCards: nextQueue,
            currentReviewCard: nextQueue.length > 0 ? nextQueue[0] : null
        });
    }
}));
