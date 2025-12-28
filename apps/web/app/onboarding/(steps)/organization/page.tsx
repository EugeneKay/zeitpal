'use client';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { Building2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

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

import { useOnboarding } from '~/lib/contexts/onboarding-context';

import { OnboardingStepWrapper } from '../../_components/onboarding-step-wrapper';
import { StepInfoBox } from '../../_components/step-info-box';

const organizationSchema = z.object({
  organizationName: z.string().min(2, 'Name must be at least 2 characters'),
  organizationSlug: z
    .string()
    .min(2, 'URL must be at least 2 characters')
    .max(50, 'URL must be at most 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

export default function OrganizationPage() {
  const router = useRouter();
  const { state, updateData, goToStep, markStepCompleted } = useOnboarding();

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      organizationName: state.data.organizationName || '',
      organizationSlug: state.data.organizationSlug || '',
    },
    mode: 'onChange',
  });

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    form.setValue('organizationName', value);
    // Only auto-generate if user hasn't manually edited the slug
    const currentSlug = form.getValues('organizationSlug');
    const previousName = state.data.organizationName || '';
    const expectedSlug = previousName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    if (!currentSlug || currentSlug === expectedSlug) {
      const newSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      form.setValue('organizationSlug', newSlug, { shouldValidate: true });
    }
  };

  const handleNext = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const values = form.getValues();
    updateData({
      organizationName: values.organizationName,
      organizationSlug: values.organizationSlug,
    });
    markStepCompleted('organization');
    goToStep('location');
    router.push('/onboarding/location');
  };

  return (
    <OnboardingStepWrapper
      title="Name Your Organization"
      description="This is your company's workspace in ZeitPal"
      showBack={true}
      prevStep="profile"
      onNext={handleNext}
    >
      <Form {...form}>
        <form className="space-y-6">
          {/* Header icon */}
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </div>

          <FormField
            control={form.control}
            name="organizationName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Acme GmbH"
                    {...field}
                    onChange={(e) => handleNameChange(e.target.value)}
                  />
                </FormControl>
                <FormDescription>
                  Your company or team name
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="organizationSlug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Unique URL</FormLabel>
                <FormControl>
                  <div className="flex items-center">
                    <span className="inline-flex h-10 items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">
                      zeitpal.de/
                    </span>
                    <Input
                      placeholder="acme-gmbh"
                      className="rounded-l-none"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Share this link with your team members to join
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <StepInfoBox variant="info">
            Your organization name and URL can be changed later in settings.
          </StepInfoBox>
        </form>
      </Form>
    </OnboardingStepWrapper>
  );
}
