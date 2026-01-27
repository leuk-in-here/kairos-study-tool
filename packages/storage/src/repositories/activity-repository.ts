import { ActivityLog } from '@studyos/core';
import { StorageAdapter } from '../adapters/types';

export class ActivityRepository {
    private collection = 'activities';

    constructor(private adapter: StorageAdapter) { }

    async logActivity(activity: ActivityLog): Promise<void> {
        await this.adapter.save(this.collection, activity.id, activity);
    }

    async getActivities(): Promise<ActivityLog[]> {
        return this.adapter.getAll<ActivityLog>(this.collection);
    }

    // In a real DB adapter, we would have range queries (getActivitiesByDateRange), but relying on getAll for MVP
}
