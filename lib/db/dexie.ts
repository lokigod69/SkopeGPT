/**
 * Dexie (IndexedDB) configuration for local-first storage
 * Stores goals, seeds, daily logs, and sync queue offline
 */

import Dexie, { type EntityTable } from 'dexie';
import type { Goal, Seed, DailyLog, IntegrationState } from '../schemas';

// Sync status for offline-first support
export type SyncStatus = 'pending' | 'synced' | 'conflict';

// Local entities with sync metadata
export interface LocalGoal extends Goal {
  sync_status: SyncStatus;
  sync_at?: Date;
}

export interface LocalSeed extends Seed {
  sync_status: SyncStatus;
  sync_at?: Date;
}

export interface LocalDailyLog extends DailyLog {
  sync_status: SyncStatus;
  sync_at?: Date;
}

export interface LocalIntegrationState extends IntegrationState {
  sync_status: SyncStatus;
  sync_at?: Date;
}

// Event queue for offline operations
export interface SyncEvent {
  id?: number; // auto-increment
  type: 'create_goal' | 'update_goal' | 'delete_goal' |
        'create_seed' | 'update_seed' | 'delete_seed' |
        'log_done' | 'log_skip' | 'update_integration';
  entity_id: string; // UUID of the affected entity
  payload: unknown; // JSON payload for the operation
  created_at: Date;
  synced: boolean;
}

// User preferences stored locally
export interface LocalPreferences {
  id: string; // user_id
  energy_baseline: 'tiny' | 'small' | 'medium' | 'big';
  coach_preset: 'drill' | 'socratic' | 'compassionate' | 'engineer';
  notifications_enabled: boolean;
  quiet_hours_start?: string; // HH:MM format
  quiet_hours_end?: string;
  updated_at: Date;
}

// Define the database
export class GoalAppDB extends Dexie {
  goals!: EntityTable<LocalGoal, 'id'>;
  seeds!: EntityTable<LocalSeed, 'id'>;
  daily_logs!: EntityTable<LocalDailyLog, 'id'>;
  integration_states!: EntityTable<LocalIntegrationState, 'seed_id'>;
  sync_events!: EntityTable<SyncEvent, 'id'>;
  preferences!: EntityTable<LocalPreferences, 'id'>;

  // Aliases for backward compatibility (camelCase → snake_case)
  get dailyLogs(): EntityTable<LocalDailyLog, 'id'> {
    return this.daily_logs;
  }

  get syncQueue(): EntityTable<SyncEvent, 'id'> {
    return this.sync_events;
  }

  get integrationStates(): EntityTable<LocalIntegrationState, 'seed_id'> {
    return this.integration_states;
  }

  constructor() {
    super('GoalAppDB');

    this.version(1).stores({
      goals: 'id, user_id, status, sync_status',
      seeds: 'id, goal_id, active, sync_status',
      daily_logs: 'id, seed_id, date, sync_status, [seed_id+date]',
      integration_states: 'seed_id, status, sync_status',
      sync_events: '++id, entity_id, synced, created_at',
      preferences: 'id',
    });
  }
}

// Export singleton instance
export const db = new GoalAppDB();

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get the current active seed for today
 */
export async function getTodayActiveSeed(): Promise<{ seed: LocalSeed; goal: LocalGoal } | null> {
  const activeSeeds = await db.seeds
    .filter(seed => seed.active === true)
    .toArray();

  if (activeSeeds.length === 0) return null;

  // Get the first active seed (enforce 1 active seed per user in app logic)
  const seed = activeSeeds[0];
  const goal = await db.goals.get(seed.goal_id);

  if (!goal) return null;

  return { seed, goal };
}

/**
 * Get daily logs for a seed within a date range
 */
export async function getDailyLogsForSeed(
  seedId: string,
  startDate: string,
  endDate: string
): Promise<LocalDailyLog[]> {
  return db.daily_logs
    .where('[seed_id+date]')
    .between([seedId, startDate], [seedId, endDate], true, true)
    .toArray();
}

/**
 * Get logs for the last N days for a seed
 */
export async function getRecentLogs(seedId: string, days: number = 14): Promise<LocalDailyLog[]> {
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  return getDailyLogsForSeed(seedId, startDate, endDate);
}

/**
 * Calculate rolling success rate for a seed
 */
export async function calculateRollingSuccess(seedId: string, days: number = 14): Promise<number> {
  const logs = await getRecentLogs(seedId, days);

  if (logs.length === 0) return 0;

  const doneCount = logs.filter(log => log.outcome === 'done').length;
  return doneCount / logs.length;
}

/**
 * Add an event to the sync queue
 */
export async function queueSyncEvent(event: Omit<SyncEvent, 'id' | 'created_at' | 'synced'>) {
  await db.sync_events.add({
    ...event,
    created_at: new Date(),
    synced: false,
  });
}

/**
 * Get all pending sync events
 */
export async function getPendingSyncEvents(): Promise<SyncEvent[]> {
  return db.sync_events
    .where('synced')
    .equals(0) // Dexie stores boolean as 0/1
    .sortBy('created_at');
}

/**
 * Mark a sync event as completed
 */
export async function markEventSynced(eventId: number) {
  await db.sync_events.update(eventId, { synced: true });
}

/**
 * Clear all local data (for privacy/reset)
 */
export async function clearAllLocalData() {
  await db.transaction('rw', [db.goals, db.seeds, db.daily_logs, db.integration_states, db.sync_events], async () => {
    await db.goals.clear();
    await db.seeds.clear();
    await db.daily_logs.clear();
    await db.integration_states.clear();
    await db.sync_events.clear();
  });
}

/**
 * Export all data as JSON
 */
export async function exportDataAsJSON() {
  const goals = await db.goals.toArray();
  const seeds = await db.seeds.toArray();
  const daily_logs = await db.daily_logs.toArray();
  const integration_states = await db.integration_states.toArray();
  const preferences = await db.preferences.toArray();

  return {
    version: 1,
    exported_at: new Date().toISOString(),
    data: {
      goals,
      seeds,
      daily_logs,
      integration_states,
      preferences,
    },
  };
}
