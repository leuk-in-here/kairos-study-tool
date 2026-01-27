import React, { useState, useEffect } from 'react';
import { useSettingsStore } from '../stores/useSettingsStore';

export const Clock: React.FC = () => {
    const [time, setTime] = useState(new Date());
    const { timeZone, is24Hour, showSeconds } = useSettingsStore();

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Helper to get time in specific timezone
    const getTimeInZone = (date: Date, zone: string) => {
        if (zone === 'local') return date;

        // Handle GMT offsets roughly for MVP or use native Date with timeZone option if supported
        // Ideally we use toLocaleString with timeZone, but for 'GMT+X' strings we might need parsing.
        // For now let's rely on standard IANA strings or 'UTC'. 
        // If user selects 'GMT+8', we might need to manually adjust.
        // Let's assume standard IANA timezones for robust support or simple offsets.
        // Actually, for a simple "change time zone based on GMT" request:

        try {
            // Check if it's an offset string like "GMT+8"
            if (zone.startsWith('GMT')) {
                const offset = parseInt(zone.replace('GMT', ''));
                if (!isNaN(offset)) {
                    const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
                    return new Date(utc + (3600000 * offset));
                }
            }
            // Try as IANA zone
            return new Date(date.toLocaleString('en-US', { timeZone: zone }));
        } catch (e) {
            return date; // Fallback to local
        }
    };

    const displayTime = getTimeInZone(time, timeZone);

    return (
        <div className="text-right">
            <div className="text-2xl font-bold text-primary font-mono leading-none">
                {displayTime.toLocaleTimeString([], {
                    hour12: !is24Hour,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: showSeconds ? '2-digit' : undefined
                })}
            </div>
            <div className="text-xs text-primary-muted font-medium">
                {displayTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
        </div>
    );
};
