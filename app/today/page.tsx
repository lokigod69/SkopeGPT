/**
 * Today Page
 * Shows the active seed with Do/Log/Skip actions
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTodayActiveSeed } from '@/lib/db/dexie';
import { TodayCard } from '@/components/features/today/TodayCard';
import { LogDoneDialog } from '@/components/features/today/LogDoneDialog';
import { IntegrationCheck } from '@/components/features/today/IntegrationCheck';
import { logDone, logSkip, updateIntegrationStatus } from '@/domain/daily-log.actions';
import type { LocalSeed, LocalGoal } from '@/lib/db/dexie';

export default function TodayPage() {
  const router = useRouter();
  const [seed, setSeed] = useState<LocalSeed | null>(null);
  const [goal, setGoal] = useState<LocalGoal | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogDialog, setShowLogDialog] = useState(false);
  const [showIntegrationCheck, setShowIntegrationCheck] = useState(false);

  useEffect(() => {
    async function loadActiveSeed() {
      try {
        const result = await getTodayActiveSeed();

        if (!result) {
          // No active seed - redirect to onboarding
          router.push('/onboarding');
          return;
        }

        setSeed(result.seed);
        setGoal(result.goal);
      } catch (error) {
        console.error('Failed to load active seed:', error);
      } finally {
        setLoading(false);
      }
    }

    loadActiveSeed();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </main>
    );
  }

  if (!seed || !goal) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No active seed found</p>
      </main>
    );
  }

  const handleDoStart = () => {
    // Open log dialog immediately (user can add notes while doing the task)
    setShowLogDialog(true);
  };

  const handleLogSubmit = async (data: { notes?: string; energy_after?: number }) => {
    if (!seed) return;

    try {
      const result = await logDone({
        seedId: seed.id,
        notes: data.notes,
        energyAfter: data.energy_after,
      });

      setShowLogDialog(false);

      // Show integration check if conditions met
      if (result.showIntegrationCheck) {
        setShowIntegrationCheck(true);
      } else {
        // Reload seed to reflect updated state
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to log done:', error);
      alert('Failed to log. Please try again.');
    }
  };

  const handleIntegrationResponse = async (level: 'not_yet' | 'almost' | 'yes') => {
    if (!seed) return;

    try {
      await updateIntegrationStatus(seed.id, level);
      setShowIntegrationCheck(false);

      // TODO: If level === 'yes', promote to baseline and spawn new seed
      // For now, just reload
      window.location.reload();
    } catch (error) {
      console.error('Failed to update integration status:', error);
    }
  };

  const handleSkipComplete = async (reason: string, notes?: string) => {
    if (!seed) return;

    try {
      await logSkip({
        seedId: seed.id,
        skipReason: reason as any, // TODO: Proper type casting
        notes,
      });

      // TODO: Trigger adaptation based on skip reason (ticket #3)
      window.location.reload();
    } catch (error) {
      console.error('Failed to log skip:', error);
      alert('Failed to log skip. Please try again.');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {showIntegrationCheck ? (
          <IntegrationCheck
            coachPreset={goal.coach_preset}
            seedDescription={seed.description}
            onResponse={handleIntegrationResponse}
          />
        ) : (
          <TodayCard
            seed={seed}
            goal={goal}
            coachPreset={goal.coach_preset}
            onDoStart={handleDoStart}
            onLogDone={handleDoStart} // Both Do and Log use the same dialog
            onSkipComplete={handleSkipComplete}
          />
        )}

        {/* Log Done Dialog */}
        {showLogDialog && (
          <LogDoneDialog
            onSubmit={handleLogSubmit}
            onCancel={() => setShowLogDialog(false)}
          />
        )}
      </div>
    </main>
  );
}
