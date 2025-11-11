/**
 * Onboarding Actions
 * Handles the creation of goal, seed, and integration state on onboarding completion
 */

import { db, queueSyncEvent, type LocalGoal, type LocalSeed, type LocalIntegrationState } from '@/lib/db/dexie';
import type { CoachPreset, EnergyBudget } from '@/lib/schemas';

/**
 * Parse minutes from micro-step title
 * "1 minute" → 1, "2-minute" → 2, "3-minute" → 3, fallback → 2
 */
function parseMinutesFromTitle(title: string): number {
  const match = title.match(/(\d+)[\s-]minute/i);
  return match ? parseInt(match[1], 10) : 2; // Default to 2 minutes
}

interface CompleteOnboardingParams {
  horizon: string;
  energy: EnergyBudget;
  coachPreset: CoachPreset;
  seedDescription: string;
  seedMinutes?: number; // Optional - will be parsed from description if not provided
  ifWindow?: string;
  ifContext?: string;
}

interface CompleteOnboardingResult {
  goal: LocalGoal;
  seed: LocalSeed;
  integrationState: LocalIntegrationState;
}

/**
 * Complete onboarding by creating goal, seed, and integration state
 * All records are created locally and queued for sync
 */
export async function completeOnboarding(params: CompleteOnboardingParams): Promise<CompleteOnboardingResult> {
  const {
    horizon,
    coachPreset,
    seedDescription,
    ifWindow = 'morning',
    ifContext,
  } = params;

  // Parse minutes from seed description if not provided explicitly
  const seedMinutes = params.seedMinutes ?? parseMinutesFromTitle(seedDescription);

  // Generate IDs
  const goalId = crypto.randomUUID();
  const seedId = crypto.randomUUID();
  const userId = 'local-user'; // TODO: Get from auth when available

  // Create Goal
  const goal: LocalGoal = {
    id: goalId,
    user_id: userId,
    title: horizon,
    status: 'active',
    coach_preset: coachPreset,
    sync_status: 'pending',
    created_at: new Date(),
  };

  // Create Seed (first micro-step)
  const seed: LocalSeed = {
    id: seedId,
    goal_id: goalId,
    description: seedDescription,
    minutes: seedMinutes,
    if_window: ifWindow,
    if_context: ifContext,
    step_level: 0, // First step always starts at 0
    active: true,
    sync_status: 'pending',
  };

  // Create Integration State
  const integrationState: LocalIntegrationState = {
    seed_id: seedId,
    rolling_success: 0, // Start at 0
    status: 'not_yet',
    sync_status: 'pending',
    updated_at: new Date(),
  };

  // Persist locally in a transaction
  await db.transaction('rw', [db.goals, db.seeds, db.integration_states], async () => {
    await db.goals.add(goal);
    await db.seeds.add(seed);
    await db.integration_states.add(integrationState);
  });

  // Queue sync events
  await queueSyncEvent({
    type: 'create_goal',
    entity_id: goalId,
    payload: { title: horizon, coach_preset: coachPreset },
  });

  await queueSyncEvent({
    type: 'create_seed',
    entity_id: seedId,
    payload: {
      goal_id: goalId,
      description: seedDescription,
      minutes: seedMinutes,
      if_window: ifWindow,
      if_context: ifContext,
    },
  });

  await queueSyncEvent({
    type: 'update_integration',
    entity_id: seedId,
    payload: {
      rolling_success: 0,
      status: 'not_yet',
    },
  });

  return { goal, seed, integrationState };
}
