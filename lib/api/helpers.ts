/**
 * Helper functions for tRPC routers
 */

import { TRPCError } from '@trpc/server';
import type { Context } from './trpc';

/**
 * Verify that a seed belongs to the current user
 * @throws TRPCError if seed not found or doesn't belong to user
 */
export async function verifySeedOwnership(
  ctx: Context & { user: NonNullable<Context['user']> },
  seedId: string
): Promise<void> {
  // Get the seed with explicit type
  const { data: seed, error: seedError } = await ctx.supabase
    .from('seeds')
    .select('goal_id')
    .eq('id', seedId)
    .single<{ goal_id: string }>();

  if (seedError || !seed) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Seed not found',
    });
  }

  // Check goal ownership
  const { data: goal, error: goalError } = await ctx.supabase
    .from('goals')
    .select('user_id')
    .eq('id', seed.goal_id)
    .single<{ user_id: string }>();

  if (goalError || !goal || goal.user_id !== ctx.user.id) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Seed not found',
    });
  }
}

/**
 * Verify that a goal belongs to the current user
 * @throws TRPCError if goal not found or doesn't belong to user
 */
export async function verifyGoalOwnership(
  ctx: Context & { user: NonNullable<Context['user']> },
  goalId: string
): Promise<void> {
  const { data: goal, error } = await ctx.supabase
    .from('goals')
    .select('user_id')
    .eq('id', goalId)
    .single<{ user_id: string }>();

  if (error || !goal || goal.user_id !== ctx.user.id) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Goal not found',
    });
  }
}
