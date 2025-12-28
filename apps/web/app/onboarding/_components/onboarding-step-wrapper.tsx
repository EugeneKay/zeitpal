'use client';

import { useRouter } from 'next/navigation';
import { type ReactNode } from 'react';

import { ChevronLeft, ChevronRight, Loader2, SkipForward } from 'lucide-react';

import { Button } from '@kit/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@kit/ui/card';

import { useOnboarding } from '~/lib/contexts/onboarding-context';
import type { OnboardingStep } from '~/lib/types';

import { OnboardingProgress } from './onboarding-progress';

interface OnboardingStepWrapperProps {
  children: ReactNode;
  title: string;
  description?: string;
  showBack?: boolean;
  showSkip?: boolean;
  skipLabel?: string;
  nextLabel?: string;
  isLoading?: boolean;
  isNextDisabled?: boolean;
  onNext?: () => void | Promise<void>;
  onSkip?: () => void;
  nextStep?: OnboardingStep;
  prevStep?: OnboardingStep;
}

export function OnboardingStepWrapper({
  children,
  title,
  description,
  showBack = true,
  showSkip = false,
  skipLabel = 'Skip for now',
  nextLabel = 'Continue',
  isLoading = false,
  isNextDisabled = false,
  onNext,
  onSkip,
  nextStep,
  prevStep,
}: OnboardingStepWrapperProps) {
  const router = useRouter();
  const { goToStep, goToNextStep, goToPreviousStep, isFirstStep } =
    useOnboarding();

  const handleBack = () => {
    if (prevStep) {
      goToStep(prevStep);
      router.push(`/onboarding/${prevStep === 'welcome' ? '' : prevStep}`);
    } else {
      goToPreviousStep();
      router.back();
    }
  };

  const handleNext = async () => {
    if (onNext) {
      await onNext();
    }
    if (nextStep) {
      goToStep(nextStep);
      router.push(`/onboarding/${nextStep}`);
    } else {
      goToNextStep();
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    }
    if (nextStep) {
      goToStep(nextStep);
      router.push(`/onboarding/${nextStep}`);
    } else {
      goToNextStep();
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-4">
          <OnboardingProgress />
          <div className="pt-2 text-center">
            <CardTitle className="text-2xl">{title}</CardTitle>
            {description && (
              <CardDescription className="mt-2">{description}</CardDescription>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {children}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-4">
            {showBack && !isFirstStep ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isLoading}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              {showSkip && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleSkip}
                  disabled={isLoading}
                  className="text-muted-foreground"
                >
                  <SkipForward className="mr-1 h-4 w-4" />
                  {skipLabel}
                </Button>
              )}

              <Button
                type="button"
                onClick={handleNext}
                disabled={isNextDisabled || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait...
                  </>
                ) : (
                  <>
                    {nextLabel}
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
