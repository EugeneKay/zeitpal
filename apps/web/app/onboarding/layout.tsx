import type { ReactNode } from 'react';

import { OnboardingProvider } from '~/lib/contexts/onboarding-context';


export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return <OnboardingProvider>{children}</OnboardingProvider>;
}
