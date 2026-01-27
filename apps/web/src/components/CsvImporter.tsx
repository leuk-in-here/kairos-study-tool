import React, { useRef, useState } from 'react';
import Papa from 'papaparse';

interface CsvImporterProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onImport: (data: any[]) => void;
}

export const CsvImporter: React.FC<CsvImporterProps> = ({ onImport }) => {
    const fileInput = useRef<HTMLInputElement>(null);
    const [delimiter, setDelimiter] = useState(',');
    const [hasHeader, setHasHeader] = useState(true);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        Papa.parse(file, {
            delimiter: delimiter,
            header: hasHeader,
            skipEmptyLines: true,
            complete: (results) => {
                // Normalise data to generic format or just pass raw results
                // We expect at least Front/Back columns if header
                onImport(results.data);
                if (fileInput.current) fileInput.current.value = ''; // Reset
            },
            error: (err) => {
                alert(`Import failed: ${err.message}`);
            }
        });
    };

    return (
        <div className="p-4 bg-tertiary rounded-lg border border-border">
            <h3 className="font-bold text-primary mb-2">Import CSV</h3>
            <div className="flex flex-col gap-2 mb-4">
                <label className="text-xs text-primary-muted">Delimiter</label>
                <select
                    value={delimiter}
                    onChange={(e) => setDelimiter(e.target.value)}
                    className="bg-secondary text-primary p-2 rounded border border-border"
                >
                    <option value=",">Comma (,)</option>
                    <option value=";">Semicolon (;)</option>
                    <option value="\t">Tab</option>
                    <option value="|">Pipe (|)</option>
                </select>

                <label className="flex items-center gap-2 text-sm text-primary cursor-pointer mt-2">
                    <input
                        type="checkbox"
                        checked={hasHeader}
                        onChange={(e) => setHasHeader(e.target.checked)}
                        className="rounded bg-secondary border-border"
                    />
                    First row is header
                </label>
            </div>

            <input
                type="file"
                accept=".csv,.txt"
                ref={fileInput}
                onChange={handleFileChange}
                className="block w-full text-sm text-primary-muted
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-accent file:text-white
                    hover:file:bg-blue-600 cursor-pointer"
            />
        </div>
    );
};
