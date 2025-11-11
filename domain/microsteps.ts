/**
 * Micro-step Proposal Logic
 * Proposes tiny first steps based on energy budget and current feeling
 */

import type { EnergyBudget } from '@/lib/schemas';

export interface MicroStepOption {
  id: string;
  title: string;
  hint: string;
}

interface ProposalArgs {
  energy: EnergyBudget;
  feeling: 1 | 2 | 3 | 4 | 5;
  horizon: string;
}

/**
 * Energy copy map - explains why we start tiny
 */
export const energyCopy: Record<EnergyBudget, string> = {
  tiny: 'Energy budget: tiny - we\'ll anchor at 1-2 minutes and protect consistency.',
  small: 'Energy budget: small - we\'ll start small and build from there.',
  medium: 'Energy budget: medium - we\'ll set 5-10 minutes as your default loop.',
  big: 'Energy budget: big - longer reps, but we\'ll still keep the first step tiny.',
};

/**
 * Propose micro-steps based on energy and feeling
 * First reps are ALWAYS tiny (<=2 min) to build automaticity
 */
export function proposeMicroSteps({ energy, feeling, horizon }: ProposalArgs): MicroStepOption[] {
  const base: MicroStepOption[] = [
    {
      id: 'minute',
      title: `Do the tiniest version for 1 minute`,
      hint: `Touch ${horizon || 'it'} then stop.`,
    },
    {
      id: 'first-step',
      title: `Show up and do the first step only`,
      hint: `Set up, start, then close.`,
    },
    {
      id: 'timer-2',
      title: `Set a 2-minute timer and start`,
      hint: `Two minutes. No extra heroics.`,
    },
  ];

  // Only nudge option 3 to 3 minutes if user picked medium/big AND feeling >= 4
  if ((energy === 'medium' || energy === 'big') && feeling >= 4) {
    base[2] = {
      id: 'timer-3',
      title: 'Set a 3-minute timer and start',
      hint: 'Slightly longer reps by choice, not pressure.',
    };
  }

  return base;
}

/**
 * Get horizon-specific seed templates
 */
export function getHorizonSeeds(horizon: string): string[] {
  const templates: Record<string, string[]> = {
    sleep: [
      'Set phone to bedtime mode at 10 PM',
      'Read 2 pages before bed',
      'Do 5 minutes of gentle stretching before sleep',
    ],
    strength: [
      '5 air squats after brushing teeth',
      '10-second plank before shower',
      '1 wall pushup in the morning',
    ],
    writing: [
      'Write 1 raw sentence after lunch',
      'Capture 1 idea in notes app',
      'Free-write for 2 minutes',
    ],
    finances: [
      'Review 1 transaction per day',
      'Check account balance once',
      'Log 1 expense manually',
    ],
    learning: [
      'Read 1 page of a book',
      'Watch 1 educational video under 5 minutes',
      'Review 3 flashcards',
    ],
    creativity: [
      'Sketch 1 simple shape',
      'Take 1 photo mindfully',
      'Hum a melody for 30 seconds',
    ],
  };

  const key = horizon.toLowerCase();
  return templates[key] || proposeMicroSteps({ energy: 'small', feeling: 3, horizon }).map(opt => opt.title);
}
