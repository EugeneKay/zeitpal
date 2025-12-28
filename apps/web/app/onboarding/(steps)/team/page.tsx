'use client';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { Users } from 'lucide-react';
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
import { cn } from '@kit/ui/utils';

import { useOnboarding } from '~/lib/contexts/onboarding-context';

import { OnboardingStepWrapper } from '../../_components/onboarding-step-wrapper';
import { StepInfoBox } from '../../_components/step-info-box';

const TEAM_COLORS = [
  { value: '#3B82F6', name: 'Blue' },
  { value: '#10B981', name: 'Green' },
  { value: '#F59E0B', name: 'Amber' },
  { value: '#EF4444', name: 'Red' },
  { value: '#8B5CF6', name: 'Purple' },
  { value: '#EC4899', name: 'Pink' },
  { value: '#6366F1', name: 'Indigo' },
  { value: '#14B8A6', name: 'Teal' },
];

const SUGGESTED_TEAMS = [
  'Engineering',
  'Marketing',
  'Sales',
  'Operations',
  'HR',
  'Finance',
  'Product',
  'Design',
  'Everyone',
];

const teamSchema = z.object({
  teamName: z.string().min(2, 'Team name must be at least 2 characters'),
  teamColor: z.string().min(1, 'Please select a color'),
});

type TeamFormData = z.infer<typeof teamSchema>;

export default function TeamPage() {
  const router = useRouter();
  const { state, updateData, goToStep, markStepCompleted } = useOnboarding();

  const form = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      teamName: state.data.teamName || '',
      teamColor: state.data.teamColor || '#3B82F6',
    },
    mode: 'onChange',
  });

  const handleNext = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const values = form.getValues();
    updateData({
      teamName: values.teamName,
      teamColor: values.teamColor,
      skipTeam: false,
    });
    markStepCompleted('team');
    goToStep('invite');
    router.push('/onboarding/invite');
  };

  const handleSkip = () => {
    updateData({
      teamName: undefined,
      teamColor: undefined,
      skipTeam: true,
    });
    markStepCompleted('team');
    goToStep('invite');
    router.push('/onboarding/invite');
  };

  const handleSuggestionClick = (name: string) => {
    form.setValue('teamName', name, { shouldValidate: true });
  };

  return (
    <OnboardingStepWrapper
      title="Create Your First Team"
      description="Teams help organize leave calendars and approvals"
      showBack={true}
      showSkip={true}
      skipLabel="Skip for now"
      prevStep="policy"
      onNext={handleNext}
      onSkip={handleSkip}
    >
      <Form {...form}>
        <form className="space-y-6">
          {/* Header icon */}
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-8 w-8 text-primary" />
            </div>
          </div>

          <FormField
            control={form.control}
            name="teamName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Team Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Engineering" {...field} />
                </FormControl>
                <FormDescription>
                  What should this team be called?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Quick suggestions */}
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_TEAMS.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => handleSuggestionClick(name)}
                className={cn(
                  'rounded-full border px-3 py-1 text-sm transition-colors',
                  form.watch('teamName') === name
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50 hover:bg-muted'
                )}
              >
                {name}
              </button>
            ))}
          </div>

          <FormField
            control={form.control}
            name="teamColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Team Color</FormLabel>
                <FormControl>
                  <div className="flex flex-wrap gap-3">
                    {TEAM_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => field.onChange(color.value)}
                        className={cn(
                          'h-10 w-10 rounded-full border-2 transition-all',
                          field.value === color.value
                            ? 'scale-110 border-foreground ring-2 ring-offset-2 ring-offset-background'
                            : 'border-transparent hover:scale-105'
                        )}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </FormControl>
                <FormDescription>
                  This color will be used in the team calendar
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <StepInfoBox variant="tip">
            You can create more teams and organize team members later in
            Settings.
          </StepInfoBox>
        </form>
      </Form>
    </OnboardingStepWrapper>
  );
}
