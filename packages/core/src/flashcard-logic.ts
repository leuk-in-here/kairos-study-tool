import { Flashcard, CardType, Rating, Deck } from './types';

export function createDeck(title: string): Deck {
    const id = `deck_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    return {
        id,
        title,
        cardIds: [],
    };
}

// Helper type for creation options
interface CreateFlashcardOptions {
    type?: CardType;
    options?: string[];
    correctAnswerIndex?: number;
    clozeContent?: string;
    clozeIndex?: number;
    imageUrl?: string;
}

export function createFlashcard(deckId: string, front: string, back: string, extra: CreateFlashcardOptions = {}): Flashcard {
    const timestamp = Date.now();
    const id = `card_${timestamp}_${Math.random().toString(36).substr(2, 5)}`;
    const { type = CardType.BASIC, options, correctAnswerIndex, clozeContent, clozeIndex, imageUrl } = extra;

    return {
        id,
        deckId,
        type,
        front,
        back,
        // Advanced
        options: type === CardType.MCQ ? options : undefined,
        correctAnswerIndex: type === CardType.MCQ ? correctAnswerIndex : undefined,
        clozeContent: type === CardType.CLOZE ? clozeContent || front : undefined,
        clozeIndex: type === CardType.CLOZE ? clozeIndex : undefined,
        imageUrl,

        interval: 0,
        repetition: 0,
        easeFactor: 2.5,
        nextReviewDate: timestamp, // Due immediately
        createdAt: timestamp,
        updatedAt: timestamp,
    };
}

/**
 * Calculates new scheduling parameters based on SM-2 algorithm.
 * @param card The current state of the flashcard
 * @param rating User rating (1=Again, 2=Hard, 3=Good, 4=Easy)
 */
export function processReview(card: Flashcard, rating: Rating): Flashcard {
    let { interval, repetition, easeFactor } = card;

    // Logic moved to quality score check below

    // Update Ease Factor
    // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    // Note: q is 0-5 in standard SM-2. Here we have 1-4.
    // Mapping: Again(1)=2?, Hard(2)=3?, Good(3)=4?, Easy(4)=5?
    // Let's assume input Rating is mapped to q directly or adjusted.
    // If we map: Again=0, Hard=3, Good=4, Easy=5?
    // Let's use standard mapping: Rating 1..4.
    // Let's blindly apply formula but treat q=Rating (maybe +1 if needed).
    // Let's interpret 'Rating' value as q.  Again=1 (Fail), Hard=2(Fail/Pass?), Good=3(Pass), Easy=4(Pass).
    // Standard Anki uses 4 buttons: Again, Hard, Good, Easy.

    // Let's follow a standard implementation variation:
    // If rating is 'AGAIN' (1), complete reset.
    // If rating is 'HARD' (2), interval = 1.2 * lastInterval?
    // standard SM-2 mapping adapted for 4 buttons:
    // Again (1) -> Quality 0 (Complete blackout / Fail) -> Re-queue
    // Hard (2)  -> Quality 2 (Incorrect response but familiar? Or difficult pass?)
    //              User request: "difficult/hard ... re-added into queue". So treat as Fail (<3).
    // Good (3)  -> Quality 4 (Correct response, hesitation)
    // Easy (4)  -> Quality 5 (Perfect response)

    let quality = 0;
    switch (rating) {
        case Rating.EASY: quality = 5; break;
        case Rating.GOOD: quality = 4; break;
        case Rating.HARD: quality = 2; break; // Fail per user req
        case Rating.AGAIN: quality = 0; break; // Fail
    }

    if (quality >= 3) {
        // Correct response
        if (repetition === 0) {
            interval = 1;
        } else if (repetition === 1) {
            interval = 6;
        } else {
            interval = Math.round(interval * easeFactor);
        }
        repetition += 1;
    } else {
        // Incorrect response
        repetition = 0;
        interval = 1; // Reset to 1 day
    }

    // Update Ease Factor
    // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3;

    // Calculate next date
    // Note: If Failed (Quality < 3), the interval is 1 day.
    // The "re-queue" in session is handled by the UI/Store, not the persistable date here.
    // The persistable date ensures if they quit now, it's due tomorrow.

    // However, for immediate re-reviews (learning steps), often we don't save to DB until they 'Graduate'.
    // A simplified approach for MVP: Save the 'Fail' state immediately (due tomorrow) 
    // BUT the store keeps it in the active session queue.
    const nextReviewDate = Date.now() + (interval * 24 * 60 * 60 * 1000);

    return {
        ...card,
        interval,
        repetition,
        easeFactor,
        nextReviewDate,
        updatedAt: Date.now(),
    };
}
