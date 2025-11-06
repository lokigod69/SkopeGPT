/**
 * IntegrationCheck Component
 * Appears after ~7-14 days to assess if seed is becoming automatic
 * Three-option assessment: Not yet / Almost / Yes
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CoachSystem } from '@/domain/coachCopy';
import type { CoachPreset } from '@/lib/schemas';

interface IntegrationCheckProps {
  coachPreset: CoachPreset;
  seedDescription: string;
  onResponse: (level: 'not_yet' | 'almost' | 'yes') => void;
}

const INTEGRATION_LEVELS = [
  {
    value: 'not_yet' as const,
    icon: '🌱',
    label: 'Not yet',
    description: 'Still requires conscious effort',
  },
  {
    value: 'almost' as const,
    icon: '🌿',
    label: 'Almost',
    description: 'Getting easier, some days automatic',
  },
  {
    value: 'yes' as const,
    icon: '🌳',
    label: 'Yes!',
    description: 'Feels automatic most days',
  },
];

export function IntegrationCheck({
  coachPreset,
  seedDescription,
  onResponse,
}: IntegrationCheckProps) {
  const coachCopy = CoachSystem.getCoachCopy(coachPreset, 'integration');

  return (
    <Card className="border-primary/50 bg-gradient-to-b from-primary/5 to-transparent">
      <CardHeader>
        <CardTitle className="text-xl">Is this becoming automatic?</CardTitle>
        <CardDescription className="text-sm italic">
          "{coachCopy}"
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* The seed being assessed */}
        <div className="p-3 rounded-lg bg-muted/30 border border-border">
          <p className="text-sm font-medium">{seedDescription}</p>
        </div>

        {/* Three integration levels */}
        <div className="grid gap-3">
          {INTEGRATION_LEVELS.map((level) => (
            <button
              key={level.value}
              onClick={() => onResponse(level.value)}
              className="p-4 rounded-lg border-2 border-border bg-card hover:border-primary hover:bg-primary/5 transition-all text-left"
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl mt-0.5">{level.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-base">{level.label}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {level.description}
                  </p>
                </div>
                <div className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 flex-shrink-0 mt-1" />
              </div>
            </button>
          ))}
        </div>

        {/* Explanation note */}
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            This helps us know when it's time to grow your practice
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
