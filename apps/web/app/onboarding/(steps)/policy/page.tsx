'use client';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, Settings2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Checkbox } from '@kit/ui/checkbox';
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
import { COUNTRIES, type CountryCode } from '~/lib/types';

import { OnboardingStepWrapper } from '../../_components/onboarding-step-wrapper';
import { StepInfoBox } from '../../_components/step-info-box';

const CARRYOVER_EXPIRY_OPTIONS = [
  { value: '03-31', label: 'March 31' },
  { value: '06-30', label: 'June 30' },
  { value: '12-31', label: 'December 31' },
];

const policySchema = z.object({
  defaultVacationDays: z.coerce
    .number()
    .min(1, 'Must be at least 1 day')
    .max(60, 'Maximum 60 days'),
  carryoverEnabled: z.boolean(),
  carryoverMaxDays: z.coerce.number().min(0).max(30).optional(),
  carryoverExpiryDate: z.string().optional(),
});

type PolicyFormData = z.infer<typeof policySchema>;

export default function PolicyPage() {
  const router = useRouter();
  const { state, updateData, goToStep, markStepCompleted } = useOnboarding();

  const selectedCountry = state.data.country as CountryCode | undefined;
  const countryConfig = COUNTRIES.find((c) => c.code === selectedCountry);
  const minLeaveDays = countryConfig?.minLeaveDays ?? 20;

  const form = useForm<PolicyFormData>({
    resolver: zodResolver(
      policySchema.refine(
        (data) => data.defaultVacationDays >= minLeaveDays,
        {
          message: `Minimum ${minLeaveDays} days required by law`,
          path: ['defaultVacationDays'],
        }
      )
    ),
    defaultValues: {
      defaultVacationDays: state.data.defaultVacationDays ?? 30,
      carryoverEnabled: state.data.carryoverEnabled ?? true,
      carryoverMaxDays: state.data.carryoverMaxDays ?? 5,
      carryoverExpiryDate: '03-31',
    },
    mode: 'onChange',
  });

  const carryoverEnabled = form.watch('carryoverEnabled');

  const handleNext = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;

    const values = form.getValues();

    // Validate minimum leave days based on country
    if (minLeaveDays && values.defaultVacationDays < minLeaveDays) {
      form.setError('defaultVacationDays', {
        message: `Minimum ${minLeaveDays} days required by ${countryConfig?.nameEn} law`,
      });
      return;
    }

    updateData({
      defaultVacationDays: values.defaultVacationDays,
      carryoverEnabled: values.carryoverEnabled,
      carryoverMaxDays: values.carryoverMaxDays,
    });
    markStepCompleted('policy');
    goToStep('team');
    router.push('/onboarding/team');
  };

  return (
    <OnboardingStepWrapper
      title="Leave Policy"
      description="Set your organization's default leave policy"
      showBack={true}
      prevStep="location"
      onNext={handleNext}
    >
      <Form {...form}>
        <form className="space-y-6">
          {/* Header icon */}
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </div>

          <FormField
            control={form.control}
            name="defaultVacationDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Annual Vacation Days (Default)</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      className="w-24"
                      min={minLeaveDays}
                      max={60}
                      {...field}
                    />
                    <span className="text-muted-foreground">days per year</span>
                  </div>
                </FormControl>
                <FormDescription>
                  {minLeaveDays
                    ? `Minimum ${minLeaveDays} days required. You can customize per employee later.`
                    : 'This is the default for new employees. You can customize per employee later.'}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="carryoverEnabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Allow Leave Carryover</FormLabel>
                  <FormDescription>
                    Employees can carry over unused vacation days to the next year
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          {carryoverEnabled && (
            <div className="grid gap-4 rounded-lg border bg-muted/30 p-4">
              <FormField
                control={form.control}
                name="carryoverMaxDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Carryover Days</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-3">
                        <Input
                          type="number"
                          className="w-24"
                          min={0}
                          max={30}
                          {...field}
                        />
                        <span className="text-muted-foreground">days</span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="carryoverExpiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carryover Expires On</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CARRYOVER_EXPIRY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {selectedCountry === 'DE'
                        ? 'March 31 is the standard in Germany'
                        : 'When carried over days expire'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <StepInfoBox variant="tip">
            <div className="flex items-start gap-2">
              <Settings2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>
                You can configure additional settings later: sick leave
                requirements, approval workflows, and custom leave types.
              </span>
            </div>
          </StepInfoBox>
        </form>
      </Form>
    </OnboardingStepWrapper>
  );
}
