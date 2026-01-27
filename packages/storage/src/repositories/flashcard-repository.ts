import { Flashcard, Deck } from '@studyos/core';
import { StorageAdapter } from '../adapters/types';

export class FlashcardRepository {
    private cardsCollection = 'flashcards';
    private decksCollection = 'decks';

    constructor(private adapter: StorageAdapter) { }

    // --- Decks ---
    async saveDeck(deck: Deck): Promise<void> {
        await this.adapter.save(this.decksCollection, deck.id, deck);
    }

    async getAllDecks(): Promise<Deck[]> {
        return this.adapter.getAll<Deck>(this.decksCollection);
    }

    // --- Cards ---
    async saveCard(card: Flashcard): Promise<void> {
        await this.adapter.save(this.cardsCollection, card.id, card);
    }

    async getAllCards(): Promise<Flashcard[]> {
        return this.adapter.getAll<Flashcard>(this.cardsCollection);
    }

    async getCardsByDeck(deckId: string): Promise<Flashcard[]> {
        const all = await this.adapter.getAll<Flashcard>(this.cardsCollection);
        return all.filter(c => c.deckId === deckId);
    }

    async getDueCards(deckId: string): Promise<Flashcard[]> {
        const cards = await this.getCardsByDeck(deckId);
        const now = Date.now();
        return cards.filter(c => c.nextReviewDate <= now);
    }
}
