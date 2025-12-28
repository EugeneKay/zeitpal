import { redirect } from 'next/navigation';

export const runtime = 'edge';

// Main onboarding entry - redirects to the first step (welcome)
export default function OnboardingPage() {
  redirect('/onboarding/welcome');
}
