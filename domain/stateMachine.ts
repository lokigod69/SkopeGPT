/**
 * Domain State Machine for Seed Lifecycle
 *
 * Pure business logic - no React, no database dependencies
 * Testable, portable, and the single source of truth for seed behavior
 *
 * States: Idle → Prompted → InProgress → Completed | Triage → Adapt → Idle
 */

import type { Seed, DailyLog, SkipReason, IntegrationStatus } from '@/lib/schemas';

// ============================================================================
// Types
// ============================================================================

export type SeedState =
  | 'idle'           // Waiting for daily prompt
  | 'prompted'       // User sees today's card
  | 'in_progress'    // User clicked "Do it"
  | 'completed'      // Logged as done
  | 'triage'         // User clicked "Can't today"
  | 'adapt';         // System is adapting the plan

export interface SeedContext {
  seed: Seed;
  logs: DailyLog[];
  integration_status: IntegrationStatus;
  energy_budget: 'tiny' | 'small' | 'medium' | 'big';
}

export type SeedEvent =
  | { type: 'PROMPT' }
  | { type: 'START' }
  | { type: 'COMPLETE'; energy_after?: number; notes?: string }
  | { type: 'SKIP'; reason: SkipReason }
  | { type: 'INTEGRATION_CHECK'; status: IntegrationStatus }
  | { type: 'ADAPT_COMPLETE' }
  | { type: 'RESET' };

export interface SeedAction {
  type: 'step_up' | 'hold_steady' | 'shrink' | 'adjust_timing' | 'add_recovery' | 'add_cue' | 'promote_baseline';
  seed?: Partial<Seed>;
  message?: string;
}

// ============================================================================
// State Machine Logic
// ============================================================================

/**
 * Transition function - given current state and event, return next state and actions
 */
export function transition(
  currentState: SeedState,
  event: SeedEvent,
  context: SeedContext
): { nextState: SeedState; actions: SeedAction[] } {
  switch (currentState) {
    case 'idle':
      if (event.type === 'PROMPT') {
        return { nextState: 'prompted', actions: [] };
      }
      break;

    case 'prompted':
      if (event.type === 'START') {
        return { nextState: 'in_progress', actions: [] };
      }
      if (event.type === 'COMPLETE') {
        return {
          nextState: 'completed',
          actions: shouldStepUp(context)
            ? [{ type: 'step_up', message: 'Great work! Step up 10%?' }]
            : [{ type: 'hold_steady', message: 'Keep the streak going!' }],
        };
      }
      if (event.type === 'SKIP') {
        return {
          nextState: 'triage',
          actions: [],
        };
      }
      break;

    case 'in_progress':
      if (event.type === 'COMPLETE') {
        return {
          nextState: 'completed',
          actions: shouldStepUp(context)
            ? [{ type: 'step_up', message: 'Great work! Step up 10%?' }]
            : [{ type: 'hold_steady', message: 'Keep the streak going!' }],
        };
      }
      break;

    case 'completed':
      if (event.type === 'INTEGRATION_CHECK') {
        if (event.status === 'yes') {
          return {
            nextState: 'idle',
            actions: [{ type: 'promote_baseline', message: 'This is now part of who you are!' }],
          };
        }
        return { nextState: 'idle', actions: [] };
      }
      if (event.type === 'RESET') {
        return { nextState: 'idle', actions: [] };
      }
      break;

    case 'triage':
      if (event.type === 'SKIP') {
        const adaptAction = determineAdaptation(event.reason, context);
        return {
          nextState: 'adapt',
          actions: [adaptAction],
        };
      }
      break;

    case 'adapt':
      if (event.type === 'ADAPT_COMPLETE') {
        return { nextState: 'idle', actions: [] };
      }
      break;
  }

  // No valid transition
  return { nextState: currentState, actions: [] };
}

// ============================================================================
// Decision Logic
// ============================================================================

/**
 * Should we suggest a step-up?
 * Criteria: rolling success >= 0.7 AND recent streak >= 2
 */
function shouldStepUp(context: SeedContext): boolean {
  const rollingSuccess = calculateRollingSuccess(context.logs);
  const recentStreak = calculateRecentStreak(context.logs);

  return rollingSuccess >= 0.7 && recentStreak >= 2;
}

/**
 * Calculate rolling success from logs (14-day window)
 */
function calculateRollingSuccess(logs: DailyLog[]): number {
  const recentLogs = logs.slice(0, 14); // Assume logs are sorted desc
  if (recentLogs.length === 0) return 0;

  const doneCount = recentLogs.filter(log => log.outcome === 'done').length;
  return doneCount / recentLogs.length;
}

/**
 * Calculate current streak of consecutive completions
 */
function calculateRecentStreak(logs: DailyLog[]): number {
  let streak = 0;
  for (const log of logs) {
    if (log.outcome === 'done') {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

/**
 * Determine adaptation based on skip reason
 */
function determineAdaptation(reason: SkipReason, context: SeedContext): SeedAction {
  const { seed } = context;

  switch (reason) {
    case 'too_hard':
      // Shrink the step by 30%, reduce step_level
      const newMinutes = Math.max(1, Math.ceil(seed.minutes * 0.7));
      return {
        type: 'shrink',
        seed: {
          minutes: newMinutes,
          step_level: Math.max(0, seed.step_level - 1),
        },
        message: `Let's make it easier: ${newMinutes} minute(s) instead.`,
      };

    case 'bad_timing':
      // Suggest timing adjustment
      return {
        type: 'adjust_timing',
        message: 'Let\'s find a better time window for this.',
      };

    case 'low_energy':
      // Add recovery task
      return {
        type: 'add_recovery',
        message: 'Try 2 minutes of breath + walk first to build energy.',
      };

    case 'forgot':
      // Add environmental cue
      return {
        type: 'add_cue',
        message: 'Let\'s add a visual reminder to help you remember.',
      };

    default:
      return {
        type: 'hold_steady',
        message: 'We\'ll try again tomorrow.',
      };
  }
}

/**
 * Apply step-up logic - increase by 10-15%
 */
export function applyStepUp(seed: Seed): Partial<Seed> {
  const increase = Math.ceil(seed.minutes * 0.10); // 10% increase
  return {
    minutes: seed.minutes + Math.max(1, increase),
    step_level: seed.step_level + 1,
  };
}

/**
 * Check if seed qualifies for baseline promotion
 * Criteria: rolling success >= 0.8 over 14 days
 */
export function shouldPromoteBaseline(logs: DailyLog[]): boolean {
  const rollingSuccess = calculateRollingSuccess(logs);
  return rollingSuccess >= 0.8;
}

// ============================================================================
// Exports
// ============================================================================

export const SeedStateMachine = {
  transition,
  shouldStepUp,
  shouldPromoteBaseline,
  applyStepUp,
  calculateRollingSuccess,
  calculateRecentStreak,
};
