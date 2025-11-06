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

  const coachCopy = CoachSystem.getCoachCopy(coachPreset, 'prompt');

  return (
    <>
      <Card className="border-border bg-card">
        <CardHeader>
          <CardDescription className="text-xs uppercase tracking-wide text-muted-foreground">
            {goal.horizon}
          </CardDescription>
          <CardTitle className="text-xl font-semibold">
            {coachCopy}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* The Seed - Main Action */}
          <div className="p-4 rounded-lg bg-primary/5 border-l-4 border-primary">
            <p className="text-base font-medium">{seed.step_description}</p>
            {seed.if_then_cue && (
              <p className="text-sm text-muted-foreground mt-2">
                <span className="font-semibold">When:</span> {seed.if_then_cue}
              </p>
            )}
            {seed.window_start && seed.window_end && (
              <p className="text-xs text-muted-foreground mt-1">
                Best time: {seed.window_start} - {seed.window_end}
              </p>
            )}
          </div>

          {/* Energy Budget Reminder */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`w-2 h-6 rounded-sm ${
                    level <= getEnergyLevel(seed.energy_budget)
                      ? 'bg-electric-teal'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            <span className="capitalize">{seed.energy_budget} energy</span>
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

          {/* Quick Stats */}
          {seed.rolling_success !== null && seed.rolling_success !== undefined && (
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">14-day success</span>
                <span className="font-semibold text-primary">
                  {Math.round(seed.rolling_success * 100)}%
                </span>
              </div>
            </div>
          )}
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

// Helper to convert energy budget to visual level
function getEnergyLevel(budget: string): number {
  const levels: Record<string, number> = {
    tiny: 1,
    small: 2,
    medium: 3,
    big: 4,
  };
  return levels[budget] || 2;
}
