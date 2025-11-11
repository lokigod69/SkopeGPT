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
import { useOnboarding } from '@/domain/onboarding.store';
import { completeOnboarding } from '@/domain/onboarding.actions';

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const reset = useOnboarding((s) => s.reset);

  const nextStep = async () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding - create goal, seed, and integration state
      const state = useOnboarding.getState();

      try {
        await completeOnboarding({
          horizon: state.horizon,
          energy: state.energy,
          coachPreset: state.coachPreset,
          seedDescription: state.selectedSeed,
          // seedMinutes will be parsed from description
        });

        // Set flag and redirect to /today
        if (typeof window !== 'undefined') {
          localStorage.setItem('onboarding_done', '1');
        }
        reset(); // Clear store for next time
        router.push('/today');
      } catch (error) {
        console.error('Failed to complete onboarding:', error);
        // TODO: Show error toast to user
      }
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
            <HorizonStep onNext={nextStep} />
          )}

          {currentStep === 2 && (
            <EnergyStep
              onNext={nextStep}
              onBack={prevStep}
            />
          )}

          {currentStep === 3 && (
            <CoachStep
              onNext={nextStep}
              onBack={prevStep}
            />
          )}

          {currentStep === 4 && (
            <SoilSeedStep
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
