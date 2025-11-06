/**
 * tRPC router for Goal operations
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { CreateGoalInputSchema, GoalSchema, GoalStatusSchema } from '@/lib/schemas';
import { TRPCError } from '@trpc/server';

export const goalsRouter = router({
  // List all goals for the current user
  list: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('goals')
      .select('*')
      .eq('user_id', ctx.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message,
      });
    }

    return data;
  }),

  // Get a single goal by ID
  get: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('goals')
        .select('*')
        .eq('id', input.id)
        .eq('user_id', ctx.user.id)
        .single();

      if (error) {
        throw new TRPCError({
          code: error.code === 'PGRST116' ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return data;
    }),

  // Create a new goal
  create: protectedProcedure
    .input(CreateGoalInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('goals')
        .insert({
          user_id: ctx.user.id,
          title: input.title,
          coach_preset: input.coach_preset || 'compassionate',
          status: 'active',
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

  // Update a goal
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        data: z.object({
          title: z.string().min(1).max(100).optional(),
          status: GoalStatusSchema.optional(),
          coach_preset: z.enum(['drill', 'socratic', 'compassionate', 'engineer']).optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await (ctx.supabase as any)
        .from('goals')
        .update(input.data)
        .eq('id', input.id)
        .eq('user_id', ctx.user.id)
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

  // Delete a goal
  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from('goals')
        .delete()
        .eq('id', input.id)
        .eq('user_id', ctx.user.id);

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return { success: true };
    }),

  // Get active goals (not paused or baseline) as any
  getActive: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('goals')
      .select('*')
      .eq('user_id', ctx.user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message,
      });
    }

    return data;
  }),

  // Set goal status (active, paused, baseline) as any
  setStatus: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        status: GoalStatusSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await (ctx.supabase as any)
        .from('goals')
        .update({ status: input.status })
        .eq('id', input.id)
        .eq('user_id', ctx.user.id)
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
});
