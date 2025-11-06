/**
 * Coach Copy Template System
 *
 * Four distinct personas with different tones, pacing, and nudge styles
 * All coaches use the SAME state machine - they only differ in communication
 *
 * Personas:
 * - Drill Sergeant: Direct, time-bound, consequence framing
 * - Socratic Mentor: Questions, reflection, autonomy
 * - Compassionate Guide: Warmth, acceptance, gentle nudges
 * - Pragmatic Engineer: Checklists, heuristics, measurement
 */

import type { CoachPreset, SkipReason, Seed } from '@/lib/schemas';

// ============================================================================
// Types
// ============================================================================

export interface CoachCopy {
  start: string;           // When daily card appears
  complete: string;        // After logging done
  skip: string;            // After marking can't do
  stepUp: string;          // When suggesting difficulty increase
  holdSteady: string;      // When maintaining current level
  integrationCheck: string; // When checking if automatic
  baseline: string;        // When promoted to baseline
  recap: string;           // Weekly recap message
}

export interface CoachConfig {
  preset: CoachPreset;
  displayName: string;
  description: string;
  icon: string;
  stepUpPace: 'fast' | 'medium' | 'slow'; // How quickly to suggest increases
}

// ============================================================================
// Coach Configurations
// ============================================================================

export const COACH_CONFIGS: Record<CoachPreset, CoachConfig> = {
  drill: {
    preset: 'drill',
    displayName: 'Drill Sergeant',
    description: 'Direct, time-bound, consequence framing',
    icon: '🎯',
    stepUpPace: 'fast',
  },
  socratic: {
    preset: 'socratic',
    displayName: 'Socratic Mentor',
    description: 'Questions, reflection, autonomy',
    icon: '🤔',
    stepUpPace: 'slow',
  },
  compassionate: {
    preset: 'compassionate',
    displayName: 'Compassionate Guide',
    description: 'Warmth, acceptance, gentle nudges',
    icon: '💚',
    stepUpPace: 'medium',
  },
  engineer: {
    preset: 'engineer',
    displayName: 'Pragmatic Engineer',
    description: 'Checklists, heuristics, measurement',
    icon: '⚙️',
    stepUpPace: 'fast',
  },
};

// ============================================================================
// Coach Copy Templates
// ============================================================================

const DRILL_COPY: CoachCopy = {
  start: '90 seconds. Go.',
  complete: 'Done. Now do it again tomorrow.',
  skip: 'We adjust the plan, not the person. Mark the block and move.',
  stepUp: 'Trajectory\'s up. Step +10% or hold steady?',
  holdSteady: 'Hold the line. Consistency builds capacity.',
  integrationCheck: 'Is this automatic yet, or still requires effort?',
  baseline: 'Banked. This is who you are now.',
  recap: 'Week complete. Data shows progress. Maintain tempo.',
};

const SOCRATIC_COPY: CoachCopy = {
  start: 'What\'s the one line worth catching today?',
  complete: 'How did that feel?',
  skip: 'Which friction showed up: timing, energy, difficulty, or memory?',
  stepUp: 'What would 10% more look like for you?',
  holdSteady: 'What\'s the benefit of keeping this steady for now?',
  integrationCheck: 'What felt automatic this week?',
  baseline: 'Notice how this has become part of your rhythm?',
  recap: 'What patterns do you notice in your week?',
};

const COMPASSIONATE_COPY: CoachCopy = {
  start: 'One gentle step. Then rest.',
  complete: 'You showed up. That\'s everything.',
  skip: 'Your energy matters. Let\'s earn a recovery credit.',
  stepUp: 'You\'re ready for a bit more, if it feels right.',
  holdSteady: 'This pace honors where you are.',
  integrationCheck: 'Has this started to feel like home?',
  baseline: 'Look at what you\'ve built. It\'s beautiful.',
  recap: 'Notice the small ways you kept faith this week.',
};

const ENGINEER_COPY: CoachCopy = {
  start: 'Timer primed. Log auto-saves.',
  complete: 'Logged. +1 to streak counter.',
  skip: 'Constraint detected. Rewriting schedule window.',
  stepUp: 'Slope positive. Propose 10% increase.',
  holdSteady: 'Maintaining current throughput. Stability phase.',
  integrationCheck: 'Automation threshold: current vs. target state?',
  baseline: 'Baseline locked. Resource freed for next optimization.',
  recap: 'Weekly metrics: Success rate, friction distribution, trend analysis.',
};

