/**
 * First Run Redirect
 * Automatically redirects new users to onboarding
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function FirstRunRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onboardingDone = localStorage.getItem('onboarding_done') === '1';
    if (!onboardingDone) {
      router.replace('/onboarding');
    }
  }, [router]);

  return null;
}
