/**
 * Energy Meter Widget
 * Quick visual check-in for current energy level
 * 4-level system: Low, Medium, Good, High
 */

'use client';

import { useState } from 'react';

interface EnergyMeterProps {
  value?: number; // 1-4
  onChange?: (value: number) => void;
  readonly?: boolean;
  compact?: boolean;
}

const ENERGY_LEVELS = [
  { value: 1, label: 'Low', emoji: '🔋', color: 'bg-red-500' },
  { value: 2, label: 'Medium', emoji: '🔋', color: 'bg-yellow-500' },
  { value: 3, label: 'Good', emoji: '🔋', color: 'bg-green-500' },
  { value: 4, label: 'High', emoji: '⚡', color: 'bg-electric-teal' },
];

export function EnergyMeter({
  value,
  onChange,
  readonly = false,
  compact = false,
}: EnergyMeterProps) {
  const [currentValue, setCurrentValue] = useState(value || 3);

  const handleSelect = (newValue: number) => {
    if (readonly) return;
    setCurrentValue(newValue);
    onChange?.(newValue);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Energy:</span>
        <div className="flex gap-1">
          {ENERGY_LEVELS.map((level) => (
            <button
              key={level.value}
              onClick={() => handleSelect(level.value)}
              disabled={readonly}
              className={`w-6 h-6 rounded-sm transition-all ${
                (value || currentValue) >= level.value
                  ? level.color
                  : 'bg-muted'
              } ${readonly ? 'cursor-default' : 'cursor-pointer hover:opacity-80'}`}
              title={level.label}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          How's your energy right now?
        </span>
        {!readonly && (
          <span className="text-xs text-muted-foreground">
            Tap to adjust
          </span>
        )}
      </div>

      {/* Energy Bars */}
      <div className="grid grid-cols-4 gap-2">
        {ENERGY_LEVELS.map((level) => (
          <button
            key={level.value}
            onClick={() => handleSelect(level.value)}
            disabled={readonly}
            className={`relative flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
              (value || currentValue) === level.value
                ? 'border-primary bg-primary/10'
                : 'border-border bg-card hover:border-primary/50'
            } ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <span className="text-2xl">{level.emoji}</span>
            <span className="text-xs font-medium">{level.label}</span>

            {/* Active indicator */}
            <div
              className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 rounded-full transition-all ${
                (value || currentValue) >= level.value
                  ? level.color
                  : 'bg-muted'
              }`}
            />
          </button>
        ))}
      </div>

      {/* Helper text */}
      {!readonly && (
        <p className="text-xs text-muted-foreground text-center">
          This helps us adapt your practice to your current state
        </p>
      )}
    </div>
  );
}

/**
 * Simple read-only energy display
 */
export function EnergyDisplay({ value }: { value: number }) {
  const level = ENERGY_LEVELS.find((l) => l.value === value) || ENERGY_LEVELS[2];

  return (
    <div className="flex items-center gap-2">
      <span className="text-xl">{level.emoji}</span>
      <div className="flex flex-col">
        <span className="text-sm font-medium">{level.label} Energy</span>
        <div className="flex gap-1">
          {ENERGY_LEVELS.map((l) => (
            <div
              key={l.value}
              className={`w-2 h-2 rounded-full ${
                value >= l.value ? l.color : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
