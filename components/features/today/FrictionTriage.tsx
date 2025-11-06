/**
 * FrictionTriage Modal
 * One-tap skip reason selection with optional notes
 * Feeds into adaptation engine
 */

'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CoachSystem } from '@/domain/coachCopy';
import type { CoachPreset, SkipReason } from '@/lib/schemas';

interface FrictionTriageProps {
  coachPreset: CoachPreset;
  onComplete: (reason: SkipReason, notes?: string) => void;
  onCancel: () => void;
}

const SKIP_REASONS: Array<{
  value: SkipReason;
  icon: string;
  label: string;
  description: string;
}> = [
  {
    value: 'too_hard',
    icon: '⚡',
    label: 'Too big',
    description: 'Step feels too challenging right now',
  },
  {
    value: 'bad_timing',
    icon: '⏰',
    label: 'Wrong time',
    description: 'Not the right moment for this',
  },
  {
    value: 'low_energy',
    icon: '🔋',
    label: 'Low energy',
    description: 'Not enough gas in the tank today',
  },
  {
    value: 'forgot',
    icon: '💭',
    label: 'Forgot',
    description: "Didn't see the cue or reminder",
  },
];

export function FrictionTriage({ coachPreset, onComplete, onCancel }: FrictionTriageProps) {
  const [selectedReason, setSelectedReason] = useState<SkipReason | null>(null);
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  const handleReasonSelect = (reason: SkipReason) => {
    setSelectedReason(reason);
    // Auto-expand notes field after selection
    setShowNotes(true);
  };

  const handleComplete = () => {
    if (!selectedReason) return;
    onComplete(selectedReason, notes.trim() || undefined);
  };

  const coachCopy = CoachSystem.getCoachCopy(coachPreset, 'skip');

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>What got in the way?</DialogTitle>
          <DialogDescription className="text-sm italic">
            "{coachCopy}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Skip Reason Grid */}
          <div className="grid grid-cols-2 gap-3">
            {SKIP_REASONS.map((reason) => (
              <button
                key={reason.value}
                onClick={() => handleReasonSelect(reason.value)}
                className={`p-4 rounded-lg border-2 transition-all text-left ${
                  selectedReason === reason.value
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card hover:border-primary/50'
                }`}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{reason.icon}</span>
                    <span className="font-semibold text-sm">{reason.label}</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-tight">
                    {reason.description}
                  </p>
                </div>
                <div
                  className={`mt-3 w-4 h-4 rounded-full border-2 ${
                    selectedReason === reason.value
                      ? 'border-primary bg-primary'
                      : 'border-muted-foreground/30'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Optional Notes Field */}
          {showNotes && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
              <Label htmlFor="notes" className="text-sm text-muted-foreground">
                Anything else? (optional)
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Quick note to yourself..."
                className="resize-none h-20 text-sm"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button onClick={onCancel} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleComplete}
              disabled={!selectedReason}
              className="flex-1"
            >
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
