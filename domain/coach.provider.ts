/**
 * Coach Provider Interface
 * Abstraction layer for AI coaching - switch between mock and real LLM
 */

import type { CoachRequest, CoachReply } from './coach.types';

export interface CoachProvider {
  suggest(req: CoachRequest): Promise<CoachReply>;
}

/**
 * Get the configured coach provider based on environment
 */
export function getCoachProvider(): CoachProvider {
  const provider = process.env.NEXT_PUBLIC_COACH_PROVIDER;

  if (provider === 'openai') {
    // Future: return new OpenAIProvider();
    throw new Error('OpenAI provider not yet implemented');
  }

  // Default to mock for safe shipping
  const { MockCoachProvider } = require('./coach.mock');
  return new MockCoachProvider();
}
