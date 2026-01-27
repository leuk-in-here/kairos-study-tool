import { StorageAdapter } from './types';
import { CryptoService } from '@studyos/crypto';

interface EncryptedRecord {
    id: string;
    cipherText: string;
    iv: string;
    // We retain the ID unencrypted for lookup
}

export class EncryptionAdapter implements StorageAdapter {
    private key: CryptoKey | null = null;

    constructor(
        private inner: StorageAdapter,
        private crypto: CryptoService
    ) { }

    setKey(key: CryptoKey) {
        this.key = key;
    }

    isLocked(): boolean {
        return this.key === null;
    }

    async save<T>(collection: string, id: string, data: T): Promise<void> {
        if (!this.key) {
            throw new Error('Storage is locked. Set encryption key first.');
        }

        const json = JSON.stringify(data);
        const { cipherText, iv } = await this.crypto.encrypt(json, this.key);

        const record: EncryptedRecord = {
            id,
            cipherText,
            iv
        };

        // We save the encrypted wrapper. 
        // Note: Indices in Dexie (like quadrant) will fail to work if we just save this.
        // For MVP we accept that we can't query by index on server side (IndexedDB) without exposing metadata.
        // We will filter in memory after decrypting.
        await this.inner.save(collection, id, record);
    }

    async get<T>(collection: string, id: string): Promise<T | null> {
        if (!this.key) {
            throw new Error('Storage is locked.');
        }

        const record = await this.inner.get<EncryptedRecord>(collection, id);
        if (!record) return null;

        try {
            const json = await this.crypto.decrypt(record.cipherText, record.iv, this.key);
            return JSON.parse(json) as T;
        } catch (e) {
            console.error('Failed to decrypt record', id, e);
            throw new Error('Decryption Failed');
        }
    }

    async getAll<T>(collection: string): Promise<T[]> {
        if (!this.key) {
            throw new Error('Storage is locked.');
        }

        const records = await this.inner.getAll<EncryptedRecord>(collection);

        const decryptedItems: T[] = [];
        for (const record of records) {
            try {
                const json = await this.crypto.decrypt(record.cipherText, record.iv, this.key);
                decryptedItems.push(JSON.parse(json) as T);
            } catch (e) {
                console.error('Failed to decrypt item in getAll', record.id, e);
                // Skip or throw? Skipping partial failures is usually safer for UX
            }
        }
        return decryptedItems;
    }

    async delete(collection: string, id: string): Promise<void> {
        // Deletion doesn't strictly require key if we just delete by ID,
        // but let's enforce unlock for consistency/security (prevent unauthorized deletes)
        if (!this.key) {
            throw new Error('Storage is locked.');
        }
        await this.inner.delete(collection, id);
    }
}
