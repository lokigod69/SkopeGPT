/**
 * Offline Queue and Sync Engine
 * Queues operations when offline and syncs when back online
 * Works with IndexedDB and service worker
 */

import * as React from 'react';
import { db, type SyncEvent } from '@/lib/db/dexie';

const MAX_RETRIES = 3;

// Map QueuedOperation type names to SyncEvent type names
const TYPE_MAP: Record<string, SyncEvent['type']> = {
  'LOG_DONE': 'log_done',
  'LOG_SKIP': 'log_skip',
  'UPDATE_SEED': 'update_seed',
  'CREATE_GOAL': 'create_goal',
};

/**
 * Add operation to offline queue
 */
export async function queueOperation(
  type: keyof typeof TYPE_MAP,
  payload: any,
  entityId: string = ''
): Promise<number> {
  const event: Omit<SyncEvent, 'id'> = {
    type: TYPE_MAP[type] || 'log_done',
    entity_id: entityId,
    payload,
    created_at: new Date(),
    synced: false,
  };

  const id = await db.syncQueue.add(event as any);

  // Try immediate sync if online
  if (typeof window !== 'undefined' && navigator.onLine) {
    syncQueue().catch(console.error);
  }

  return id ?? 0;
}

/**
 * Sync all pending operations
 */
export async function syncQueue(): Promise<{
  synced: number;
  failed: number;
  pending: number;
}> {
  const operations = await db.syncQueue.toArray();

  if (operations.length === 0) {
    return { synced: 0, failed: 0, pending: 0 };
  }

  let synced = 0;
  let failed = 0;

  for (const event of operations) {
    // Skip already synced events
    if (event.synced) continue;

    try {
      await executeOperation(event);
      // Mark as synced
      await db.syncQueue.update(event.id!, { synced: true });
      synced++;
    } catch (error) {
      failed++;
      console.error('[Sync] Sync failed for event:', event, error);
    }
  }

  const remaining = await db.syncQueue.count();

  return { synced, failed, pending: remaining };
}

/**
 * Execute a queued operation
 */
async function executeOperation(event: SyncEvent): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  switch (event.type) {
    case 'log_done':
      await fetch(`${baseUrl}/api/trpc/daily.logDone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event.payload),
      }).then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      });
      break;

    case 'log_skip':
      await fetch(`${baseUrl}/api/trpc/daily.logSkip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event.payload),
      }).then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      });
      break;

    case 'update_seed':
      await fetch(`${baseUrl}/api/trpc/seeds.update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event.payload),
      }).then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      });
      break;

    case 'create_goal':
      await fetch(`${baseUrl}/api/trpc/goals.create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event.payload),
      }).then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      });
      break;

    default:
      throw new Error(`Unknown event type: ${event.type}`);
  }
}

/**
 * Get queue status
 */
export async function getQueueStatus(): Promise<{
  count: number;
  oldestTimestamp?: number;
  events: SyncEvent[];
}> {
  const events = await db.syncQueue.orderBy('created_at').toArray();

  return {
    count: events.length,
    oldestTimestamp: events[0]?.created_at.getTime(),
    events,
  };
}

/**
 * Clear all queued operations
 */
export async function clearQueue(): Promise<void> {
  await db.syncQueue.clear();
}

/**
 * Setup online/offline listeners
 */
export function setupSyncListeners() {
  if (typeof window === 'undefined') return;

  // Sync when coming back online
  window.addEventListener('online', () => {
    console.log('[Sync] Back online, syncing queue...');
    syncQueue()
      .then((result) => {
        console.log('[Sync] Sync complete:', result);
      })
      .catch((error) => {
        console.error('[Sync] Sync failed:', error);
      });
  });

  // Log when going offline
  window.addEventListener('offline', () => {
    console.log('[Sync] Offline - operations will be queued');
  });

  // Periodic sync every 5 minutes if online
  setInterval(() => {
    if (typeof window !== 'undefined' && navigator.onLine) {
      syncQueue().catch(console.error);
    }
  }, 5 * 60 * 1000);
}

/**
 * Hook for React components
 */
export function useSyncStatus() {
  if (typeof window === 'undefined') {
    return {
      isOnline: true,
      queueCount: 0,
      sync: async () => {},
    };
  }

  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [queueCount, setQueueCount] = React.useState(0);

  React.useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    const updateQueueCount = () => {
      getQueueStatus().then((status) => setQueueCount(status.count));
    };

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Update queue count periodically
    updateQueueCount();
    const interval = setInterval(updateQueueCount, 10000);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      clearInterval(interval);
    };
  }, []);

  return {
    isOnline,
    queueCount,
    sync: syncQueue,
  };
}
