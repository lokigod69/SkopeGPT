/**
 * tRPC router for Seed (micro-step) operations
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { CreateSeedInputSchema } from '@/lib/schemas';
import { TRPCError } from '@trpc/server';
import { verifySeedOwnership, verifyGoalOwnership } from '../helpers';

export const seedsRouter = router({
  // List all seeds for a goal
  listForGoal: protectedProcedure
    .input(z.object({ goalId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // First verify the goal belongs to the user
      const { data: goal, error: goalError } = await ctx.supabase
        .from('goals')
        .select('id')
        .eq('id', input.goalId)
        .eq('user_id', ctx.user.id)
        .single();

      if (goalError || !goal) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Goal not found',
        });
      }

      const { data, error } = await ctx.supabase
        .from('seeds')
        .select('*')
        .eq('goal_id', input.goalId)
        .order('step_level', { ascending: false });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return data;
    }),

  // Get today's active seed (the one seed that's currently active) as any
  getTodayActive: protectedProcedure.query(async ({ ctx }) => {
    // Get active goals first
    const { data: goals, error: goalsError } = await ctx.supabase
      .from('goals')
      .select('id')
      .eq('user_id', ctx.user.id)
      .eq('status', 'active')
      .returns<{ id: string }[]>();

    if (goalsError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: goalsError.message,
      });
    }

    if (!goals || goals.length === 0) {
      return null;
    }

    const goalIds = goals.map(g => g.id);

    // Get the active seed
    const { data, error } = await ctx.supabase
      .from('seeds')
      .select('*, goals(*)')
      .in('goal_id', goalIds)
      .eq('active', true)
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message,
      });
    }

    return data || null;
  }),

  // Create a new seed
  create: protectedProcedure
    .input(CreateSeedInputSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify the goal belongs to the user
      const { data: goal, error: goalError } = await ctx.supabase
        .from('goals')
        .select('id')
        .eq('id', input.goal_id)
        .eq('user_id', ctx.user.id)
        .single();

      if (goalError || !goal) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Goal not found',
        });
      }

      const { data, error } = await ctx.supabase
        .from('seeds')
        .insert({
          goal_id: input.goal_id,
          description: input.description,
          minutes: input.minutes,
          if_window: input.if_window,
          if_context: input.if_context,
          step_level: 0,
          active: true,
        } as any)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return data;
    }),

  // Update a seed
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: z.object({
          description: z.string().min(1).max(200).optional(),
          minutes: z.number().int().min(1).max(30).optional(),
          if_window: z.string().optional(),
          if_context: z.string().optional(),
          step_level: z.number().int().min(0).optional(),
          active: z.boolean().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership through goal
      await verifySeedOwnership(ctx, input.id);

      const { data, error } = await (ctx.supabase as any)
        .from('seeds')
        .update(input.data)
        .eq('id', input.id)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return data;
    }),

  // Delete a seed
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership through goal
      await verifySeedOwnership(ctx, input.id);

      const { error } = await ctx.supabase
        .from('seeds')
        .delete()
        .eq('id', input.id);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return { success: true };
    }),
});
