/**
 * Step 1: Horizon Selection
 * What's one horizon you care about this month?
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OnboardingCard } from './OnboardingCard';
import { useOnboarding } from '@/domain/onboarding.store';

const SUGGESTED_HORIZONS = [
  'Sleep',
  'Strength',
  'Writing',
  'Finances',
  'Learning',
  'Creativity',
  'Relationships',
  'Mindfulness',
];

interface HorizonStepProps {
  onNext: () => void;
}

export function HorizonStep({ onNext }: HorizonStepProps) {
  const horizon = useOnboarding((s) => s.horizon);
  const setHorizon = useOnboarding((s) => s.setHorizon);

  const [customValue, setCustomValue] = useState(horizon);
  const [isCustom, setIsCustom] = useState(
    horizon && !SUGGESTED_HORIZONS.includes(horizon)
  );

  const handleChipClick = (selectedHorizon: string) => {
    setIsCustom(false);
    setCustomValue(selectedHorizon);
    setHorizon(selectedHorizon);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setCustomValue(newValue);
    setHorizon(newValue);
  };

  const canProceed = horizon.trim().length > 0;

  return (
    <OnboardingCard
      title="What's one horizon you care about?"
      description="Pick a single area to focus on this month"
      footer={
        <Button
          onClick={onNext}
          disabled={!canProceed}
          className="w-full"
          size="lg"
        >
          Continue
        </Button>
      }
    >
      {/* Smart suggestions as chips */}
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_HORIZONS.map(h => (
          <button
            key={h}
            onClick={() => handleChipClick(h)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              horizon === h
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {h}
          </button>
        ))}
      </div>

      {/* Custom input */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Or enter your own:</p>
        <Input
          type="text"
          placeholder="e.g., Cooking, Meditation, Music..."
          value={isCustom ? customValue : ''}
          onChange={handleCustomChange}
          onFocus={() => setIsCustom(true)}
          className="w-full"
        />
      </div>
    </OnboardingCard>
  );
}
