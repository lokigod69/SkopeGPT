/**
 * Offline Queue and Sync Engine
 * Queues operations when offline and syncs when back online
 * Works with IndexedDB and service worker
 */

import { db } from '@/lib/db/dexie';

export interface QueuedOperation {
  id: string;
  type: 'LOG_DONE' | 'LOG_SKIP' | 'UPDATE_SEED' | 'CREATE_GOAL';
  payload: any;
  timestamp: number;
  retries: number;
  lastError?: string;
}

const MAX_RETRIES = 3;

/**
 * Add operation to offline queue
 */
export async function queueOperation(
  type: QueuedOperation['type'],
  payload: any
): Promise<string> {
  const operation: QueuedOperation = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    type,
    payload,
    timestamp: Date.now(),
    retries: 0,
  };

  await db.syncQueue.add(operation);

  // Try immediate sync if online
  if (navigator.onLine) {
    syncQueue().catch(console.error);
  }

  return operation.id;
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

  for (const operation of operations) {
    try {
      await executeOperation(operation);
      await db.syncQueue.delete(operation.id);
      synced++;
    } catch (error) {
      const updatedOp = {
        ...operation,
        retries: operation.retries + 1,
        lastError: error instanceof Error ? error.message : 'Unknown error',
      };

      if (updatedOp.retries >= MAX_RETRIES) {
        // Move to failed operations or delete
        await db.syncQueue.delete(operation.id);
        failed++;
        console.error('[Sync] Max retries reached for operation:', operation);
      } else {
        // Update with retry count
        await db.syncQueue.put(updatedOp);
      }
    }
  }

  const remaining = await db.syncQueue.count();

  return { synced, failed, pending: remaining };
}

/**
 * Execute a queued operation
 */
async function executeOperation(operation: QueuedOperation): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  switch (operation.type) {
    case 'LOG_DONE':
      await fetch(`${baseUrl}/api/trpc/daily.logDone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(operation.payload),
      }).then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      });
      break;

    case 'LOG_SKIP':
      await fetch(`${baseUrl}/api/trpc/daily.logSkip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(operation.payload),
      }).then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      });
      break;

    case 'UPDATE_SEED':
      await fetch(`${baseUrl}/api/trpc/seeds.update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(operation.payload),
      }).then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      });
      break;

    case 'CREATE_GOAL':
      await fetch(`${baseUrl}/api/trpc/goals.create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(operation.payload),
      }).then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      });
      break;

    default:
      throw new Error(`Unknown operation type: ${operation.type}`);
  }
}

/**
 * Get queue status
 */
export async function getQueueStatus(): Promise<{
  count: number;
  oldestTimestamp?: number;
  operations: QueuedOperation[];
}> {
  const operations = await db.syncQueue.orderBy('timestamp').toArray();

  return {
    count: operations.length,
    oldestTimestamp: operations[0]?.timestamp,
    operations,
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
    if (navigator.onLine) {
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

// Fix: Add React import for the hook
import * as React from 'react';
