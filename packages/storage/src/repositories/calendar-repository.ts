import { StorageAdapter } from '../adapters/types';
import type { CalendarEvent } from '@studyos/core';

export class CalendarRepository {
    constructor(private adapter: StorageAdapter) { }

    async saveEvent(event: CalendarEvent): Promise<void> {
        await this.adapter.save('calendar_events', event.id, event);
    }

    async getEvent(id: string): Promise<CalendarEvent | null> {
        return this.adapter.get<CalendarEvent>('calendar_events', id);
    }

    async getAllEvents(): Promise<CalendarEvent[]> {
        return this.adapter.getAll<CalendarEvent>('calendar_events');
    }

    async deleteEvent(id: string): Promise<void> {
        await this.adapter.delete('calendar_events', id);
    }
}
