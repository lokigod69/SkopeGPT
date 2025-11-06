/**
 * Main tRPC router - combines all sub-routers
 */

import { router } from '../trpc';
import { goalsRouter } from './goals';
import { seedsRouter } from './seeds';
import { dailyRouter } from './daily';

export const appRouter = router({
  goals: goalsRouter,
  seeds: seedsRouter,
  daily: dailyRouter,
});

// Export type definition for the router
export type AppRouter = typeof appRouter;
