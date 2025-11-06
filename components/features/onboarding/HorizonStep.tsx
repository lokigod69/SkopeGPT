/**
 * Step 1: Horizon Selection
 * What's one horizon you care about this month?
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
  value: string;
  onChange: (value: string) => void;
  onNext: () => void;
}

export function HorizonStep({ value, onChange, onNext }: HorizonStepProps) {
  const [customValue, setCustomValue] = useState(value);
  const [isCustom, setIsCustom] = useState(
    value && !SUGGESTED_HORIZONS.includes(value)
  );

  const handleChipClick = (horizon: string) => {
    setIsCustom(false);
    setCustomValue(horizon);
    onChange(horizon);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setCustomValue(newValue);
    onChange(newValue);
  };

  const canProceed = value.trim().length > 0;

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-2xl">What's one horizon you care about?</CardTitle>
        <CardDescription>
          Pick a single area to focus on this month
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Smart suggestions as chips */}
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_HORIZONS.map(horizon => (
            <button
              key={horizon}
              onClick={() => handleChipClick(horizon)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                value === horizon
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {horizon}
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

        {/* Next button */}
        <Button
          onClick={onNext}
          disabled={!canProceed}
          className="w-full"
          size="lg"
        >
          Continue
        </Button>
      </CardContent>
    </Card>
  );
}
