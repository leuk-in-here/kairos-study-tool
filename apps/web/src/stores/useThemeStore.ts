import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'day' | 'night' | 'contrast';

export type FontSize = 'small' | 'medium' | 'large' | 'xl';

interface ThemeState {
    theme: Theme;
    fontSize: FontSize;
    setTheme: (theme: Theme) => void;
    setFontSize: (size: FontSize) => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            theme: 'night',
            fontSize: 'medium',
            setTheme: (theme) => set({ theme }),
            setFontSize: (fontSize) => set({ fontSize }),
        }),
        {
            name: 'kairos-theme-storage',
        }
    )
);
