/**
 * Step 4: Soil/Seed Snapshot
 * Where are you now? + Pick your first micro-step
 */

'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { OnboardingCard } from './OnboardingCard';
import { useOnboarding } from '@/domain/onboarding.store';
import { proposeMicroSteps, energyCopy } from '@/domain/microsteps';

interface SoilSeedStepProps {
  onComplete: () => void;
  onBack: () => void;
}

export function SoilSeedStep({ onComplete, onBack }: SoilSeedStepProps) {
  const horizon = useOnboarding((s) => s.horizon);
  const energy = useOnboarding((s) => s.energy);
  const soilRating = useOnboarding((s) => s.soilRating);
  const setSoilRating = useOnboarding((s) => s.setSoilRating);
  const selectedSeed = useOnboarding((s) => s.selectedSeed);
  const setSelectedSeed = useOnboarding((s) => s.setSelectedSeed);

  // Generate micro-step options based on energy + feeling
  const microSteps = useMemo(
    () => proposeMicroSteps({ energy, feeling: soilRating, horizon }),
    [energy, soilRating, horizon]
  );

  const canComplete = selectedSeed.trim().length > 0;

  return (
    <OnboardingCard
      title="Where are you now?"
      description={
        <>
          Let's find the smallest first step for{' '}
          <span className="font-semibold">{horizon || 'your goal'}</span>
        </>
      }
      footer={
        <div className="flex gap-3">
          <Button onClick={onBack} variant="outline" className="w-full" size="lg">
            Back
          </Button>
          <Button
            onClick={onComplete}
            disabled={!canComplete}
            className="w-full"
            size="lg"
          >
            Start Journey
          </Button>
        </div>
      }
    >
      {/* Soil: Current state - Likert 1-5 */}
      <div className="space-y-3">
        <Label className="text-sm">
          How are you feeling about {horizon || 'this'} today?
        </Label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              onClick={() => setSoilRating(rating as 1 | 2 | 3 | 4 | 5)}
              className={`flex-1 h-12 rounded-lg border-2 font-semibold transition-all ${
                soilRating === rating
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              {rating}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Struggling</span>
          <span>Thriving</span>
        </div>
      </div>

      {/* Seed: First micro-step */}
      <div className="space-y-3">
        <Label className="text-sm">Pick your first micro-step (1-2 minutes max)</Label>
        <div className="space-y-2">
          {microSteps.map((step) => (
            <button
              key={step.id}
              onClick={() => setSelectedSeed(step.title)}
              className={`w-full p-3 rounded-lg border-2 transition-all text-left text-sm ${
                selectedSeed === step.title
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{step.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{step.hint}</p>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-1 ${
                    selectedSeed === step.title
                      ? 'border-primary bg-primary'
                      : 'border-muted-foreground/30'
                  }`}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Energy budget explanation */}
      <div className="p-3 rounded-lg bg-muted/50 border border-border space-y-2">
        <p className="text-xs text-muted-foreground">{energyCopy[energy]}</p>
        <p className="text-xs text-slate-400">
          First reps are tiny by design. We scale only after streaks prove automatic.
        </p>
      </div>
    </OnboardingCard>
  );
}
