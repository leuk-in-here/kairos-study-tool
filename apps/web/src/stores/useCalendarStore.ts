import { create } from 'zustand';
import { type CalendarEvent } from '@studyos/core';
import { calendarRepository } from '../lib/storage';
import { v4 as uuidv4 } from 'uuid';

interface CalendarState {
    events: CalendarEvent[];
    isLoading: boolean;

    // Actions
    fetchEvents: () => Promise<void>;
    addEvent: (title: string, start: number, end: number, isAllDay?: boolean, color?: string) => Promise<void>;
    updateEvent: (id: string, updates: Partial<CalendarEvent>) => Promise<void>;
    deleteEvent: (id: string) => Promise<void>;
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
    events: [],
    isLoading: false,

    fetchEvents: async () => {
        set({ isLoading: true });
        try {
            const events = await calendarRepository.getAllEvents();
            set({ events });
        } catch (error) {
            console.error('Failed to fetch events', error);
        } finally {
            set({ isLoading: false });
        }
    },

    addEvent: async (title: string, start: number, end: number, isAllDay = false, color = '#3b82f6') => {
        const newEvent: CalendarEvent = {
            id: uuidv4(),
            title,
            startTime: start,
            endTime: end,
            isAllDay,
            color,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        // Optimistic update
        set((state) => ({ events: [...state.events, newEvent] }));

        await calendarRepository.saveEvent(newEvent);
    },

    updateEvent: async (id: string, updates: Partial<CalendarEvent>) => {
        const state = get();
        const event = state.events.find((e) => e.id === id);
        if (!event) return;

        const updatedEvent = { ...event, ...updates, updatedAt: Date.now() };

        set((state) => ({
            events: state.events.map((e) => (e.id === id ? updatedEvent : e)),
        }));

        await calendarRepository.saveEvent(updatedEvent);
    },

    deleteEvent: async (id: string) => {
        set((state) => ({
            events: state.events.filter((e) => e.id !== id),
        }));
        await calendarRepository.deleteEvent(id);
    },
}));
