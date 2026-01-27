import React, { useState } from 'react';
import { exportData, downloadJson } from '../lib/export-service';
import { useThemeStore } from '../stores/useThemeStore';
import { useSettingsStore } from '../stores/useSettingsStore';

export const SettingsPage: React.FC = () => {
    const [isExporting, setIsExporting] = useState(false);
    const { theme, setTheme, fontSize, setFontSize } = useThemeStore();
    const { timeZone, setTimeZone, is24Hour, setIs24Hour, showSeconds, setShowSeconds } = useSettingsStore();

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const data = await exportData();
            const dateStr = new Date().toISOString().split('T')[0];
            downloadJson(data, `studyos-backup-${dateStr}.json`);
        } catch (e) {
            console.error('Export failed', e);
            alert('Export failed. Check console.');
        } finally {
            setIsExporting(false);
        }
    };

    const timeZones = [
        { value: 'local', label: 'Local Time' },
        { value: 'UTC', label: 'UTC' },
        { value: 'GMT+0', label: 'GMT+0' },
        { value: 'GMT+1', label: 'GMT+1' },
        { value: 'GMT+2', label: 'GMT+2' },
        { value: 'GMT+3', label: 'GMT+3' },
        { value: 'GMT+4', label: 'GMT+4' },
        { value: 'GMT+5', label: 'GMT+5' },
        { value: 'GMT+6', label: 'GMT+6' },
        { value: 'GMT+7', label: 'GMT+7' },
        { value: 'GMT+8', label: 'GMT+8' },
        { value: 'GMT+9', label: 'GMT+9' },
        { value: 'GMT+10', label: 'GMT+10' },
        { value: 'GMT+11', label: 'GMT+11' },
        { value: 'GMT+12', label: 'GMT+12' },
        { value: 'GMT-1', label: 'GMT-1' },
        { value: 'GMT-2', label: 'GMT-2' },
        { value: 'GMT-3', label: 'GMT-3' },
        { value: 'GMT-4', label: 'GMT-4' },
        { value: 'GMT-5', label: 'GMT-5' },
        { value: 'GMT-6', label: 'GMT-6' },
        { value: 'GMT-7', label: 'GMT-7' },
        { value: 'GMT-8', label: 'GMT-8' },
        { value: 'GMT-9', label: 'GMT-9' },
        { value: 'GMT-10', label: 'GMT-10' },
        { value: 'GMT-11', label: 'GMT-11' },
        { value: 'GMT-12', label: 'GMT-12' },
    ];

    return (
        <div className="max-w-3xl mx-auto space-y-8 p-4">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                Settings
            </h2>

            {/* Clock Settings */}
            <div className="bg-secondary rounded-xl p-6 border border-border">
                <h3 className="text-xl font-bold mb-4 text-primary">Clock & Time</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-primary-muted mb-2">Time Zone</label>
                        <select
                            value={timeZone}
                            onChange={(e) => setTimeZone(e.target.value)}
                            className="w-full bg-tertiary border border-border rounded px-3 py-2 text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                        >
                            {timeZones.map((tz) => (
                                <option key={tz.value} value={tz.value}>{tz.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-4">
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={is24Hour}
                                onChange={(e) => setIs24Hour(e.target.checked)}
                                className="form-checkbox h-5 w-5 text-accent rounded focus:ring-offset-gray-900"
                            />
                            <span className="text-primary">Use 24-Hour Format</span>
                        </label>

                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showSeconds}
                                onChange={(e) => setShowSeconds(e.target.checked)}
                                className="form-checkbox h-5 w-5 text-accent rounded focus:ring-offset-gray-900"
                            />
                            <span className="text-primary">Show Seconds</span>
                        </label>
                    </div>
                </div>
            </div>

            <div className="bg-secondary rounded-xl p-6 border border-border">
                <h3 className="text-xl font-bold mb-4 text-primary">Theme</h3>
                <div className="flex gap-4">
                    <button
                        onClick={() => setTheme('day')}
                        className={`px-4 py-2 rounded border transition ${theme === 'day' ? 'bg-accent border-accent text-white' : 'bg-tertiary border-border hover:bg-gray-600 text-primary'}`}
                    >
                        Day (Light)
                    </button>
                    <button
                        onClick={() => setTheme('night')}
                        className={`px-4 py-2 rounded border transition ${theme === 'night' ? 'bg-accent border-accent text-white' : 'bg-tertiary border-border hover:bg-gray-600 text-primary'}`}
                    >
                        Night (Dark)
                    </button>
                    <button
                        onClick={() => setTheme('contrast')}
                        className={`px-4 py-2 rounded border transition ${theme === 'contrast' ? 'bg-orange-600 border-orange-500 font-bold text-white' : 'bg-tertiary border-border hover:bg-gray-600 text-primary'}`}
                    >
                        High Contrast
                    </button>
                </div>
            </div>

            <div className="bg-secondary rounded-xl p-6 border border-border">
                <h3 className="text-xl font-bold mb-4 text-primary">Font Size</h3>
                <div className="flex gap-4 flex-wrap">
                    {(['small', 'medium', 'large', 'xl'] as const).map((size) => (
                        <button
                            key={size}
                            onClick={() => setFontSize(size)}
                            className={`px-4 py-2 rounded border transition capitalize ${fontSize === size ? 'bg-accent border-accent text-white' : 'bg-tertiary border-border hover:bg-gray-600 text-primary'}`}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-secondary rounded-xl p-6 border border-border">
                <h3 className="text-xl font-bold mb-4 text-primary">Data Management</h3>
                <p className="text-primary-muted mb-6 text-sm">
                    Export your data to a JSON file. This export is <strong>decrypted</strong> and readable.
                    Keep it safe!
                </p>

                <div className="flex gap-4">
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="px-6 py-3 bg-accent hover:bg-blue-600 text-white rounded-lg font-medium transition disabled:opacity-50"
                    >
                        {isExporting ? 'Preparing Download...' : 'Export Data (JSON)'}
                    </button>
                    {/* Future: Clean Database Button */}
                </div>
            </div>

            <div className="bg-secondary rounded-xl p-6 border border-border opacity-60">
                <h3 className="text-xl font-bold mb-4 text-primary">Security</h3>
                <p className="text-primary-muted mb-2 text-sm">Passphrase change is not yet supported in this version.</p>
                <button
                    disabled
                    className="px-6 py-3 bg-tertiary text-primary-muted rounded-lg font-medium cursor-not-allowed"
                >
                    Change Passphrase
                </button>
            </div>
        </div>
    );
};
