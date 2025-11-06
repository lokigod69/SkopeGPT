/**
 * Tweak Suggestion System
 * Analyzes friction patterns and suggests specific adjustments
 * Focus areas: timing shift, step size reduction, cue strengthening
 */

import type { Seed, SkipReason, EnergyBudget } from '@/lib/schemas';

export interface TweakSuggestion {
  type: 'timing' | 'step_size' | 'cue' | 'energy_alignment';
  title: string;
  description: string;
  currentValue: string;
  suggestedValue: string;
  rationale: string;
  confidence: 'low' | 'medium' | 'high';
  skipReasonTriggered: SkipReason;
}

export interface FrictionPattern {
  reason: SkipReason;
  count: number;
  percentage: number;
  consecutiveDays?: number;
}

/**
 * Analyze friction patterns and generate tweak suggestions
 */
export function generateTweaks(
  seed: Seed,
  frictionPatterns: FrictionPattern[],
  energyBudget: EnergyBudget
): TweakSuggestion[] {
  const suggestions: TweakSuggestion[] = [];

  // Sort by most frequent
  const sortedPatterns = [...frictionPatterns].sort((a, b) => b.count - a.count);

  for (const pattern of sortedPatterns) {
    // Only suggest for significant patterns (>2 occurrences or >20% of skips)
    if (pattern.count < 2 && pattern.percentage < 20) continue;

    const tweak = generateTweakForPattern(seed, pattern, energyBudget);
    if (tweak) {
      suggestions.push(tweak);
    }
  }

  return suggestions;
}

/**
 * Generate specific tweak based on friction pattern
 */
function generateTweakForPattern(
  seed: Seed,
  pattern: FrictionPattern,
  energyBudget: EnergyBudget
): TweakSuggestion | null {
  switch (pattern.reason) {
    case 'too_hard':
      return generateStepSizeTweak(seed, pattern);

    case 'bad_timing':
      return generateTimingTweak(seed, pattern);

    case 'low_energy':
      return generateEnergyAlignmentTweak(seed, pattern, energyBudget);

    case 'forgot':
      return generateCueTweak(seed, pattern);

    default:
      return null;
  }
}

/**
 * Suggest reducing step size
 */
function generateStepSizeTweak(
  seed: Seed,
  pattern: FrictionPattern
): TweakSuggestion {
  const description = seed.step_description.toLowerCase();

  // Try to extract and reduce numbers
  const timeMatch = description.match(/(\d+)\s*(minute|min|second|sec)/i);
  if (timeMatch) {
    const currentTime = parseInt(timeMatch[1], 10);
    const newTime = Math.max(1, Math.floor(currentTime * 0.7)); // 30% reduction
    const unit = timeMatch[2];

    return {
      type: 'step_size',
      title: 'Make it smaller',
      description: 'Reduce the time commitment',
      currentValue: `${currentTime} ${unit}`,
      suggestedValue: `${newTime} ${unit}`,
      rationale: `Step feels too challenging. Try ${newTime} ${unit} instead.`,
      confidence: pattern.count >= 3 ? 'high' : 'medium',
      skipReasonTriggered: 'too_hard',
    };
  }

  const countMatch = description.match(/(\d+)\s*(\w+)/);
  if (countMatch) {
    const currentCount = parseInt(countMatch[1], 10);
    const newCount = Math.max(1, Math.floor(currentCount * 0.7)); // 30% reduction
    const item = countMatch[2];

    return {
      type: 'step_size',
      title: 'Reduce the count',
      description: 'Lower the number of repetitions',
      currentValue: `${currentCount} ${item}`,
      suggestedValue: `${newCount} ${item}`,
      rationale: `Try ${newCount} ${item} to make it more doable.`,
      confidence: pattern.count >= 3 ? 'high' : 'medium',
      skipReasonTriggered: 'too_hard',
    };
  }

  // Generic suggestion
  return {
    type: 'step_size',
    title: 'Simplify the step',
    description: 'Make it even smaller',
    currentValue: seed.step_description,
    suggestedValue: 'A simpler version',
    rationale: 'This step feels too big. What\'s the tiniest version you could do?',
    confidence: 'low',
    skipReasonTriggered: 'too_hard',
  };
}

/**
 * Suggest timing shift
 */
