/**
 * Client Initialization Component
 * Registers service worker and sets up client-side functionality
 */

'use client';

import { useEffect } from 'react';
import { registerServiceWorker, setupInstallPrompt } from '@/lib/pwa/register-sw';
import { setupSyncListeners } from '@/lib/sync/offline-queue';

export function ClientInit() {
  useEffect(() => {
    // Register service worker for PWA functionality
    registerServiceWorker();

    // Setup install prompt for "Add to Home Screen"
    setupInstallPrompt();

    // Setup offline sync listeners
    setupSyncListeners();

    // Log app initialization
    console.log('[Goal App] Client initialized');
  }, []);

  return null; // This component doesn't render anything
}
