/**
 * Database types - will be generated from Supabase schema
 * For now, providing a placeholder that matches our Zod schemas
 */

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          tz: string;
          energy_baseline: 'tiny' | 'small' | 'medium' | 'big';
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          tz?: string;
          energy_baseline?: 'tiny' | 'small' | 'medium' | 'big';
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          tz?: string;
          energy_baseline?: 'tiny' | 'small' | 'medium' | 'big';
          created_at?: string;
        };
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          status: 'active' | 'paused' | 'baseline';
          coach_preset: 'drill' | 'socratic' | 'compassionate' | 'engineer';
          season_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          status?: 'active' | 'paused' | 'baseline';
          coach_preset?: 'drill' | 'socratic' | 'compassionate' | 'engineer';
          season_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          status?: 'active' | 'paused' | 'baseline';
          coach_preset?: 'drill' | 'socratic' | 'compassionate' | 'engineer';
          season_id?: string | null;
          created_at?: string;
        };
      };
      seeds: {
        Row: {
          id: string;
          goal_id: string;
          description: string;
          minutes: number;
          if_window: string;
          if_context: string | null;
          step_level: number;
          active: boolean;
        };
        Insert: {
          id?: string;
          goal_id: string;
          description: string;
          minutes?: number;
          if_window: string;
          if_context?: string | null;
          step_level?: number;
          active?: boolean;
        };
        Update: {
          id?: string;
          goal_id?: string;
          description?: string;
          minutes?: number;
          if_window?: string;
          if_context?: string | null;
          step_level?: number;
          active?: boolean;
        };
      };
      daily_logs: {
        Row: {
          id: string;
          seed_id: string;
          date: string;
          outcome: 'done' | 'skipped';
          skip_reason: 'too_hard' | 'bad_timing' | 'low_energy' | 'forgot' | null;
          energy_after: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          seed_id: string;
          date: string;
          outcome: 'done' | 'skipped';
          skip_reason?: 'too_hard' | 'bad_timing' | 'low_energy' | 'forgot' | null;
          energy_after?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          seed_id?: string;
          date?: string;
          outcome?: 'done' | 'skipped';
          skip_reason?: 'too_hard' | 'bad_timing' | 'low_energy' | 'forgot' | null;
          energy_after?: number | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      integration_states: {
        Row: {
          seed_id: string;
          rolling_success: number;
          status: 'not_yet' | 'almost' | 'yes';
          updated_at: string;
        };
        Insert: {
          seed_id: string;
          rolling_success?: number;
          status?: 'not_yet' | 'almost' | 'yes';
          updated_at?: string;
        };
        Update: {
          seed_id?: string;
          rolling_success?: number;
          status?: 'not_yet' | 'almost' | 'yes';
          updated_at?: string;
        };
      };
      push_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          endpoint: string;
          p256dh: string;
          auth: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          endpoint?: string;
          p256dh?: string;
          auth?: string;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
