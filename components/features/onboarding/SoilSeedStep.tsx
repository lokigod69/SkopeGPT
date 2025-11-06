/**
 * Step 4: Soil/Seed Snapshot
 * Where are you now? + Pick your first micro-step
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { CoachPreset, EnergyBudget } from '@/lib/schemas';

// Default micro-step templates based on common horizons
const SEED_TEMPLATES: Record<string, string[]> = {
  sleep: [
    'Set phone to bedtime mode at 10 PM',
    'Read 2 pages before bed',
    'Do 5 minutes of gentle stretching before sleep',
  ],
  strength: [
    '5 air squats after brushing teeth',
    '10-second plank before shower',
    '1 wall pushup in the morning',
  ],
  writing: [
    'Write 1 raw sentence after lunch',
    'Capture 1 idea in notes app',
    'Free-write for 2 minutes',
  ],
  finances: [
    'Review 1 transaction per day',
    'Check account balance once',
    'Log 1 expense manually',
  ],
  learning: [
    'Read 1 page of a book',
    'Watch 1 educational video under 5 minutes',
    'Review 3 flashcards',
  ],
  creativity: [
    'Sketch 1 simple shape',
    'Take 1 photo mindfully',
    'Hum a melody for 30 seconds',
  ],
  default: [
    'Do the tiniest version for 1 minute',
    'Show up and do the first step only',
    'Set a 2-minute timer and start',
  ],
};

interface SoilSeedStepProps {
  horizon: string;
  energyBudget: EnergyBudget;
  coachPreset: CoachPreset;
  soilRating: number;
  onSoilRatingChange: (rating: number) => void;
  selectedSeed: string;
  onSeedSelect: (seed: string) => void;
  onComplete: () => void;
  onBack: () => void;
}

export function SoilSeedStep({
  horizon,
  energyBudget,
  coachPreset,
  soilRating,
  onSoilRatingChange,
  selectedSeed,
  onSeedSelect,
  onComplete,
  onBack,
}: SoilSeedStepProps) {
  const [seeds, setSeeds] = useState<string[]>([]);

  useEffect(() => {
    // Get relevant seed templates
    const key = horizon.toLowerCase();
    const templates = SEED_TEMPLATES[key] || SEED_TEMPLATES.default;
    setSeeds(templates);

    // Auto-select first seed if none selected
    if (!selectedSeed && templates.length > 0) {
      onSeedSelect(templates[0]);
    }
  }, [horizon, selectedSeed, onSeedSelect]);

  const canComplete = selectedSeed.trim().length > 0;

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-2xl">Where are you now?</CardTitle>
        <CardDescription>
          Let's find the smallest first step for <span className="font-semibold">{horizon}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Soil: Current state - Likert 1-5 */}
        <div className="space-y-3">
          <Label className="text-sm">How are you feeling about {horizon} today?</Label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(rating => (
              <button
                key={rating}
                onClick={() => onSoilRatingChange(rating)}
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
            {seeds.map((seed, index) => (
              <button
                key={index}
                onClick={() => onSeedSelect(seed)}
                className={`w-full p-3 rounded-lg border-2 transition-all text-left text-sm ${
                  selectedSeed === seed
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{seed}</span>
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                      selectedSeed === seed
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground/30'
                    }`}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Energy budget reminder */}
        <div className="p-3 rounded-lg bg-muted/50 border border-border">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold">Energy budget: {energyBudget}</span> - We'll start small and build from there.
          </p>
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
            onClick={onComplete}
            disabled={!canComplete}
            className="w-full"
            size="lg"
          >
            Start Journey
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
