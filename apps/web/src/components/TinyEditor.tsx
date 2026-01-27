import React, { useEffect, useRef } from 'react';
// @ts-ignore
import { Editor, CommandBar } from 'tiny-markdown-editor';
import 'tiny-markdown-editor/dist/tiny-mde.css';

interface TinyEditorProps {
    content: string;
    onChange: (content: string) => void;
}

export const TinyEditor: React.FC<TinyEditorProps> = ({ content, onChange }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const editorRef = useRef<any>(null);

    // Initialize Editor
    useEffect(() => {
        if (!containerRef.current) return;

        // Clear previous instance if any
        containerRef.current.innerHTML = '';

        // Create Command Bar Container
        const commandBarContainer = document.createElement('div');
        commandBarContainer.className = 'tiny-mde-toolbar bg-secondary border-b border-border p-2';
        containerRef.current.appendChild(commandBarContainer);

        // Create Editor Container
        const editorContainer = document.createElement('div');
        editorContainer.className = 'tiny-mde-content flex-1 overflow-y-auto bg-background p-4 text-primary';
        editorContainer.style.height = 'calc(100% - 40px)'; // Adjust for toolbar
        containerRef.current.appendChild(editorContainer);

        const editor = new Editor({
            element: editorContainer,
            content: content,
        });

        new CommandBar({
            element: commandBarContainer,
            editor: editor,
        });

        const handleUpdate = () => {
            onChange(editor.getContent());
        };

        editor.addEventListener('change', handleUpdate);
        editorContainer.addEventListener('keyup', handleUpdate); // Keyup captures typing
        editorContainer.addEventListener('input', handleUpdate); // Input captures paste/cut/etc

        editorRef.current = editor;

        // Cleanup
        return () => {
            // TinyMDE doesn't seem to have a destroy method in basic docs, 
            // but removing the elements should be fine.
            editorRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only init once on mount

    // Handle external content changes (e.g. switching notes)
    useEffect(() => {
        if (editorRef.current && content !== editorRef.current.getContent()) {
            editorRef.current.setContent(content);
        }
    }, [content]);

    return <div ref={containerRef} className="h-full flex flex-col" />;
};
