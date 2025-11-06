/**
 * Step 3: Coach Lens Selection
 * Pick your coaching style (can switch anytime)
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { CoachPreset } from '@/lib/schemas';
import { CoachSystem } from '@/domain/coachCopy';

interface CoachStepProps {
  value: CoachPreset;
  onChange: (value: CoachPreset) => void;
  onNext: () => void;
  onBack: () => void;
}

export function CoachStep({ value, onChange, onNext, onBack }: CoachStepProps) {
  const coaches = CoachSystem.getAllCoaches();

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-2xl">Pick your coach</CardTitle>
        <CardDescription>
          You can switch anytime - this just sets the tone
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Coach options */}
        <div className="space-y-3">
          {coaches.map(coach => (
            <button
              key={coach.preset}
              onClick={() => onChange(coach.preset)}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                value === coach.preset
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:border-primary/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl mt-0.5">{coach.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-base">{coach.displayName}</h3>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        value === coach.preset
                          ? 'border-primary'
                          : 'border-muted-foreground/30'
                      }`}
                    >
                      {value === coach.preset && (
                        <div className="w-3 h-3 rounded-full bg-primary" />
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {coach.description}
                  </p>
                  {/* Preview line */}
                  <p className="text-xs text-muted-foreground italic mt-2 border-l-2 border-muted pl-2">
                    "{CoachSystem.getCoachCopy(coach.preset, 'start')}"
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

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
