import React, { useState } from 'react';
import { unlockStorage } from '../lib/storage';

interface LockScreenProps {
    onUnlock: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
    const [passphrase, setPassphrase] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // unlockStorage returns boolean
        const success = await unlockStorage(passphrase);

        if (success) {
            onUnlock();
        } else {
            setError('Failed to unlock. (Check console for details)');
        }
        setIsLoading(false);
    };

    return (
        <div className="fixed inset-0 bg-background text-primary flex items-center justify-center z-50">
            <div className="w-full max-w-md p-8 bg-secondary rounded-xl shadow-2xl border border-border">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400 mb-2">
                    KairOS
                </h1>
                <p className="text-primary-muted mb-8">Secure, Local-First Study System</p>

                <h2 className="text-xl font-bold mb-4 text-primary">Unlock Vault</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-primary-muted mb-1">Passphrase</label>
                        <input
                            type="password"
                            className="w-full bg-tertiary border border-border rounded p-3 text-primary focus:border-accent focus:outline-none placeholder-primary-muted"
                            placeholder="Enter your passphrase..."
                            value={passphrase}
                            onChange={(e) => setPassphrase(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {error && <div className="text-red-400 text-sm">{error}</div>}

                    <button
                        type="submit"
                        disabled={!passphrase || isLoading}
                        className="w-full py-3 bg-accent hover:bg-blue-600 text-white rounded font-bold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                        {isLoading ? 'Unlocking...' : 'Unlock'}
                    </button>

                    <p className="text-xs text-primary-muted mt-4 text-center opacity-75">
                        Note: For this MVP, any passphrase works (Fixed Salt). In production, this would match against a checksum.
                    </p>
                </form>
            </div>
        </div>
    );
};
