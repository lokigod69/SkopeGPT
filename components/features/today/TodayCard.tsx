/**
 * TodayCard - The heart of the daily 90-second loop
 * Shows active seed with Do/Log/Skip CTAs
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CoachSystem } from '@/domain/coachCopy';
import type { CoachPreset, Seed, Goal } from '@/lib/schemas';
import { FrictionTriage } from './FrictionTriage';

interface TodayCardProps {
  seed: Seed;
  goal: Goal;
  coachPreset: CoachPreset;
  onDoStart: () => void;
  onLogDone: () => void;
  onSkipComplete: (reason: string, notes?: string) => void;
}

export function TodayCard({
  seed,
  goal,
  coachPreset,
  onDoStart,
  onLogDone,
  onSkipComplete,
}: TodayCardProps) {
  const [showTriage, setShowTriage] = useState(false);
  const [isLogging, setIsLogging] = useState(false);

  const handleLogDone = async () => {
    setIsLogging(true);
    try {
      await onLogDone();
    } finally {
      setIsLogging(false);
    }
  };

  const handleSkipClick = () => {
    setShowTriage(true);
  };

  const handleTriageComplete = (reason: string, notes?: string) => {
    setShowTriage(false);
    onSkipComplete(reason, notes);
  };

  const coachCopy = CoachSystem.getCoachCopy(coachPreset, 'start');

  return (
    <>
      <Card className="border-border bg-card">
        <CardHeader>
          <CardDescription className="text-xs uppercase tracking-wide text-muted-foreground">
            {goal.title}
          </CardDescription>
          <CardTitle className="text-xl font-semibold">
            {coachCopy}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* The Seed - Main Action */}
          <div className="p-4 rounded-lg bg-primary/5 border-l-4 border-primary">
            <p className="text-base font-medium">{seed.description}</p>
            {seed.if_window && (
              <p className="text-sm text-muted-foreground mt-2">
                <span className="font-semibold">When:</span> {seed.if_window}
              </p>
            )}
            {seed.if_context && (
              <p className="text-xs text-muted-foreground mt-1">
                Where: {seed.if_context}
              </p>
            )}
          </div>

          {/* CTAs - The three critical buttons */}
          <div className="grid grid-cols-3 gap-3">
            <Button
              onClick={handleLogDone}
              disabled={isLogging}
              variant="outline"
              className="h-auto py-4 flex flex-col gap-1 border-2 hover:border-primary hover:bg-primary/10"
            >
              <span className="text-2xl">✓</span>
              <span className="text-xs font-semibold">Log</span>
            </Button>

            <Button
              onClick={onDoStart}
              className="h-auto py-4 flex flex-col gap-1 col-span-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <span className="text-2xl">→</span>
              <span className="text-xs font-semibold">Do</span>
            </Button>

            <Button
              onClick={handleSkipClick}
              variant="outline"
              className="h-auto py-4 flex flex-col gap-1 border-2 hover:border-muted-foreground/50"
            >
              <span className="text-2xl">⊗</span>
              <span className="text-xs font-semibold">Skip</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Friction Triage Modal */}
      {showTriage && (
        <FrictionTriage
          coachPreset={coachPreset}
          onComplete={handleTriageComplete}
          onCancel={() => setShowTriage(false)}
        />
      )}
    </>
  );
}
