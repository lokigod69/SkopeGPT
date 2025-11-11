/**
 * Daily Log Actions
 * Handles logging done/skip and updating integration state
 */

import { db, queueSyncEvent, calculateRollingSuccess, type LocalDailyLog, type LocalIntegrationState } from '@/lib/db/dexie';
import type { SkipReason } from '@/lib/schemas';

interface LogDoneParams {
  seedId: string;
  notes?: string;
  energyAfter?: number;
}

interface LogSkipParams {
  seedId: string;
  skipReason: SkipReason;
  notes?: string;
}

/**
 * Log a "done" outcome for today
 * Creates daily log, queues sync, updates integration state
 */
export async function logDone(params: LogDoneParams): Promise<{
  log: LocalDailyLog;
  integrationState: LocalIntegrationState;
  showIntegrationCheck: boolean;
}> {
  const { seedId, notes, energyAfter } = params;

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const logId = crypto.randomUUID();

  // Check if log already exists for today
  const existingLog = await db.daily_logs
    .where({ seed_id: seedId, date: today })
    .first();

  if (existingLog) {
    throw new Error('Already logged for today');
  }

  // Create daily log
  const dailyLog: LocalDailyLog = {
    id: logId,
    seed_id: seedId,
    date: today,
    outcome: 'done',
    energy_after: energyAfter,
    notes,
    sync_status: 'pending',
    created_at: new Date(),
  };

  // Calculate new rolling success
  const newRollingSuccess = await calculateRollingSuccess(seedId, 14);

  // Get current integration state
  let integrationState = await db.integration_states.get(seedId);

  if (!integrationState) {
    // Create new integration state if it doesn't exist
    integrationState = {
      seed_id: seedId,
      rolling_success: newRollingSuccess,
      status: 'not_yet',
      sync_status: 'pending',
      updated_at: new Date(),
    };
  } else {
    // Update existing integration state
    integrationState = {
      ...integrationState,
      rolling_success: newRollingSuccess,
      sync_status: 'pending',
      updated_at: new Date(),
    };
  }

  // Persist in transaction
  await db.transaction('rw', [db.daily_logs, db.integration_states], async () => {
    await db.daily_logs.add(dailyLog);
    await db.integration_states.put(integrationState!);
  });

  // Queue sync events
  await queueSyncEvent({
    type: 'log_done',
    entity_id: logId,
    payload: {
      seed_id: seedId,
      date: today,
      outcome: 'done',
      energy_after: energyAfter,
      notes,
    },
  });

  await queueSyncEvent({
    type: 'update_integration',
    entity_id: seedId,
    payload: {
      rolling_success: integrationState.rolling_success,
      status: integrationState.status,
    },
  });

  // Determine if integration check should be shown
  // Show after 7+ logs with good success rate
  const recentLogs = await db.daily_logs
    .where('seed_id')
    .equals(seedId)
    .toArray();

  const showIntegrationCheck =
    recentLogs.length >= 7 &&
    newRollingSuccess >= 0.7 &&
    integrationState.status === 'not_yet';

  return { log: dailyLog, integrationState, showIntegrationCheck };
}

/**
 * Log a "skipped" outcome for today
 * Creates daily log, queues sync
 */
export async function logSkip(params: LogSkipParams): Promise<LocalDailyLog> {
  const { seedId, skipReason, notes } = params;

  const today = new Date().toISOString().split('T')[0];
  const logId = crypto.randomUUID();

  // Check if log already exists for today
  const existingLog = await db.daily_logs
    .where({ seed_id: seedId, date: today })
    .first();

  if (existingLog) {
    throw new Error('Already logged for today');
  }

  // Create daily log
  const dailyLog: LocalDailyLog = {
    id: logId,
    seed_id: seedId,
    date: today,
    outcome: 'skipped',
    skip_reason: skipReason,
    notes,
    sync_status: 'pending',
    created_at: new Date(),
  };

  // Persist
  await db.daily_logs.add(dailyLog);

  // Queue sync event
  await queueSyncEvent({
    type: 'log_skip',
    entity_id: logId,
    payload: {
      seed_id: seedId,
      date: today,
      outcome: 'skipped',
      skip_reason: skipReason,
      notes,
    },
  });

  return dailyLog;
}

/**
 * Update integration status after user assessment
 */
export async function updateIntegrationStatus(
  seedId: string,
  status: 'not_yet' | 'almost' | 'yes'
): Promise<void> {
  const integrationState = await db.integration_states.get(seedId);

  if (!integrationState) {
    throw new Error('Integration state not found');
  }

  const updated: LocalIntegrationState = {
    ...integrationState,
    status,
    sync_status: 'pending',
    updated_at: new Date(),
  };

  await db.integration_states.put(updated);

  await queueSyncEvent({
    type: 'update_integration',
    entity_id: seedId,
    payload: {
      rolling_success: updated.rolling_success,
      status,
    },
  });
}
