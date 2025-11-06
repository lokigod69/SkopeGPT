/**
 * Zod schemas for runtime validation and type inference
 * These schemas are the single source of truth for all domain entities
 */

import { z } from 'zod';

// ============================================================================
// Core Enums & Literals
// ============================================================================

export const EnergyBudgetSchema = z.enum(['tiny', 'small', 'medium', 'big']);
export type EnergyBudget = z.infer<typeof EnergyBudgetSchema>;

export const CoachPresetSchema = z.enum([
  'drill',
  'socratic',
  'compassionate',
  'engineer',
]);
export type CoachPreset = z.infer<typeof CoachPresetSchema>;

export const SkipReasonSchema = z.enum([
  'too_hard',
  'bad_timing',
  'low_energy',
  'forgot',
]);
export type SkipReason = z.infer<typeof SkipReasonSchema>;

export const OutcomeSchema = z.enum(['done', 'skipped']);
export type Outcome = z.infer<typeof OutcomeSchema>;

export const GoalStatusSchema = z.enum(['active', 'paused', 'baseline']);
export type GoalStatus = z.infer<typeof GoalStatusSchema>;

export const IntegrationStatusSchema = z.enum(['not_yet', 'almost', 'yes']);
export type IntegrationStatus = z.infer<typeof IntegrationStatusSchema>;

export const SeedStateSchema = z.enum([
  'idle',
  'prompted',
  'in_progress',
  'completed',
  'triage',
  'adapt',
]);
export type SeedState = z.infer<typeof SeedStateSchema>;

// ============================================================================
// Domain Entities
// ============================================================================

// User
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  tz: z.string().default('Asia/Manila'),
  energy_baseline: EnergyBudgetSchema.default('small'),
  created_at: z.date().optional(),
});
export type User = z.infer<typeof UserSchema>;

// Goal
export const GoalSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  title: z.string().min(1).max(100),
  status: GoalStatusSchema.default('active'),
  coach_preset: CoachPresetSchema.default('compassionate'),
  season_id: z.string().uuid().optional(),
  created_at: z.date().optional(),
});
export type Goal = z.infer<typeof GoalSchema>;

// Seed (micro-step)
export const SeedSchema = z.object({
  id: z.string().uuid(),
  goal_id: z.string().uuid(),
  description: z.string().min(1).max(200),
  minutes: z.number().int().min(1).max(30).default(1),
  if_window: z.string(), // e.g., "20:00-22:00" or "lunch-break"
  if_context: z.string().optional(), // e.g., "kitchen table"
  step_level: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
});
export type Seed = z.infer<typeof SeedSchema>;

// If-Then structure (embedded in Seed)
export const IfThenSchema = z.object({
  window: z.string(), // time range or context keyword
  context: z.string().optional(), // physical/mental context
});
export type IfThen = z.infer<typeof IfThenSchema>;

// Daily Log
export const DailyLogSchema = z.object({
  id: z.string().uuid(),
  seed_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // ISO date only: YYYY-MM-DD
  outcome: OutcomeSchema,
  skip_reason: SkipReasonSchema.optional(),
  energy_after: z.number().int().min(0).max(100).optional(),
  notes: z.string().max(500).optional(),
  created_at: z.date().optional(),
});
export type DailyLog = z.infer<typeof DailyLogSchema>;

// Integration State
export const IntegrationStateSchema = z.object({
  seed_id: z.string().uuid(),
  rolling_success: z.number().min(0).max(1), // 0–1 fraction
  status: IntegrationStatusSchema.default('not_yet'),
  updated_at: z.date().optional(),
});
export type IntegrationState = z.infer<typeof IntegrationStateSchema>;

// ============================================================================
// API Request/Response Schemas
// ============================================================================

// Onboarding
export const OnboardingInputSchema = z.object({
  horizon: z.string().min(1).max(100), // e.g., "Writing", "Strength"
  energy_budget: EnergyBudgetSchema,
  coach_preset: CoachPresetSchema,
  soil_rating: z.number().int().min(1).max(5), // Likert 1–5
});
export type OnboardingInput = z.infer<typeof OnboardingInputSchema>;

// Create Goal
export const CreateGoalInputSchema = z.object({
  title: z.string().min(1).max(100),
  coach_preset: CoachPresetSchema.optional(),
});
export type CreateGoalInput = z.infer<typeof CreateGoalInputSchema>;

// Create Seed
export const CreateSeedInputSchema = z.object({
  goal_id: z.string().uuid(),
  description: z.string().min(1).max(200),
  minutes: z.number().int().min(1).max(30),
  if_window: z.string(),
  if_context: z.string().optional(),
});
export type CreateSeedInput = z.infer<typeof CreateSeedInputSchema>;

// Log Done
export const LogDoneInputSchema = z.object({
  seed_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  energy_after: z.number().int().min(0).max(100).optional(),
  notes: z.string().max(500).optional(),
});
export type LogDoneInput = z.infer<typeof LogDoneInputSchema>;

// Log Skip
export const LogSkipInputSchema = z.object({
  seed_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: SkipReasonSchema,
});
export type LogSkipInput = z.infer<typeof LogSkipInputSchema>;

// Integration Check
export const IntegrationCheckInputSchema = z.object({
  seed_id: z.string().uuid(),
  status: IntegrationStatusSchema,
});
export type IntegrationCheckInput = z.infer<typeof IntegrationCheckInputSchema>;

// ============================================================================
// Component Props Schemas
// ============================================================================

export const TodayCardPropsSchema = z.object({
  seed: SeedSchema,
  goal: GoalSchema,
  energy_budget: EnergyBudgetSchema,
  coach: CoachPresetSchema,
});
export type TodayCardProps = z.infer<typeof TodayCardPropsSchema>;

// ============================================================================
// Utilities
// ============================================================================

/**
 * Generate a new UUID (client-side compatible)
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Get today's date in ISO format (YYYY-MM-DD)
 */
export function getTodayISO(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Validate and parse with helpful error messages
 */
export function safeParse<T>(schema: z.ZodSchema<T>, data: unknown) {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error('Validation error:', result.error.format());
  }
  return result;
}
