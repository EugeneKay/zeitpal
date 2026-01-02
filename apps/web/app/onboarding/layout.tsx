import type { ReactNode } from 'react';

import { OnboardingProvider } from '~/lib/contexts/onboarding-context';
import { requireOnboardingIncomplete } from '~/lib/server/check-onboarding';

export default async function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Redirect to /home if user already has an organization
  await requireOnboardingIncomplete();

  return <OnboardingProvider>{children}</OnboardingProvider>;
}
