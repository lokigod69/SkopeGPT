/**
 * Log Done Dialog
 * Capture optional notes and energy after completing a seed
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LogDoneDialogProps {
  onSubmit: (data: { notes?: string; energy_after?: number }) => void;
  onCancel: () => void;
}

export function LogDoneDialog({ onSubmit, onCancel }: LogDoneDialogProps) {
  const [notes, setNotes] = useState('');
  const [energyAfter, setEnergyAfter] = useState<number | undefined>();

  const handleSubmit = () => {
    onSubmit({
      notes: notes.trim() || undefined,
      energy_after: energyAfter,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/5 bg-slate-900 shadow-xl">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-xl font-semibold">Nice work!</h2>
            <p className="text-sm text-slate-400 mt-1">
              Anything you want to remember?
            </p>
          </div>

          {/* Notes (optional) */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm">
              Quick notes (optional)
            </Label>
            <Input
              id="notes"
              type="text"
              placeholder="e.g., Felt easy today..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full"
              maxLength={200}
            />
          </div>

          {/* Energy After (optional) */}
          <div className="space-y-2">
            <Label className="text-sm">Energy after (optional)</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => setEnergyAfter(level === energyAfter ? undefined : level)}
                  className={`flex-1 h-12 rounded-lg border-2 font-semibold transition-all ${
                    energyAfter === level
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card hover:border-primary/50'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Drained</span>
              <span>Energized</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button onClick={onCancel} variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1">
              Log Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
