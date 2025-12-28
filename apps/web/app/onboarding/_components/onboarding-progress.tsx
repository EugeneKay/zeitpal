'use client';

import { Check } from 'lucide-react';

import { cn } from '@kit/ui/utils';

import { useOnboarding } from '~/lib/contexts/onboarding-context';
import { ONBOARDING_STEPS, type OnboardingStep } from '~/lib/types';

const STEP_LABELS: Record<OnboardingStep, { en: string; de: string }> = {
  welcome: { en: 'Welcome', de: 'Willkommen' },
  profile: { en: 'Profile', de: 'Profil' },
  organization: { en: 'Organization', de: 'Organisation' },
  location: { en: 'Location', de: 'Standort' },
  policy: { en: 'Policy', de: 'Richtlinie' },
  team: { en: 'Team', de: 'Team' },
  invite: { en: 'Invite', de: 'Einladen' },
  complete: { en: 'Done', de: 'Fertig' },
};

interface OnboardingProgressProps {
  locale?: 'en' | 'de';
  showLabels?: boolean;
}

export function OnboardingProgress({
  locale = 'en',
  showLabels = false,
}: OnboardingProgressProps) {
  const { currentStepIndex, completedSteps, progress } = useOnboarding();

  return (
    <div className="w-full">
      {/* Progress bar */}
      <div className="bg-muted relative h-2 w-full overflow-hidden rounded-full">
        <div
          className="bg-primary absolute left-0 top-0 h-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step indicators (optional) */}
      {showLabels && (
        <div className="mt-4 flex justify-between">
          {ONBOARDING_STEPS.map((step, index) => {
            const isCompleted = completedSteps.includes(step);
            const isCurrent = index === currentStepIndex;
            const isPast = index < currentStepIndex;

            return (
              <div key={step} className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-medium transition-colors',
                    isCompleted || isPast
                      ? 'border-primary bg-primary text-primary-foreground'
                      : isCurrent
                        ? 'border-primary text-primary'
                        : 'border-muted-foreground/30 text-muted-foreground'
                  )}
                >
                  {isCompleted || isPast ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={cn(
                    'mt-1 text-xs',
                    isCurrent
                      ? 'text-foreground font-medium'
                      : 'text-muted-foreground'
                  )}
                >
                  {STEP_LABELS[step][locale]}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function OnboardingProgressCompact() {
  const { currentStepIndex, totalSteps } = useOnboarding();

  return (
    <span className="text-muted-foreground text-sm">
      Step {currentStepIndex + 1} of {totalSteps}
    </span>
  );
}
