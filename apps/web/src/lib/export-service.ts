import { taskRepository, noteRepository, flashcardRepository, activityRepository } from './storage';

export interface KairOSDump {
    version: number; // Schema version
    timestamp: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tasks: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    notes: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    decks: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cards: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    activityLogs: any[];
}

export async function exportData(): Promise<KairOSDump> {
    const tasks = await taskRepository.getAllTasks();
    const notes = await noteRepository.getAllNotes();
    const decks = await flashcardRepository.getAllDecks();
    // We need getAllCards and getAllActivities.
    // flashcardRepository currently has getAllDecks, getDueCards.
    // We might need to implement getAllCards (or iterate decks).

    // Check flashcardRepository capabilities
    // It seems I didn't verify if 'getAllCards' exists on the repository interface.
    // Based on my implementation of DexieAdapter, I can just use repository.adapter.getAll('flashcards') if I expose adapter or add method.
    // But better to use Repository methods because they handle decryption (via EncryptionAdapter).

    // I need to add `getAllCards` to FlashcardRepository if missing.
    // And `getAllActivities` to ActivityRepository (already added).

    // Let's assume I need to check repository methods first.
    // But I'm writing this file now. I'll write what I expect and then fix repositories.

    // For now, I will add TODOs or use what I know exists.
    // flashcardRepository.getAllDecks() exists.
    // ActivityRepository.getActivities() exists.

    // I need to update FlashcardRepository to support dumping all cards.
    // For now I'll skip cards dump or try to implement it.

    // ActivityLogs
    const activityLogs = await activityRepository.getActivities();

    // Cards - we can cheat and use the adapter directly if we cast usage, 
    // BUT the adapter is wrapped by EncryptionAdapter which requires key.
    // EncryptionAdapter exposes getAll.
    // So if repositories expose getAll<T>('collection'), we are good.
    // But Repositories encapsulate collections.

    // I will write this file assuming I will add `getAllCards` to FlashcardRepository in next step.

    return {
        version: 1,
        timestamp: Date.now(),
        tasks,
        notes,
        decks,
        cards: [], // TODO: Fetch cards
        activityLogs
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function downloadJson(data: any, filename: string) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
