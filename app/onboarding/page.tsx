/**
 * Onboarding Flow
 *
 * 4-step process completing in ≤60 seconds:
 * 1. Horizon - What do you care about?
 * 2. Energy Budget - How much can you give daily?
 * 3. Coach Lens - Pick your coaching style
 * 4. Soil/Seed - Where are you now + first micro-step
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HorizonStep } from '@/components/features/onboarding/HorizonStep';
import { EnergyStep } from '@/components/features/onboarding/EnergyStep';
import { CoachStep } from '@/components/features/onboarding/CoachStep';
import { SoilSeedStep } from '@/components/features/onboarding/SoilSeedStep';
import type { CoachPreset, EnergyBudget } from '@/lib/schemas';

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState({
    horizon: '',
    energyBudget: 'small' as EnergyBudget,
    coachPreset: 'compassionate' as CoachPreset,
    soilRating: 3,
    selectedSeed: '',
  });

  const updateData = (data: Partial<typeof onboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding - redirect to home
      router.push('/');
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 texture-grain">
      <div className="max-w-md w-full space-y-6 animate-prompt">
        {/* Progress indicator */}
        <div className="flex items-center justify-center space-x-2">
          {[1, 2, 3, 4].map(step => (
            <div
              key={step}
              className={`h-1.5 rounded-full transition-all ${
                step === currentStep
                  ? 'w-8 bg-primary'
                  : step < currentStep
                  ? 'w-6 bg-primary/60'
                  : 'w-4 bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="animate-slide-up">
          {currentStep === 1 && (
            <HorizonStep
              value={onboardingData.horizon}
              onChange={horizon => updateData({ horizon })}
              onNext={nextStep}
            />
          )}

          {currentStep === 2 && (
            <EnergyStep
              value={onboardingData.energyBudget}
              onChange={energyBudget => updateData({ energyBudget })}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}

          {currentStep === 3 && (
            <CoachStep
              value={onboardingData.coachPreset}
              onChange={coachPreset => updateData({ coachPreset })}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}

          {currentStep === 4 && (
            <SoilSeedStep
              horizon={onboardingData.horizon}
              energyBudget={onboardingData.energyBudget}
              coachPreset={onboardingData.coachPreset}
              soilRating={onboardingData.soilRating}
              onSoilRatingChange={soilRating => updateData({ soilRating })}
              selectedSeed={onboardingData.selectedSeed}
              onSeedSelect={selectedSeed => updateData({ selectedSeed })}
              onComplete={nextStep}
              onBack={prevStep}
            />
          )}
        </div>

        {/* Step indicator text */}
        <p className="text-center text-xs text-muted-foreground">
          Step {currentStep} of 4
        </p>
      </div>
    </main>
  );
}
