/**
 * Onboarding State Store
 * Centralized state for the 4-step onboarding flow
 */

import { create } from 'zustand';
import type { EnergyBudget, CoachPreset } from '@/lib/schemas';

interface OnboardingState {
  // Step 1: Horizon
  horizon: string;
  setHorizon: (horizon: string) => void;

  // Step 2: Energy Budget
  energy: EnergyBudget;
  setEnergy: (energy: EnergyBudget) => void;

  // Step 3: Coach Preset
  coachPreset: CoachPreset;
  setCoachPreset: (preset: CoachPreset) => void;

  // Step 4: Soil & Seed
  soilRating: 1 | 2 | 3 | 4 | 5;
  setSoilRating: (rating: 1 | 2 | 3 | 4 | 5) => void;
  selectedSeed: string;
  setSelectedSeed: (seed: string) => void;

  // Reset on completion
  reset: () => void;
}

const initialState = {
  horizon: '',
  energy: 'small' as EnergyBudget,
  coachPreset: 'compassionate' as CoachPreset,
  soilRating: 3 as 1 | 2 | 3 | 4 | 5,
  selectedSeed: '',
};

export const useOnboarding = create<OnboardingState>((set) => ({
  ...initialState,

  setHorizon: (horizon) => set({ horizon }),
  setEnergy: (energy) => set({ energy }),
  setCoachPreset: (coachPreset) => set({ coachPreset }),
  setSoilRating: (soilRating) => set({ soilRating }),
  setSelectedSeed: (selectedSeed) => set({ selectedSeed }),

  reset: () => set(initialState),
}));
