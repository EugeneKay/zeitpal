'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';

import { useOnboarding } from '~/lib/contexts/onboarding-context';

import { OnboardingStepWrapper } from '../../_components/onboarding-step-wrapper';
import { StepInfoBox } from '../../_components/step-info-box';

// Common timezones for DACH region and other common locations
const TIMEZONES = [
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'Europe/Vienna', label: 'Vienna (CET/CEST)' },
  { value: 'Europe/Zurich', label: 'Zurich (CET/CEST)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Europe/Amsterdam', label: 'Amsterdam (CET/CEST)' },
  { value: 'America/New_York', label: 'New York (EST/EDT)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)' },
  { value: 'America/Chicago', label: 'Chicago (CST/CDT)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'de', label: 'Deutsch' },
];

const profileSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  timezone: z.string().min(1, 'Please select a timezone'),
  locale: z.enum(['en', 'de']),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { state, updateData, goToStep, markStepCompleted } = useOnboarding();
  const [detectedTimezone, setDetectedTimezone] = useState<string>('Europe/Berlin');

  // Detect user's timezone on mount
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setDetectedTimezone(tz);
    } catch {
      // Fallback to Berlin if detection fails
      setDetectedTimezone('Europe/Berlin');
    }
  }, []);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: state.data.displayName || '',
      timezone: state.data.timezone || detectedTimezone,
      locale: state.data.locale || 'en',
    },
  });

  // Update form when timezone is detected
  useEffect(() => {
    if (!state.data.timezone && detectedTimezone) {
      form.setValue('timezone', detectedTimezone);
    }
  }, [detectedTimezone, state.data.timezone, form]);

  const handleNext = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const values = form.getValues();
    updateData({
      displayName: values.displayName,
      timezone: values.timezone,
      locale: values.locale,
    });
    markStepCompleted('profile');
    goToStep('organization');
    router.push('/onboarding/organization');
  };

  return (
    <OnboardingStepWrapper
      title="Your Profile"
      description="Let's personalize your experience"
      showBack={true}
      prevStep="welcome"
      onNext={handleNext}
    >
      <Form {...form}>
        <form className="space-y-6">
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Max Mustermann" {...field} />
                </FormControl>
                <FormDescription>
                  How should we address you?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="timezone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Timezone</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your timezone" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  This ensures dates and times display correctly
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="locale"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Language</FormLabel>
                <div className="flex gap-3">
                  {LANGUAGES.map((lang) => (
                    <Button
                      key={lang.value}
                      type="button"
                      variant={field.value === lang.value ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => field.onChange(lang.value)}
                    >
                      {lang.label}
                    </Button>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <StepInfoBox variant="tip">
            You can change these settings anytime from your profile page.
          </StepInfoBox>
        </form>
      </Form>
    </OnboardingStepWrapper>
  );
}
