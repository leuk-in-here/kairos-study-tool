import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
    timeZone: string; // 'local' or offset like 'GMT+8'
    is24Hour: boolean;
    showSeconds: boolean;

    setTimeZone: (tz: string) => void;
    setIs24Hour: (is24: boolean) => void;
    setShowSeconds: (show: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            timeZone: 'local',
            is24Hour: false,
            showSeconds: false,

            setTimeZone: (timeZone) => set({ timeZone }),
            setIs24Hour: (is24Hour) => set({ is24Hour }),
            setShowSeconds: (showSeconds) => set({ showSeconds }),
        }),
        {
            name: 'kairos-settings-storage',
        }
    )
);
