-- ============================================================================
-- GOAL APP - Database Schema for Supabase/Postgres
-- ============================================================================
-- This schema implements the Discovery→Integration goal tracking system
-- with local-first support and Row Level Security (RLS)
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  tz TEXT DEFAULT 'Asia/Manila',
  energy_baseline TEXT CHECK (energy_baseline IN ('tiny','small','medium','big')) DEFAULT 'small',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goals table
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT CHECK (status IN ('active','paused','baseline')) DEFAULT 'active',
  coach_preset TEXT CHECK (coach_preset IN ('drill','socratic','compassionate','engineer')) DEFAULT 'compassionate',
  season_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seeds table (micro-steps)
CREATE TABLE public.seeds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  minutes INT NOT NULL DEFAULT 1 CHECK (minutes > 0),
  if_window TEXT NOT NULL,
  if_context TEXT,
  step_level INT DEFAULT 0 CHECK (step_level >= 0),
  active BOOLEAN DEFAULT TRUE
);

-- Daily logs table
CREATE TABLE public.daily_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seed_id UUID NOT NULL REFERENCES public.seeds(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  outcome TEXT CHECK (outcome IN ('done','skipped')) NOT NULL,
  skip_reason TEXT CHECK (skip_reason IN ('too_hard','bad_timing','low_energy','forgot')),
  energy_after INT CHECK (energy_after BETWEEN 0 AND 100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(seed_id, date)
);

-- Integration states table
CREATE TABLE public.integration_states (
  seed_id UUID PRIMARY KEY REFERENCES public.seeds(id) ON DELETE CASCADE,
  rolling_success NUMERIC NOT NULL DEFAULT 0 CHECK (rolling_success BETWEEN 0 AND 1),
  status TEXT CHECK (status IN ('not_yet','almost','yes')) DEFAULT 'not_yet',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Push notification subscriptions table
CREATE TABLE public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES for performance
-- ============================================================================

CREATE INDEX idx_goals_user_id ON public.goals(user_id);
CREATE INDEX idx_goals_status ON public.goals(status);
CREATE INDEX idx_seeds_goal_id ON public.seeds(goal_id);
CREATE INDEX idx_seeds_active ON public.seeds(active);
CREATE INDEX idx_daily_logs_seed_id ON public.daily_logs(seed_id);
CREATE INDEX idx_daily_logs_date ON public.daily_logs(date);
CREATE INDEX idx_daily_logs_seed_date ON public.daily_logs(seed_id, date);
CREATE INDEX idx_push_subscriptions_user_id ON public.push_subscriptions(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own record"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own record"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own record"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Goals policies
CREATE POLICY "Users can view own goals"
  ON public.goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own goals"
  ON public.goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON public.goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON public.goals FOR DELETE
  USING (auth.uid() = user_id);

-- Seeds policies (via goal ownership)
CREATE POLICY "Users can view own seeds"
  ON public.seeds FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.goals
      WHERE goals.id = seeds.goal_id
      AND goals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create seeds for own goals"
  ON public.seeds FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.goals
      WHERE goals.id = seeds.goal_id
      AND goals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own seeds"
  ON public.seeds FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.goals
      WHERE goals.id = seeds.goal_id
      AND goals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own seeds"
  ON public.seeds FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.goals
      WHERE goals.id = seeds.goal_id
      AND goals.user_id = auth.uid()
    )
  );

-- Daily logs policies (via seed → goal ownership)
CREATE POLICY "Users can view own daily logs"
  ON public.daily_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.seeds
      JOIN public.goals ON goals.id = seeds.goal_id
      WHERE seeds.id = daily_logs.seed_id
      AND goals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create logs for own seeds"
  ON public.daily_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.seeds
      JOIN public.goals ON goals.id = seeds.goal_id
      WHERE seeds.id = daily_logs.seed_id
      AND goals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own logs"
  ON public.daily_logs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.seeds
      JOIN public.goals ON goals.id = seeds.goal_id
      WHERE seeds.id = daily_logs.seed_id
      AND goals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own logs"
  ON public.daily_logs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.seeds
      JOIN public.goals ON goals.id = seeds.goal_id
      WHERE seeds.id = daily_logs.seed_id
      AND goals.user_id = auth.uid()
    )
  );

-- Integration states policies (via seed → goal ownership)
CREATE POLICY "Users can view own integration states"
  ON public.integration_states FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.seeds
      JOIN public.goals ON goals.id = seeds.goal_id
      WHERE seeds.id = integration_states.seed_id
      AND goals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own integration states"
  ON public.integration_states FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.seeds
      JOIN public.goals ON goals.id = seeds.goal_id
      WHERE seeds.id = integration_states.seed_id
      AND goals.user_id = auth.uid()
    )
  );

-- Push subscriptions policies
CREATE POLICY "Users can view own push subscriptions"
  ON public.push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own push subscriptions"
  ON public.push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own push subscriptions"
  ON public.push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to automatically create a user record when someone signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user signs up via Supabase Auth
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update integration_states.updated_at on change
CREATE OR REPLACE FUNCTION public.update_integration_state_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_integration_state_modtime
  BEFORE UPDATE ON public.integration_states
  FOR EACH ROW EXECUTE FUNCTION public.update_integration_state_timestamp();

-- ============================================================================
-- SEED DATA (optional - for development)
-- ============================================================================

-- Uncomment below to add sample coach presets documentation
-- This is metadata only; the actual coach logic is in the application

COMMENT ON COLUMN public.goals.coach_preset IS
'Coach persona: drill (assertive), socratic (reflective), compassionate (gentle), engineer (metric-driven)';

COMMENT ON COLUMN public.seeds.if_window IS
'Time window or context for the micro-step, e.g., "20:00-22:00" or "after-lunch"';

COMMENT ON COLUMN public.daily_logs.skip_reason IS
'Diagnostic reason for skip: too_hard (shrink step), bad_timing (adjust window), low_energy (recovery task), forgot (add cue)';

COMMENT ON TABLE public.integration_states IS
'Tracks how automated a seed has become; rolling_success is fraction of successes over last 14 days';
