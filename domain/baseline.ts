/**
 * Baseline Promotion Logic
 * When a seed becomes automatic (rolling_success >= 0.8 or user confirms),
 * it gets promoted to "baseline" - part of daily routine
 */

import type { Seed } from '@/lib/schemas';

export interface BaselinePromotion {
  seedId: string;
  seedDescription: string;
  trigger: 'automatic' | 'user_confirmed';
  rollingSuccess: number;
  message: string;
  nextAction: 'celebrate' | 'step_up' | 'new_seed';
}

/**
 * Check if seed is ready for baseline promotion
 */
export function isReadyForBaseline(
  rollingSuccess: number,
  daysActive: number,
  integrationStatus?: 'not_yet' | 'almost' | 'yes',
  minDays: number = 21
): boolean {
  // Automatic promotion: High success rate + enough time
  if (rollingSuccess >= 0.8 && daysActive >= minDays) {
    return true;
  }

  // User-confirmed promotion: They said "yes" to integration
  if (integrationStatus === 'yes' && daysActive >= 14) {
    return true;
  }

  return false;
}

/**
 * Generate baseline promotion message
 */
export function createBaselinePromotion(
  seed: Seed,
  rollingSuccess: number,
  integrationStatus?: 'not_yet' | 'almost' | 'yes'
): BaselinePromotion {
  const trigger =
    rollingSuccess >= 0.8 ? 'automatic' : 'user_confirmed';

  const messages = {
    automatic: [
      `${seed.description} is now part of your routine! 🎉`,
      `You've automated ${seed.description} - it's baseline now.`,
      `${seed.description} has become second nature. Well done!`,
    ],
    user_confirmed: [
      `Great! ${seed.description} is now your baseline.`,
      `Locked in: ${seed.description} is automatic.`,
      `${seed.description} - you've made it stick!`,
    ],
  };

  const messageList = messages[trigger];
  const message = messageList[Math.floor(Math.random() * messageList.length)];

  // Determine next action based on success level
  let nextAction: 'celebrate' | 'step_up' | 'new_seed';
  if (rollingSuccess >= 0.85) {
    nextAction = 'step_up'; // They're crushing it, suggest harder version
  } else if (rollingSuccess >= 0.75) {
    nextAction = 'new_seed'; // Solid performance, ready to add another horizon
  } else {
    nextAction = 'celebrate'; // Just celebrate, keep maintaining
  }

  return {
    seedId: seed.id,
    seedDescription: seed.description,
    trigger,
    rollingSuccess,
    message,
    nextAction,
  };
}

/**
 * Determine what happens after baseline promotion
 */
export function getPostBaselineAction(
  promotion: BaselinePromotion
): {
  action: string;
  description: string;
  cta: string;
} {
  switch (promotion.nextAction) {
    case 'step_up':
      return {
        action: 'step_up',
        description: `You're ready to level up ${promotion.seedDescription}`,
        cta: 'Increase Difficulty',
      };
    case 'new_seed':
      return {
        action: 'new_seed',
        description: 'Ready to add another micro-habit?',
        cta: 'Add New Goal',
      };
    case 'celebrate':
    default:
      return {
        action: 'celebrate',
        description: `Keep ${promotion.seedDescription} going on autopilot`,
        cta: 'Keep Going',
      };
  }
}

/**
 * Update seed status to baseline
 * Note: Seeds don't have a status field in the schema.
 * In practice, baseline promotion would deactivate the seed (active: false)
 * and potentially update the parent Goal's status.
 */
export function promoteToBaseline(seed: Seed): Partial<Seed> {
  return {
    id: seed.id,
    active: false, // Mark seed as no longer active since it's baseline
  };
}

/**
 * Check all seeds for baseline candidates
 */
export function findBaselineCandidates(
  seeds: Seed[],
  logs: Map<
    string,
    {
      rollingSuccess: number;
      daysActive: number;
      integrationStatus?: 'not_yet' | 'almost' | 'yes';
    }
  >
): BaselinePromotion[] {
  const candidates: BaselinePromotion[] = [];

  for (const seed of seeds) {
    // Skip inactive seeds (already at baseline or paused)
    if (!seed.active) continue;

    const logData = logs.get(seed.id);
    if (!logData) continue;

    if (
      isReadyForBaseline(
        logData.rollingSuccess,
        logData.daysActive,
        logData.integrationStatus
      )
    ) {
      const promotion = createBaselinePromotion(
        seed,
        logData.rollingSuccess,
        logData.integrationStatus
      );
      candidates.push(promotion);
    }
  }

  return candidates;
}

/**
 * Coach-specific celebration messages
 */
export function getCoachCelebration(
  coachPreset: 'drill' | 'socratic' | 'compassionate' | 'engineer',
  seedDescription: string
): string {
  const celebrations = {
    drill: [
      `${seedDescription} - LOCKED IN. You earned this.`,
      `Baseline achieved. No fanfare. Just results.`,
      `${seedDescription} is automatic. Next target.`,
    ],
    socratic: [
      `Notice how ${seedDescription} feels effortless now?`,
      `What does it feel like to make ${seedDescription} automatic?`,
      `You've internalized ${seedDescription}. What changed?`,
    ],
    compassionate: [
      `You did it! ${seedDescription} is part of who you are now.`,
      `Celebrate this: ${seedDescription} is your new normal.`,
      `So proud of you. ${seedDescription} is baseline. 🌟`,
    ],
    engineer: [
      `${seedDescription} - 0.8+ success rate. System optimized.`,
      `Baseline promotion triggered. ${seedDescription} automated.`,
      `${seedDescription} - habit loop established. Metrics green.`,
    ],
  };

  const messages = celebrations[coachPreset];
  return messages[Math.floor(Math.random() * messages.length)];
}
