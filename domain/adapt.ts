/**
 * Adaptation Logic
 *
 * Transforms skip reasons into concrete plan adjustments
 * Each reason has a specific adaptation strategy backed by behavioral science
 */

import type { Seed, SkipReason, EnergyBudget } from '@/lib/schemas';

// ============================================================================
// Types
// ============================================================================

export interface AdaptationResult {
  updatedSeed: Partial<Seed>;
  message: string;
  suggestion?: string;
}

export interface WindowShift {
  original: string;
  suggested: string[];
}

// ============================================================================
// Main Adaptation Function
// ============================================================================

/**
 * Apply adaptation based on skip reason
 * Returns seed updates and user-facing message
 */
export function adapt(
  reason: SkipReason,
  seed: Seed,
  energyBudget: EnergyBudget
): AdaptationResult {
  switch (reason) {
    case 'too_hard':
      return shrinkStep(seed);

    case 'bad_timing':
      return suggestTimingAdjustment(seed);

    case 'low_energy':
      return addRecoveryPrimer(seed, energyBudget);

    case 'forgot':
      return addEnvironmentalCue(seed);

    default:
      return {
        updatedSeed: {},
        message: 'We\'ll try again tomorrow with the same approach.',
      };
  }
}

// ============================================================================
// Adaptation Strategies
// ============================================================================

/**
 * TOO_HARD: Shrink the step by 30%
 * Principle: Make it so easy you can't say no
 */
function shrinkStep(seed: Seed): AdaptationResult {
  const newMinutes = Math.max(1, Math.ceil(seed.minutes * 0.7));
  const newStepLevel = Math.max(0, seed.step_level - 1);

  return {
    updatedSeed: {
      minutes: newMinutes,
      step_level: newStepLevel,
      description: seed.description.replace(/\d+/, newMinutes.toString()),
    },
    message: `Let's make it easier: ${newMinutes} minute${newMinutes > 1 ? 's' : ''} instead.`,
    suggestion: 'The goal is to build the habit, not exhaust yourself. Small is sustainable.',
  };
}

/**
 * BAD_TIMING: Suggest alternative windows
 * Principle: Attach habits to existing routines
 */
function suggestTimingAdjustment(seed: Seed): AdaptationResult {
  const currentWindow = seed.if_window;
  const suggestedWindows = generateAlternativeWindows(currentWindow);

  return {
    updatedSeed: {
      // Window will be updated by user selection
    },
    message: 'Let\'s find a better time that works for you.',
    suggestion: `Try one of these windows instead: ${suggestedWindows.join(', ')}`,
  };
}

/**
 * LOW_ENERGY: Add a 2-minute recovery primer
 * Principle: Energy begets energy - prime the pump
 */
function addRecoveryPrimer(seed: Seed, energyBudget: EnergyBudget): AdaptationResult {
  // Adjust based on energy budget
  const recoveryStrategies = {
    tiny: '1 minute of gentle breathing',
    small: '2 minutes of breath + light movement',
    medium: '3 minutes of walking + breathing',
    big: '5 minutes of movement + hydration',
  };

  const recovery = recoveryStrategies[energyBudget];

  return {
    updatedSeed: {
      description: `${recovery}, then ${seed.description.toLowerCase()}`,
      minutes: seed.minutes + (energyBudget === 'tiny' ? 1 : 2),
    },
    message: 'Let\'s add a quick energy primer before your micro-step.',
    suggestion: `Try: ${recovery} to build momentum first.`,
  };
}

/**
 * FORGOT: Add environmental cue
 * Principle: Make the cue visible and immediate
 */
function addEnvironmentalCue(seed: Seed): AdaptationResult {
  const cues = [
    'sticky note on your desk',
    'item placed in your path',
    'phone alarm with specific label',
    'visual reminder in your workspace',
  ];

  const suggestedCue = cues[Math.floor(Math.random() * cues.length)];

  return {
    updatedSeed: {
      if_context: seed.if_context
        ? `${seed.if_context} + ${suggestedCue}`
        : suggestedCue,
    },
    message: 'Let\'s add a visual reminder to help you remember.',
    suggestion: `Try placing a ${suggestedCue} as your trigger.`,
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate alternative time windows based on current window
 */
function generateAlternativeWindows(currentWindow: string): string[] {
  // Parse current window format: "HH:MM-HH:MM" or descriptive like "after-lunch"
  const isTimeRange = /^\d{2}:\d{2}-\d{2}:\d{2}$/.test(currentWindow);

  if (isTimeRange) {
    // If it's a time range, suggest shifted windows
    const [start] = currentWindow.split('-');
    const [hours] = start.split(':').map(Number);

    const alternatives: string[] = [];

    // Morning alternative
    if (hours >= 12) {
      alternatives.push('07:00-09:00 (early morning)');
    }

    // Lunch alternative
    if (hours < 11 || hours > 14) {
      alternatives.push('12:00-14:00 (lunch break)');
    }

    // Evening alternative
    if (hours < 18) {
      alternatives.push('19:00-21:00 (after dinner)');
    }

    return alternatives.length > 0 ? alternatives : ['flexible - any time that feels right'];
  }

  // For descriptive windows, suggest complementary times
  const descriptiveAlternatives: Record<string, string[]> = {
    'morning': ['lunch break', 'evening'],
    'lunch': ['early morning', 'after work'],
    'evening': ['morning', 'lunch break'],
    'after-work': ['morning', 'lunch break'],
    'before-bed': ['morning', 'lunch time'],
  };

  const normalized = currentWindow.toLowerCase();
  for (const [key, alts] of Object.entries(descriptiveAlternatives)) {
    if (normalized.includes(key)) {
      return alts;
    }
  }

  return ['morning (07:00-09:00)', 'lunch (12:00-14:00)', 'evening (19:00-21:00)'];
}

/**
 * Suggest better If-Then window based on skip pattern
 */
export function suggestBetterWindow(
  currentWindow: string,
  skipCount: number
): string | null {
  // If skipped more than 3 times, suggest complete window change
  if (skipCount >= 3) {
    const alternatives = generateAlternativeWindows(currentWindow);
    return alternatives[0];
  }

  return null;
}

/**
 * Calculate adaptive difficulty based on rolling success
 */
export function calculateAdaptiveDifficulty(
  baseMinutes: number,
  rollingSuccess: number
): number {
  if (rollingSuccess >= 0.8) {
    // High success - suggest step up
    return Math.ceil(baseMinutes * 1.1);
  } else if (rollingSuccess < 0.4) {
    // Low success - shrink step
    return Math.max(1, Math.ceil(baseMinutes * 0.7));
  }

  // Medium success - hold steady
  return baseMinutes;
}

// ============================================================================
// Exports
// ============================================================================

export const AdaptationEngine = {
  adapt,
  shrinkStep,
  suggestTimingAdjustment,
  addRecoveryPrimer,
  addEnvironmentalCue,
  suggestBetterWindow,
  calculateAdaptiveDifficulty,
};
