export interface CryptoService {
    deriveKey(passphrase: string, salt?: Uint8Array): Promise<{ key: CryptoKey; salt: Uint8Array }>;
    encrypt(data: string, key: CryptoKey): Promise<{ cipherText: string; iv: string }>;
    decrypt(cipherText: string, iv: string, key: CryptoKey): Promise<string>;
    generateSalt(): Uint8Array;
}

export class WebCryptoService implements CryptoService {
    private readonly ALGO = 'AES-GCM';
    private readonly KDF = 'PBKDF2';

    generateSalt(): Uint8Array {
        return crypto.getRandomValues(new Uint8Array(16));
    }

    async deriveKey(passphrase: string, salt: Uint8Array = this.generateSalt()): Promise<{ key: CryptoKey; salt: Uint8Array }> {
        const enc = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            enc.encode(passphrase),
            { name: this.KDF },
            false,
            ['deriveBits', 'deriveKey']
        );

        const key = await crypto.subtle.deriveKey(
            {
                name: this.KDF,
                salt: salt as any,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: this.ALGO, length: 256 },
            false, // Key is not exportable for security
            ['encrypt', 'decrypt']
        );

        return { key, salt };
    }

    async encrypt(data: string, key: CryptoKey): Promise<{ cipherText: string; iv: string }> {
        const enc = new TextEncoder();
        const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM

        const encrypted = await crypto.subtle.encrypt(
            {
                name: this.ALGO,
                iv: iv
            },
            key,
            enc.encode(data)
        );

        return {
            cipherText: this.arrayBufferToBase64(encrypted),
            iv: this.arrayBufferToBase64(iv.buffer as ArrayBuffer)
        };
    }

    async decrypt(cipherText: string, iv: string, key: CryptoKey): Promise<string> {
        const encryptedData = this.base64ToArrayBuffer(cipherText);
        const ivData = this.base64ToArrayBuffer(iv);

        const decrypted = await crypto.subtle.decrypt(
            {
                name: this.ALGO,
                iv: ivData
            },
            key,
            encryptedData
        );

        const dec = new TextDecoder();
        return dec.decode(decrypted);
    }

    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    private base64ToArrayBuffer(base64: string): ArrayBuffer {
        const binary_string = atob(base64);
        const len = binary_string.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    }
}
