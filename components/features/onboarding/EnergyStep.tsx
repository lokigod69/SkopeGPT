/**
 * Step 2: Energy Budget Selection
 * How much can you realistically give daily?
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { EnergyBudget } from '@/lib/schemas';

const ENERGY_LEVELS: { value: EnergyBudget; label: string; description: string }[] = [
  { value: 'tiny', label: 'Tiny', description: '1-2 minutes daily' },
  { value: 'small', label: 'Small', description: '2-5 minutes daily' },
  { value: 'medium', label: 'Medium', description: '5-10 minutes daily' },
  { value: 'big', label: 'Big', description: '10-20 minutes daily' },
];

interface EnergyStepProps {
  value: EnergyBudget;
  onChange: (value: EnergyBudget) => void;
  onNext: () => void;
  onBack: () => void;
}

export function EnergyStep({ value, onChange, onNext, onBack }: EnergyStepProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-2xl">How much can you give daily?</CardTitle>
        <CardDescription>
          Be honest - energy is precious
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Energy level options */}
        <div className="space-y-3">
          {ENERGY_LEVELS.map(level => (
            <button
              key={level.value}
              onClick={() => onChange(level.value)}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                value === level.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-semibold cursor-pointer">
                    {level.label}
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {level.description}
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    value === level.value
                      ? 'border-primary'
                      : 'border-muted-foreground/30'
                  }`}
                >
                  {value === level.value && (
                    <div className="w-3 h-3 rounded-full bg-primary" />
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Default recommendation */}
        <p className="text-xs text-muted-foreground text-center">
          Not sure? <span className="font-semibold">Small</span> is a great starting point.
        </p>

        {/* Navigation */}
        <div className="flex gap-3">
          <Button
            onClick={onBack}
            variant="outline"
            className="w-full"
            size="lg"
          >
            Back
          </Button>
          <Button
            onClick={onNext}
            className="w-full"
            size="lg"
          >
            Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
