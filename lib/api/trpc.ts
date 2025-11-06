/**
 * tRPC configuration and context
 * Provides type-safe API between client and server
 */

import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { createServerSupabaseClient } from '../db/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

// Context type - includes authenticated user and Supabase client
export interface Context {
  user: SupabaseUser | null;
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>;
}

/**
 * Create context for each request
 * This runs on every API call
 */
export async function createContext(): Promise<Context> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    user,
    supabase,
  };
}

// Initialize tRPC with context
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

// Export reusable router and procedure helpers
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected procedure - requires authentication
 * Throws UNAUTHORIZED error if user is not logged in
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // Now guaranteed to be non-null
    },
  });
});

// Middleware for logging (optional, useful for debugging)
export const loggerMiddleware = t.middleware(async ({ path, type, next }) => {
  const start = Date.now();
  const result = await next();
  const durationMs = Date.now() - start;

  console.log(`[tRPC] ${type} ${path} - ${durationMs}ms`);

  return result;
});
