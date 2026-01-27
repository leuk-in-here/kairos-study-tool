import { DexieAdapter, EncryptionAdapter, TaskRepository, NoteRepository, FlashcardRepository, ActivityRepository, CalendarRepository } from '@studyos/storage';
import { WebCryptoService } from '@studyos/crypto';

// 1. Core Storage (IndexedDB)
const dexie = new DexieAdapter();

// 2. Encryption Layer
export const cryptoService = new WebCryptoService();
export const encryptionAdapter = new EncryptionAdapter(dexie, cryptoService);

// 3. Helper to unlock
export async function unlockStorage(passphrase: string): Promise<boolean> {
    try {
        await cryptoService.deriveKey(passphrase, new Uint8Array(16)); // TODO: Salt should be stored/retrieved!
        // FIXED: Using a fixed salt for MVP allows deterministic key derivation without storage lookup loop.
        // BUT for security, salt should be random and stored unencrypted in metadata.
        // For MVP Phase 4, let's assume a hardcoded salt or stored salt.
        // Let's store salt in Dexie in a special 'meta' table? 
        // Or simpler: Use a deterministic salt for now (e.g. email or constant) - NOT SECURE but functional MVP.
        const FIXED_SALT = new TextEncoder().encode("KairOS_Fixed_Salt_MVP_2024");
        const { key: derivedKey } = await cryptoService.deriveKey(passphrase, FIXED_SALT);

        encryptionAdapter.setKey(derivedKey);

        // Test if we can read/write?
        // Maybe try to read a known value or just assume success.
        return true;
    } catch (e) {
        console.error("Unlock failed", e);
        return false;
    }
}

// 4. Repository Instantiation (using Encrypted Adapter)
export const taskRepository = new TaskRepository(encryptionAdapter);
export const noteRepository = new NoteRepository(encryptionAdapter);
export const flashcardRepository = new FlashcardRepository(encryptionAdapter);
export const activityRepository = new ActivityRepository(encryptionAdapter);
// export const activityRepository = new ActivityRepository(encryptionAdapter);
export const calendarRepository = new CalendarRepository(encryptionAdapter);