function generateTimingTweak(
  seed: Seed,
  pattern: FrictionPattern
): TweakSuggestion {
  const currentWindow = seed.window_start && seed.window_end
    ? `${seed.window_start} - ${seed.window_end}`
    : 'Not set';

  // Suggest common alternative windows
  const timingSuggestions = [
    { window: 'Morning (6-9 AM)', rationale: 'Try starting your day with it' },
    { window: 'Lunch break (12-1 PM)', rationale: 'Use your midday break' },
    { window: 'Evening wind-down (7-9 PM)', rationale: 'Build it into your evening routine' },
    { window: 'Right after work (5-6 PM)', rationale: 'Catch the transition moment' },
  ];

  // Pick a suggestion different from current
  const suggestion = timingSuggestions[pattern.count % timingSuggestions.length];

  return {
    type: 'timing',
    title: 'Shift the timing',
    description: 'Try a different time of day',
    currentValue: currentWindow,
    suggestedValue: suggestion.window,
    rationale: suggestion.rationale,
    confidence: pattern.count >= 3 ? 'high' : 'medium',
    skipReasonTriggered: 'bad_timing',
  };
}

/**
 * Suggest energy alignment
 */
function generateEnergyAlignmentTweak(
  seed: Seed,
  pattern: FrictionPattern,
  energyBudget: EnergyBudget
): TweakSuggestion {
  return {
    type: 'energy_alignment',
    title: 'Add an energy primer',
    description: 'Quick boost before your step',
    currentValue: 'No primer',
    suggestedValue: '2-minute energy reset',
    rationale:
      'Add a 2-minute breathing exercise, cold water splash, or quick walk before your step',
    confidence: pattern.count >= 3 ? 'high' : 'medium',
    skipReasonTriggered: 'low_energy',
  };
}

/**
 * Suggest cue strengthening
 */
function generateCueTweak(
  seed: Seed,
  pattern: FrictionPattern
): TweakSuggestion {
  const currentCue = seed.if_then_cue || 'No cue set';

  const cueSuggestions = [
    {
      cue: 'Visual reminder (sticky note on mirror)',
      rationale: 'Make it impossible to miss',
    },
    {
      cue: 'Anchor to existing habit (right after brushing teeth)',
      rationale: 'Piggyback on something automatic',
    },
    {
      cue: 'Phone alarm at specific time',
      rationale: 'Explicit reminder at the right moment',
    },
    {
      cue: 'Physical object placement (shoes by door)',
      rationale: 'Environmental cue that triggers action',
    },
  ];

  const suggestion = cueSuggestions[pattern.count % cueSuggestions.length];

  return {
    type: 'cue',
    title: 'Strengthen your cue',
    description: 'Make the trigger more visible',
    currentValue: currentCue,
    suggestedValue: suggestion.cue,
    rationale: suggestion.rationale,
    confidence: pattern.count >= 3 ? 'high' : 'medium',
    skipReasonTriggered: 'forgot',
  };
}

/**
 * Apply a tweak to a seed
 */
export function applyTweak(
  seed: Seed,
  tweak: TweakSuggestion
): Partial<Seed> {
  switch (tweak.type) {
    case 'step_size':
      return {
        step_description: seed.step_description.replace(
          tweak.currentValue,
          tweak.suggestedValue
        ),
      };

    case 'timing':
      // Extract hours from suggested window (e.g., "6-9 AM" -> "06:00" and "09:00")
      const match = tweak.suggestedValue.match(/(\d+)-(\d+)\s*(AM|PM)/i);
      if (match) {
        let startHour = parseInt(match[1], 10);
        let endHour = parseInt(match[2], 10);
        const meridiem = match[3].toUpperCase();

        if (meridiem === 'PM' && startHour !== 12) {
          startHour += 12;
          endHour += 12;
        }

        return {
          window_start: `${String(startHour).padStart(2, '0')}:00`,
          window_end: `${String(endHour).padStart(2, '0')}:00`,
        };
      }
      return {};

    case 'cue':
      return {
        if_then_cue: tweak.suggestedValue,
      };

    case 'energy_alignment':
      // Add to notes or description
      return {
        step_description: `${tweak.suggestedValue}, then ${seed.step_description}`,
      };

    default:
      return {};
  }
}

/**
 * Calculate friction patterns from logs
 */
export function analyzeFrictionPatterns(
  logs: Array<{
    date: string;
    outcome: 'done' | 'skipped';
    skip_reason: SkipReason | null;
  }>
): FrictionPattern[] {
  const reasonCounts = new Map<SkipReason, number>();
  const skippedLogs = logs.filter((log) => log.outcome === 'skipped' && log.skip_reason);

  skippedLogs.forEach((log) => {
    if (log.skip_reason) {
      reasonCounts.set(log.skip_reason, (reasonCounts.get(log.skip_reason) || 0) + 1);
    }
  });

  const totalSkips = skippedLogs.length;

  return Array.from(reasonCounts.entries()).map(([reason, count]) => ({
    reason,
    count,
    percentage: totalSkips > 0 ? (count / totalSkips) * 100 : 0,
  }));
}