// Map of all coach copy
const COACH_COPY_MAP: Record<CoachPreset, CoachCopy> = {
  drill: DRILL_COPY,
  socratic: SOCRATIC_COPY,
  compassionate: COMPASSIONATE_COPY,
  engineer: ENGINEER_COPY,
};

// ============================================================================
// Public API
// ============================================================================

/**
 * Get coach copy for a specific moment
 */
export function getCoachCopy(
  preset: CoachPreset,
  moment: keyof CoachCopy
): string {
  return COACH_COPY_MAP[preset][moment];
}

/**
 * Get complete copy set for a coach
 */
export function getCoachCopySet(preset: CoachPreset): CoachCopy {
  return COACH_COPY_MAP[preset];
}

/**
 * Get coach configuration
 */
export function getCoachConfig(preset: CoachPreset): CoachConfig {
  return COACH_CONFIGS[preset];
}

/**
 * Get all available coaches
 */
export function getAllCoaches(): CoachConfig[] {
  return Object.values(COACH_CONFIGS);
}

/**
 * Generate contextual nudge based on skip reason
 */
export function getSkipNudge(preset: CoachPreset, reason: SkipReason): string {
  const nudges: Record<CoachPreset, Record<SkipReason, string>> = {
    drill: {
      too_hard: 'Step down. Rebuild from lower baseline.',
      bad_timing: 'Timing conflict. Reschedule window.',
      low_energy: 'Energy deficit. Insert recovery protocol.',
      forgot: 'Memory failure. Add visual trigger.',
    },
    socratic: {
      too_hard: 'What would make this feel easier?',
      bad_timing: 'When would this fit more naturally?',
      low_energy: 'What small thing would build your energy first?',
      forgot: 'What reminder would catch your attention?',
    },
    compassionate: {
      too_hard: 'Let\'s make this gentler. You matter more than the goal.',
      bad_timing: 'There\'s a better time waiting. Let\'s find it together.',
      low_energy: 'Rest comes first. Try a 2-minute walk to prime the pump.',
      forgot: 'We all forget. Let\'s add a loving reminder.',
    },
    engineer: {
      too_hard: 'Difficulty threshold exceeded. Reducing complexity by 30%.',
      bad_timing: 'Schedule conflict detected. Proposing alternative slots.',
      low_energy: 'Low battery state. Suggesting energy recovery subroutine.',
      forgot: 'Context switch failure. Adding environmental trigger.',
    },
  };

  return nudges[preset][reason];
}

/**
 * Get welcome message for onboarding
 */
export function getWelcomeMessage(preset: CoachPreset): string {
  const welcomes: Record<CoachPreset, string> = {
    drill: 'Ready to build discipline? We start small, we move fast, we don\'t quit.',
    socratic: 'What brings you here today? Let\'s discover what matters most.',
    compassionate: 'Welcome. You\'re safe here. We\'ll build this together, at your pace.',
    engineer: 'Initializing behavioral optimization system. Define target state.',
  };

  return welcomes[preset];
}

/**
 * Get step-up proposal message with seed details
 */
export function getStepUpProposal(
  preset: CoachPreset,
  currentSeed: Seed,
  proposedMinutes: number
): string {
  const templates: Record<CoachPreset, string> = {
    drill: `You're crushing ${currentSeed.minutes} min. Time for ${proposedMinutes} min. Accept mission?`,
    socratic: `You've been steady at ${currentSeed.minutes} min. What would ${proposedMinutes} min feel like?`,
    compassionate: `You've grown so much at ${currentSeed.minutes} min. Ready to try ${proposedMinutes} min when it feels right?`,
    engineer: `Current: ${currentSeed.minutes} min. Proposed: ${proposedMinutes} min (+${proposedMinutes - currentSeed.minutes}). Deploy upgrade?`,
  };

  return templates[preset];
}

// ============================================================================
// Exports
// ============================================================================

export const CoachSystem = {
  getCoachCopy,
  getCoachCopySet,
  getCoachConfig,
  getAllCoaches,
  getSkipNudge,
  getWelcomeMessage,
  getStepUpProposal,
  COACH_CONFIGS,
};
