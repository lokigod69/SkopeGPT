/**
 * Clear Data Dialog
 * Confirmation dialog with long-press safety mechanism
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/db/dexie';

interface ClearDataDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ClearDataDialog({ isOpen, onClose, onConfirm }: ClearDataDialogProps) {
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isClearing, setIsClearing] = useState(false);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const HOLD_DURATION = 3000; // 3 seconds
  const PROGRESS_INTERVAL = 50; // Update every 50ms

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  const handleHoldStart = () => {
    setIsHolding(true);
    setHoldProgress(0);

    // Start progress animation
    const startTime = Date.now();
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setHoldProgress(progress);
    }, PROGRESS_INTERVAL);

    // Set completion timer
    holdTimerRef.current = setTimeout(() => {
      handleClearData();
    }, HOLD_DURATION);
  };

  const handleHoldEnd = () => {
    setIsHolding(false);
    setHoldProgress(0);

    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }

    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const handleClearData = async () => {
    setIsClearing(true);

    try {
      // Clear IndexedDB
      await db.transaction('rw', [db.goals, db.seeds, db.dailyLogs, db.syncQueue], async () => {
        await db.goals.clear();
        await db.seeds.clear();
        await db.dailyLogs.clear();
        await db.syncQueue.clear();
      });

      // Clear localStorage
      localStorage.clear();

      // Clear sessionStorage
      sessionStorage.clear();

      onConfirm();
      onClose();

      // Reload page to reset state
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } catch (error) {
      console.error('Failed to clear data:', error);
      alert('Failed to clear data. Please try again.');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Clear All Data?</DialogTitle>
          <DialogDescription>
            This action is permanent and cannot be undone
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Warning box */}
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
            <div className="flex gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-200 mb-1">
                  This will delete:
                </p>
                <ul className="text-xs text-red-200/80 space-y-0.5">
                  <li>• All goals and micro-steps</li>
                  <li>• All daily logs and history</li>
                  <li>• All notes and reflections</li>
                  <li>• All settings and preferences</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Hold-to-confirm button */}
          <div className="space-y-2">
            <p className="text-sm text-center text-muted-foreground">
              Hold the button for 3 seconds to confirm
            </p>

            <div className="relative">
              <button
                onMouseDown={handleHoldStart}
                onMouseUp={handleHoldEnd}
                onMouseLeave={handleHoldEnd}
                onTouchStart={handleHoldStart}
                onTouchEnd={handleHoldEnd}
                disabled={isClearing}
                className={`w-full py-4 rounded-lg font-semibold transition-all relative overflow-hidden ${
                  isClearing
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-600 text-white active:scale-98'
                }`}
              >
                {/* Progress bar background */}
                <div
                  className="absolute inset-0 bg-red-700 transition-all"
                  style={{
                    width: `${holdProgress}%`,
                    transitionDuration: isHolding ? '50ms' : '200ms',
                  }}
                />

                {/* Button text */}
                <span className="relative z-10">
                  {isClearing
                    ? 'Clearing...'
                    : isHolding
                      ? `Hold... ${Math.ceil(((HOLD_DURATION - (holdProgress / 100) * HOLD_DURATION) / 1000))}`
                      : 'Hold to Clear All Data'}
                </span>
              </button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Release to cancel
            </p>
          </div>

          {/* Cancel button */}
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
            disabled={isClearing}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
