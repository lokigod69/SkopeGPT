/**
 * Mock Coach Provider
 * Rule-based coaching that ships today while LLM is "future problem"
 */

import type { CoachProvider } from './coach.provider';
import type { CoachRequest, CoachReply } from './coach.types';

export class MockCoachProvider implements CoachProvider {
  async suggest(req: CoachRequest): Promise<CoachReply> {
    const { metrics, seed, history, preset } = req;

    // Rule 1: High success (>=70%) - nudge to step up 10-15%
    if (metrics.success14 >= 0.7) {
      return {
        nudge: this.getCopy(preset, 'step-up'),
        tweak: { field: 'step', value: seed.description },
        reflection: 'Seven consistent days. Time to nudge forward.',
      };
    }

    // Rule 2: Tiny energy - protect the streak
    if (metrics.energy === 'tiny') {
      return {
        nudge: this.getCopy(preset, 'protect-streak'),
        tweak: { field: 'time', value: '1-2 min' },
      };
    }

    // Rule 3: High skip rate - check the cue
    const recentSkips = history.slice(-7).filter(h => h.outcome === 'skipped').length;
    if (recentSkips >= 4) {
      return {
        nudge: this.getCopy(preset, 'fix-cue'),
        tweak: { field: 'cue', value: seed.if_window ?? 'after breakfast' },
        reflection: 'Timing might be the issue. When do you feel most ready?',
      };
    }

    // Default: keep going
    return {
      nudge: this.getCopy(preset, 'keep-going'),
    };
  }

  private getCopy(preset: string, situation: string): string {
    const copies: Record<string, Record<string, string>> = {
      'step-up': {
        drill: 'Keep it tiny and consistent. +10% next week?',
        socratic: 'What would a 10% increase look like for you?',
        compassionate: 'You are building momentum. Ready to nudge it forward?',
        engineer: 'Success rate: strong. Suggest: increment by 10-15%.',
      },
      'protect-streak': {
        drill: 'Protect the streak: 60 seconds then stop.',
        socratic: 'What is the absolute minimum that counts as showing up?',
        compassionate: 'Just touch it for 60 seconds. That is enough.',
        engineer: 'Energy budget: tiny. Optimizing for consistency over volume.',
      },
      'fix-cue': {
        drill: 'Move the cue to a reliable window.',
        socratic: 'When in your day do you have the most energy?',
        compassionate: 'Let us find a time that works with your rhythm.',
        engineer: 'Skip pattern detected. Suggest: anchor to stable trigger.',
      },
      'keep-going': {
        drill: 'One more rep. Build the loop.',
        socratic: 'What is working? What needs adjusting?',
        compassionate: 'You are showing up. That matters.',
        engineer: 'Continue current parameters. Monitor for adaptation signals.',
      },
    };

    return copies[situation]?.[preset] || copies[situation]?.['compassionate'] || 'Keep going.';
  }
}
