/**
 * Coach Provider Types
 * Defines the contract for AI coaching (LLM-powered or mock)
 */

import type { CoachPreset, EnergyBudget } from '@/lib/schemas';

export interface CoachRequest {
  preset: CoachPreset;
  seed: {
    description: string;
    minutes: number;
    if_window?: string;
    context?: string;
  };
  history: Array<{
    date: string;
    outcome: 'done' | 'skipped';
    skip_reason?: string;
  }>;
  metrics: {
    success14: number;   // 14-day success rate (0-1)
    auto14: number;      // 14-day automaticity rate (0-1)
    energy: EnergyBudget;
  };
}

export interface CoachReply {
  nudge: string;                        // one sentence coaching message
  tweak?: {
    field: 'time' | 'step' | 'cue' | 'energy';
    value: string;
  };
  reflection?: string;                  // 1-2 lines for recap
}
