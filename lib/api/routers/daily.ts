/**
 * tRPC router for Daily Log operations
 * Handles logging completions, skips, and calculating rolling success
 */

import { z } from 'zod';
import { router, protectedProcedure } from '../trpc';
import { LogDoneInputSchema, LogSkipInputSchema, IntegrationCheckInputSchema } from '@/lib/schemas';
import { TRPCError } from '@trpc/server';
import { verifySeedOwnership } from '../helpers';

export const dailyRouter = router({
  // Log a completed micro-step
  logDone: protectedProcedure
    .input(LogDoneInputSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify seed ownership
      await verifySeedOwnership(ctx, input.seed_id);

      // Insert or update the daily log
      const { data, error } = await ctx.supabase
        .from('daily_logs')
        .upsert({
          seed_id: input.seed_id,
          date: input.date,
          outcome: 'done' as const,
          energy_after: input.energy_after,
          notes: input.notes,
          skip_reason: null,
        } as any)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      // Update rolling success
      await updateRollingSuccess(ctx, input.seed_id);

      return data;
    }),

  // Log a skipped micro-step with reason
  logSkip: protectedProcedure
    .input(LogSkipInputSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify seed ownership
      await verifySeedOwnership(ctx, input.seed_id);

      // Insert or update the daily log
      const { data, error } = await ctx.supabase
        .from('daily_logs')
        .upsert({
          seed_id: input.seed_id,
          date: input.date,
          outcome: 'skipped' as const,
          skip_reason: input.reason,
        } as any)
        .select()
        .single();

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      // Update rolling success
      await updateRollingSuccess(ctx, input.seed_id);

      return data;
    }),

  // Get logs for a seed
  getLogsForSeed: protectedProcedure
    .input(
      z.object({
        seedId: z.string().uuid(),
        days: z.number().int().min(1).max(90).default(14),
      })
    )
    .query(async ({ ctx, input }) => {
      // Verify seed ownership
      await verifySeedOwnership(ctx, input.seedId);

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);
      const startDateStr = startDate.toISOString().split('T')[0];

      const { data, error } = await ctx.supabase
        .from('daily_logs')
        .select('*')
        .eq('seed_id', input.seedId)
        .gte('date', startDateStr)
        .order('date', { ascending: false });

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return data;
    }),

  // Get today's log for a seed
  getTodayLog: protectedProcedure
    .input(z.object({ seedId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const today = new Date().toISOString().split('T')[0];

      // Verify seed ownership
      await verifySeedOwnership(ctx, input.seedId);

      const { data, error } = await ctx.supabase
        .from('daily_logs')
        .select('*')
        .eq('seed_id', input.seedId)
        .eq('date', today)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return data || null;
    }),

  // Update integration check status
  updateIntegrationStatus: protectedProcedure
    .input(IntegrationCheckInputSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify seed ownership
      await verifySeedOwnership(ctx, input.seed_id);

      const { data, error } = await ctx.supabase
        .from('integration_states')
        .upsert({
          seed_id: input.seed_id,
          status: input.status,
          updated_at: new Date().toISOString(),
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

  // Get integration state for a seed
  getIntegrationState: protectedProcedure
    .input(z.object({ seedId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      // Verify seed ownership
      await verifySeedOwnership(ctx, input.seedId);

      const { data, error } = await ctx.supabase
        .from('integration_states')
        .select('*')
        .eq('seed_id', input.seedId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        });
      }

      return data || null;
    }),

  // Get weekly recap data
  getWeeklyRecap: protectedProcedure.query(async ({ ctx }) => {
    // Get all active goals for the user
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
      return {
        logs: [],
        frictionMap: {
          too_hard: 0,
          bad_timing: 0,
          low_energy: 0,
          forgot: 0,
        },
        completionRate: 0,
      };
    }

    const goalIds = goals.map(g => g.id);

    // Get seeds for these goals
    const { data: seeds, error: seedsError } = await ctx.supabase
      .from('seeds')
      .select('id')
      .in('goal_id', goalIds)
      .returns<{ id: string }[]>();

    if (seedsError || !seeds) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: seedsError?.message || 'Failed to fetch seeds',
      });
    }

    const seedIds = seeds.map(s => s.id);

    // Get logs from the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const startDateStr = sevenDaysAgo.toISOString().split('T')[0];

    const { data: logs, error: logsError } = await ctx.supabase
      .from('daily_logs')
      .select('*')
      .in('seed_id', seedIds)
      .gte('date', startDateStr)
      .order('date', { ascending: false })
      .returns<Array<{ outcome: 'done' | 'skipped'; skip_reason: string | null }>>();

    if (logsError) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: logsError.message,
      });
    }

    // Calculate friction map
    const frictionMap = {
      too_hard: 0,
      bad_timing: 0,
      low_energy: 0,
      forgot: 0,
    };

    let doneCount = 0;

    logs?.forEach(log => {
      if (log.outcome === 'done') {
        doneCount++;
      } else if (log.outcome === 'skipped' && log.skip_reason) {
        frictionMap[log.skip_reason as keyof typeof frictionMap]++;
      }
    });

    const completionRate = logs.length > 0 ? doneCount / logs.length : 0;

    return {
      logs: logs || [],
      frictionMap,
      completionRate,
    };
  }),
});

/**
 * Helper function to update rolling success for a seed
 */
async function updateRollingSuccess(ctx: any, seedId: string) {
  // Get logs from the last 14 days
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  const startDateStr = fourteenDaysAgo.toISOString().split('T')[0];

  const { data: logs, error } = await ctx.supabase
    .from('daily_logs')
    .select('outcome')
    .eq('seed_id', seedId)
    .gte('date', startDateStr);

  if (error || !logs || logs.length === 0) {
    return;
  }

  const doneCount = logs.filter((log: any) => log.outcome === 'done').length;
  const rollingSuccess = doneCount / logs.length;

  // Determine status based on rolling success
  let status: 'not_yet' | 'almost' | 'yes' = 'not_yet';
  if (rollingSuccess >= 0.8) {
    status = 'yes';
  } else if (rollingSuccess >= 0.6) {
    status = 'almost';
  }

  // Update integration state
  await ctx.supabase
    .from('integration_states')
    .upsert({
      seed_id: seedId,
      rolling_success: rollingSuccess,
      status,
      updated_at: new Date().toISOString(),
    } as any);
}
