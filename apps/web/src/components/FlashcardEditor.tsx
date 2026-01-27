import React, { useState } from 'react';
import { CardType } from '@studyos/core';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import type { Flashcard } from '@studyos/core';

interface FlashcardEditorProps {
    initialData?: Flashcard | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onSave: (front: string, back: string, extra: any) => Promise<void>;
    onCancel: () => void;
}

export const FlashcardEditor: React.FC<FlashcardEditorProps> = ({ initialData, onSave, onCancel }) => {
    const [type, setType] = useState<CardType>(initialData?.type || CardType.BASIC);
    const [front, setFront] = useState(initialData?.front || '');
    const [back, setBack] = useState(initialData?.back || '');

    // MCQ
    const [options, setOptions] = useState<string[]>(initialData?.options || ['', '', '', '']);
    const [correctIndex, setCorrectIndex] = useState(initialData?.correctAnswerIndex || 0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const extra: any = { type };

        if (type === CardType.MCQ) {
            extra.options = options.filter(o => o.trim()); // Filter empty? Or keep logic simple
            // Ensure we have at least 2 options for MCQ
            if (options.length < 2) {
                alert('Please provide at least 2 options for MCQ.');
                return;
            }
            extra.options = options;
            extra.correctAnswerIndex = correctIndex;
            // Back is reused as explanation
        } else if (type === CardType.CLOZE) {
            // Not fully implemented in core logic yet besides storage
        } else if (type === CardType.BASIC) {
            // Standard
        }

        await onSave(front, back, extra);
    };

    const updateOption = (idx: number, val: string) => {
        const newOpts = [...options];
        newOpts[idx] = val;
        setOptions(newOpts);
    };

    const addOption = () => {
        if (options.length < 6) setOptions([...options, '']);
    };

    const removeOption = (idx: number) => {
        if (options.length > 2) {
            const newOpts = options.filter((_, i) => i !== idx);
            setOptions(newOpts);
            if (correctIndex >= idx && correctIndex > 0) setCorrectIndex(correctIndex - 1);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 bg-secondary rounded-xl border border-border space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-primary">New Flashcard</h3>
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value as CardType)}
                    className="bg-tertiary text-primary p-2 rounded border border-border"
                >
                    <option value={CardType.BASIC}>Basic</option>
                    <option value={CardType.CLOZE}>Cloze</option>
                    <option value={CardType.MCQ}>Multiple Choice</option>
                </select>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-primary-muted uppercase mb-1">
                        {type === CardType.MCQ ? 'Question' : 'Front'} <span className="font-normal text-xs normal-case opacity-50 ml-2">Supports LaTeX ($...$)</span>
                    </label>
                    <textarea
                        className="w-full bg-tertiary border border-border rounded p-3 text-primary focus:border-accent font-mono text-sm h-24"
                        value={front}
                        onChange={(e) => setFront(e.target.value)}
                        placeholder={type === CardType.MCQ ? "Enter question here..." : "e.g. What is the capital of France?"}
                    />
                    <div className="mt-2 p-3 bg-tertiary/50 rounded text-sm text-primary prose prose-invert prose-p:my-0 prose-headings:my-1">
                        <span className="text-xs text-primary-muted block mb-1">Preview:</span>
                        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                            {front || 'Start typing...'}
                        </ReactMarkdown>
                    </div>
                </div>

                {type === CardType.MCQ ? (
                    <div className="pt-4 border-t border-border">
                        <label className="block text-xs font-bold text-primary-muted uppercase mb-2">Options (Select Correct Answer)</label>
                        <div className="space-y-2">
                            {options.map((opt, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name="correctIndex"
                                        checked={correctIndex === idx}
                                        onChange={() => setCorrectIndex(idx)}
                                        className="accent-accent w-4 h-4 cursor-pointer"
                                    />
                                    <input
                                        className="flex-1 bg-tertiary border border-border rounded p-2 text-primary text-sm"
                                        value={opt}
                                        onChange={(e) => updateOption(idx, e.target.value)}
                                        placeholder={`Option ${idx + 1}`}
                                        required
                                    />
                                    {options.length > 2 && (
                                        <button type="button" onClick={() => removeOption(idx)} className="text-red-400 hover:text-red-300 px-2">✕</button>
                                    )}
                                </div>
                            ))}
                        </div>
                        {options.length < 6 && (
                            <button type="button" onClick={addOption} className="mt-2 text-xs text-accent hover:underline">+ Add Option</button>
                        )}

                        <div className="mt-4">
                            <label className="block text-xs font-bold text-primary-muted uppercase mb-1">Explanation (Optional)</label>
                            <textarea
                                className="w-full bg-tertiary border border-border rounded p-3 text-primary focus:border-accent font-mono text-sm h-20"
                                value={back}
                                onChange={(e) => setBack(e.target.value)}
                                placeholder="Explain why the answer is correct..."
                            />
                        </div>
                    </div>
                ) : (
                    <div>
                        <label className="block text-xs font-bold text-primary-muted uppercase mb-1">Back (Answer)</label>
                        <textarea
                            className="w-full bg-tertiary border border-border rounded p-3 text-primary focus:border-accent font-mono text-sm h-24"
                            value={back}
                            onChange={(e) => setBack(e.target.value)}
                            placeholder="e.g. Paris"
                        />
                        <div className="mt-2 p-3 bg-tertiary/50 rounded text-sm text-primary prose prose-invert prose-p:my-0 prose-headings:my-1">
                            <span className="text-xs text-primary-muted block mb-1">Preview:</span>
                            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                {back || 'Start typing...'}
                            </ReactMarkdown>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 text-primary-muted hover:text-primary">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-accent hover:bg-blue-600 text-white rounded font-bold transition">Save Card</button>
            </div>
        </form>
    );
};
