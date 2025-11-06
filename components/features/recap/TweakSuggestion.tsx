/**
 * Tweak Suggestion Card
 * One-tap accept/decline for suggested adjustments
 * Based on friction analysis
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { TweakSuggestion } from '@/domain/tweaks';
import type { CoachPreset } from '@/lib/schemas';

interface TweakSuggestionCardProps {
  tweak: TweakSuggestion;
  coachPreset: CoachPreset;
  onAccept: () => void;
  onDecline: () => void;
  onDismiss?: () => void;
}

const TWEAK_ICONS = {
  timing: '⏰',
  step_size: '📏',
  cue: '🔔',
  energy_alignment: '⚡',
};

export function TweakSuggestionCard({
  tweak,
  coachPreset,
  onAccept,
  onDecline,
  onDismiss,
}: TweakSuggestionCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAccept = async () => {
    setIsProcessing(true);
    await onAccept();
    setIsProcessing(false);
  };

  const handleDecline = async () => {
    setIsProcessing(true);
    await onDecline();
    setIsProcessing(false);
  };

  return (
    <Card className="border-primary/30 bg-gradient-to-b from-yellow-500/5 to-transparent">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{TWEAK_ICONS[tweak.type]}</span>
            <div>
              <CardTitle className="text-lg">{tweak.title}</CardTitle>
              <CardDescription className="text-sm">
                {tweak.description}
              </CardDescription>
            </div>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Before → After */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Current:</span>
            <span className="font-medium line-through text-muted-foreground">
              {tweak.currentValue}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Suggested:</span>
            <span className="font-semibold text-primary">
              {tweak.suggestedValue}
            </span>
          </div>
        </div>

        {/* Rationale */}
        <div className="p-3 rounded-lg bg-muted/30 border border-border">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Why: </span>
            {tweak.rationale}
          </p>
        </div>

        {/* Confidence indicator */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Confidence:</span>
          <ConfidenceBadge level={tweak.confidence} />
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            onClick={handleDecline}
            disabled={isProcessing}
            variant="outline"
            className="w-full"
          >
            Not now
          </Button>
          <Button
            onClick={handleAccept}
            disabled={isProcessing}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isProcessing ? 'Applying...' : 'Try it'}
          </Button>
        </div>

        {/* Coach-specific note */}
        <CoachNote coachPreset={coachPreset} tweakType={tweak.type} />
      </CardContent>
    </Card>
  );
}

/**
 * Confidence level badge
 */
function ConfidenceBadge({ level }: { level: 'low' | 'medium' | 'high' }) {
  const config = {
    high: { label: 'High', color: 'bg-green-500', bars: 3 },
    medium: { label: 'Medium', color: 'bg-yellow-500', bars: 2 },
    low: { label: 'Low', color: 'bg-gray-500', bars: 1 },
  };

  const { label, color, bars } = config[level];

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`w-1.5 h-4 rounded-sm ${i <= bars ? color : 'bg-muted'}`}
          />
        ))}
      </div>
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}

/**
 * Coach-specific encouragement
 */
function CoachNote({
  coachPreset,
  tweakType,
}: {
  coachPreset: CoachPreset;
  tweakType: string;
}) {
  const notes: Record<CoachPreset, Record<string, string>> = {
    drill: {
      timing: 'Adapt or fail. Choose.',
      step_size: 'Smaller steps still move you forward.',
      cue: 'Eliminate excuses. Set the cue.',
      energy_alignment: 'Prime your state. Execute.',
    },
    socratic: {
      timing: 'When does this actually fit your life?',
      step_size: 'What version feels doable right now?',
      cue: 'What would make it impossible to forget?',
      energy_alignment: 'How can you set yourself up for success?',
    },
    compassionate: {
      timing: 'It\'s okay to adjust. Find what works for you.',
      step_size: 'There\'s no shame in starting smaller.',
      cue: 'Give yourself every advantage. You deserve it.',
      energy_alignment: 'Be kind to your energy levels.',
    },
    engineer: {
      timing: 'Optimizing window based on skip data.',
      step_size: 'Reducing scope to match capacity.',
      cue: 'Strengthening trigger reliability.',
      energy_alignment: 'Adding prerequisite to pipeline.',
    },
  };

  const note = notes[coachPreset]?.[tweakType] || 'Worth a try.';

  return (
    <p className="text-xs text-muted-foreground italic text-center pt-2 border-t border-border">
      {note}
    </p>
  );
}

/**
 * Multiple tweaks - show as stack/carousel
 */
interface TweakStackProps {
  tweaks: TweakSuggestion[];
  coachPreset: CoachPreset;
  onAccept: (tweak: TweakSuggestion) => void;
  onDecline: (tweak: TweakSuggestion) => void;
}

export function TweakStack({
  tweaks,
  coachPreset,
  onAccept,
  onDecline,
}: TweakStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (tweaks.length === 0) return null;

  const currentTweak = tweaks[currentIndex];

  const handleAccept = () => {
    onAccept(currentTweak);
    // Move to next tweak or dismiss
    if (currentIndex < tweaks.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleDecline = () => {
    onDecline(currentTweak);
    // Move to next tweak
    if (currentIndex < tweaks.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  return (
    <div className="space-y-2">
      {/* Progress indicator */}
      {tweaks.length > 1 && (
        <div className="flex items-center justify-center gap-2">
          {tweaks.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-8 bg-primary'
                  : 'w-1.5 bg-muted'
              }`}
            />
          ))}
        </div>
      )}

      {/* Current tweak */}
      <TweakSuggestionCard
        tweak={currentTweak}
        coachPreset={coachPreset}
        onAccept={handleAccept}
        onDecline={handleDecline}
      />

      {/* Counter */}
      {tweaks.length > 1 && (
        <p className="text-xs text-center text-muted-foreground">
          Suggestion {currentIndex + 1} of {tweaks.length}
        </p>
      )}
    </div>
  );
}
