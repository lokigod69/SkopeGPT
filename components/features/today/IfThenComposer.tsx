/**
 * If-Then Composer
 * Creates implementation intentions (cue-based triggers)
 * Template-based with custom option
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CoachSystem } from '@/domain/coachCopy';
import type { CoachPreset } from '@/lib/schemas';

interface IfThenComposerProps {
  coachPreset: CoachPreset;
  seedDescription: string;
  currentCue?: string;
  onSave: (cue: string) => void;
  onCancel: () => void;
}

// Common cue templates organized by time of day
const CUE_TEMPLATES = {
  morning: [
    'After my morning coffee',
    'Right after waking up',
    'After breakfast',
    'When I finish brushing my teeth',
  ],
  midday: [
    'After lunch',
    'During my lunch break',
    'When I close my laptop for lunch',
    'After my midday walk',
  ],
  evening: [
    'When I get home',
    'After dinner',
    'Before bed',
    'When I start my evening routine',
  ],
  anytime: [
    'When I see my phone charging',
    'After checking email',
    'During my break',
    'When my timer goes off',
  ],
};

export function IfThenComposer({
  coachPreset,
  seedDescription,
  currentCue,
  onSave,
  onCancel,
}: IfThenComposerProps) {
  const [selectedCue, setSelectedCue] = useState<string>(currentCue || '');
  const [customCue, setCustomCue] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const handleSave = () => {
    const cueToSave = showCustom ? customCue.trim() : selectedCue;
    if (cueToSave) {
      onSave(cueToSave);
    }
  };

  const handleCustomToggle = () => {
    setShowCustom(!showCustom);
    if (!showCustom) {
      setCustomCue(selectedCue);
    }
  };

  const coachCopy = CoachSystem.getCoachCopy(coachPreset, 'cue');

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-xl">Set your trigger</CardTitle>
        <CardDescription className="text-sm italic">
          "{coachCopy}"
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* The seed being cued */}
        <div className="p-3 rounded-lg bg-muted/30 border border-border">
          <p className="text-sm">
            <span className="font-semibold">When:</span>{' '}
            <span className="text-muted-foreground">[choose below]</span>
          </p>
          <p className="text-sm mt-1">
            <span className="font-semibold">Then:</span> {seedDescription}
          </p>
        </div>

        {/* Template selection or custom input */}
        {!showCustom ? (
          <div className="space-y-4">
            {Object.entries(CUE_TEMPLATES).map(([timeframe, cues]) => (
              <div key={timeframe} className="space-y-2">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                  {timeframe}
                </Label>
                <div className="space-y-2">
                  {cues.map((cue, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedCue(cue)}
                      className={`w-full p-3 rounded-lg border-2 transition-all text-left text-sm ${
                        selectedCue === cue
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-card hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{cue}</span>
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                            selectedCue === cue
                              ? 'border-primary bg-primary'
                              : 'border-muted-foreground/30'
                          }`}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <Button
              onClick={handleCustomToggle}
              variant="outline"
              className="w-full"
            >
              + Write your own
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Label htmlFor="custom-cue">Your custom trigger</Label>
            <Input
              id="custom-cue"
              value={customCue}
              onChange={(e) => setCustomCue(e.target.value)}
              placeholder="After I..."
              className="text-sm"
            />
            <Button
              onClick={handleCustomToggle}
              variant="ghost"
              size="sm"
              className="text-xs"
            >
              ← Back to templates
            </Button>
          </div>
        )}

        {/* Preview */}
        {(selectedCue || customCue) && (
          <div className="p-4 rounded-lg bg-primary/5 border-l-4 border-primary">
            <p className="text-sm font-medium">
              {showCustom ? customCue : selectedCue},{' '}
              <span className="text-muted-foreground">I will</span>{' '}
              {seedDescription.toLowerCase()}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button onClick={onCancel} variant="outline" className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!(selectedCue || customCue.trim())}
            className="flex-1"
          >
            Save Trigger
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
