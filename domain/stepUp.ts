/**
 * Step-up Logic
 * Progressive overload - increase seed difficulty by 10-15% when success is high
 * Triggered when rolling_success >= 0.7
 */

import type { Seed, EnergyBudget } from '@/lib/schemas';

export interface StepUpSuggestion {
  originalDescription: string;
  newDescription: string;
  increaseType: 'time' | 'count' | 'intensity' | 'custom';
  increaseAmount: number; // percentage increase (10-15%)
  rationale: string;
}

/**
 * Check if a seed is ready for step-up
 */
export function isReadyForStepUp(
  rollingSuccess: number,
  daysActive: number,
  minDays: number = 14
): boolean {
  return rollingSuccess >= 0.7 && daysActive >= minDays;
}

/**
 * Generate step-up suggestion based on seed analysis
 */
export function generateStepUp(
  seed: Seed,
  energyBudget: EnergyBudget,
  increasePercentage: number = 15
): StepUpSuggestion {
  const description = seed.step_description.toLowerCase();

  // Time-based seeds (e.g., "5 minutes", "2 minutes")
  const timeMatch = description.match(/(\d+)\s*(minute|min|second|sec)/i);
  if (timeMatch) {
    const currentTime = parseInt(timeMatch[1], 10);
    const unit = timeMatch[2];
    const newTime = Math.ceil(currentTime * (1 + increasePercentage / 100));

    return {
      originalDescription: seed.step_description,
      newDescription: seed.step_description.replace(
        timeMatch[0],
        `${newTime} ${unit}${newTime > 1 ? 's' : ''}`
      ),
      increaseType: 'time',
      increaseAmount: increasePercentage,
      rationale: `You're consistent at ${currentTime} ${unit}. Try ${newTime} ${unit} next.`,
    };
  }

  // Count-based seeds (e.g., "5 pushups", "10 squats", "3 pages")
  const countMatch = description.match(/(\d+)\s*(\w+)/);
  if (countMatch) {
    const currentCount = parseInt(countMatch[1], 10);
    const item = countMatch[2];
    const newCount = Math.ceil(currentCount * (1 + increasePercentage / 100));

    return {
      originalDescription: seed.step_description,
      newDescription: seed.step_description.replace(
        countMatch[0],
        `${newCount} ${item}`
      ),
      increaseType: 'count',
      increaseAmount: increasePercentage,
      rationale: `You've mastered ${currentCount} ${item}. Ready for ${newCount}?`,
    };
  }

  // Intensity-based seeds (qualitative increase)
  const intensityUpgrades: Record<string, string> = {
    // Exercise progressions
    'wall pushup': 'knee pushup',
    'knee pushup': 'standard pushup',
    'air squat': 'squat with pause',
    'plank': 'side plank',

    // Time/effort progressions
    'gentle': 'moderate',
    'light': 'moderate',
    'short': 'medium',
    'brief': 'focused',

    // Writing progressions
    '1 sentence': '2 sentences',
    '1 page': '2 pages',
    '1 idea': '2 ideas',
  };

  for (const [current, next] of Object.entries(intensityUpgrades)) {
    if (description.includes(current)) {
      return {
        originalDescription: seed.step_description,
        newDescription: seed.step_description.replace(current, next),
        increaseType: 'intensity',
        increaseAmount: increasePercentage,
        rationale: `Great progress! Try upgrading to ${next}.`,
      };
    }
  }

  // Default: suggest custom increase
  return {
    originalDescription: seed.step_description,
    newDescription: seed.step_description,
    increaseType: 'custom',
    increaseAmount: increasePercentage,
    rationale: `You're ready for the next level. Think of a slightly harder version.`,
  };
}

/**
 * Respect energy budget when stepping up
 * Don't step up beyond the user's chosen energy commitment
 */
export function respectEnergyBudget(
  suggestion: StepUpSuggestion,
  energyBudget: EnergyBudget
): StepUpSuggestion {
  const budgetLimits: Record<EnergyBudget, number> = {
    tiny: 2, // max 2 minutes
    small: 5, // max 5 minutes
    medium: 10, // max 10 minutes
    big: 20, // max 20 minutes
  };

  const limit = budgetLimits[energyBudget];

  // Check if new description exceeds budget
  const timeMatch = suggestion.newDescription.match(/(\d+)\s*(minute|min)/i);
  if (timeMatch) {
    const newTime = parseInt(timeMatch[1], 10);
    if (newTime > limit) {
      // Cap at budget limit
      const cappedDescription = suggestion.newDescription.replace(
        timeMatch[0],
        `${limit} ${timeMatch[2]}`
      );
      return {
        ...suggestion,
        newDescription: cappedDescription,
        rationale: `${suggestion.rationale} (capped at your ${energyBudget} energy budget)`,
      };
    }
  }

  return suggestion;
}

/**
 * Batch step-up for multiple seeds
 */
export function batchStepUp(
  seeds: Seed[],
  logs: Map<string, { rollingSuccess: number; daysActive: number }>,
  energyBudget: EnergyBudget
): Array<{ seed: Seed; suggestion: StepUpSuggestion }> {
  const results: Array<{ seed: Seed; suggestion: StepUpSuggestion }> = [];

  for (const seed of seeds) {
    const logData = logs.get(seed.id);
    if (!logData) continue;

    if (isReadyForStepUp(logData.rollingSuccess, logData.daysActive)) {
      const suggestion = generateStepUp(seed, energyBudget);
      const cappedSuggestion = respectEnergyBudget(suggestion, energyBudget);
      results.push({ seed, suggestion: cappedSuggestion });
    }
  }

  return results;
}
