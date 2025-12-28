'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Plus, Trash2, UserPlus } from 'lucide-react';
import { useFieldArray, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@kit/ui/button';
import {
  Form,
  FormControl,
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
import type { MemberRole } from '~/lib/types';

import { OnboardingStepWrapper } from '../../_components/onboarding-step-wrapper';
import { StepInfoBox } from '../../_components/step-info-box';

const ROLES: Array<{ value: MemberRole; label: string; description: string }> = [
  {
    value: 'employee',
    label: 'Employee',
    description: 'Can request leave and view own balance',
  },
  {
    value: 'manager',
    label: 'Manager',
    description: 'Can approve team requests',
  },
  {
    value: 'hr',
    label: 'HR',
    description: 'Can manage all leave and balances',
  },
  {
    value: 'admin',
    label: 'Admin',
    description: 'Full access including settings',
  },
];

const inviteSchema = z.object({
  invites: z.array(
    z.object({
      email: z.string().email('Please enter a valid email'),
      role: z.enum(['admin', 'manager', 'hr', 'employee']),
    })
  ),
});

type InviteFormData = z.infer<typeof inviteSchema>;

export default function InvitePage() {
  const router = useRouter();
  const { state, updateData, goToStep, markStepCompleted } = useOnboarding();
  const [showRoleInfo, setShowRoleInfo] = useState(false);

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      invites: state.data.invites?.length
        ? state.data.invites
        : [{ email: '', role: 'employee' }],
    },
    mode: 'onBlur',
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'invites',
  });

  const handleNext = async () => {
    // Filter out empty emails before validation
    const currentInvites = form.getValues('invites');
    const nonEmptyInvites = currentInvites.filter(
      (invite) => invite.email.trim() !== ''
    );

    if (nonEmptyInvites.length > 0) {
      // Only validate if there are emails to validate
      const isValid = await form.trigger();
      if (!isValid) return;
    }

    updateData({
      invites: nonEmptyInvites,
      skipInvites: nonEmptyInvites.length === 0,
    });
    markStepCompleted('invite');
    goToStep('complete');
    router.push('/onboarding/complete');
  };

  const handleSkip = () => {
    updateData({
      invites: [],
      skipInvites: true,
    });
    markStepCompleted('invite');
    goToStep('complete');
    router.push('/onboarding/complete');
  };

  const addInvite = () => {
    append({ email: '', role: 'employee' });
  };

  return (
    <OnboardingStepWrapper
      title="Invite Team Members"
      description="Invite your colleagues to join your organization"
      showBack={true}
      showSkip={true}
      skipLabel="Skip for now"
      nextLabel={fields.some((f) => form.watch(`invites.${fields.indexOf(f)}.email`)) ? 'Continue' : 'Skip & Continue'}
      prevStep="team"
      onNext={handleNext}
      onSkip={handleSkip}
    >
      <Form {...form}>
        <form className="space-y-6">
          {/* Header icon */}
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <UserPlus className="h-8 w-8 text-primary" />
            </div>
          </div>

          {/* Invite list */}
          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-2">
                <FormField
                  control={form.control}
                  name={`invites.${index}.email`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      {index === 0 && <FormLabel>Email</FormLabel>}
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="colleague@company.com"
                            className="pl-9"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`invites.${index}.role`}
                  render={({ field }) => (
                    <FormItem className="w-36">
                      {index === 0 && <FormLabel>Role</FormLabel>}
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ROLES.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    className={index === 0 ? 'mt-8' : ''}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={addInvite}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Another
          </Button>

          {/* Role explanations */}
          <div className="rounded-lg border bg-muted/30 p-4">
            <button
              type="button"
              onClick={() => setShowRoleInfo(!showRoleInfo)}
              className="flex w-full items-center justify-between text-sm font-medium"
            >
              <span>Role Permissions</span>
              <span className="text-muted-foreground">
                {showRoleInfo ? 'Hide' : 'Show'}
              </span>
            </button>

            {showRoleInfo && (
              <ul className="mt-3 space-y-2 text-sm">
                {ROLES.map((role) => (
                  <li key={role.value} className="flex items-start gap-2">
                    <span className="font-medium text-foreground">
                      {role.label}:
                    </span>
                    <span className="text-muted-foreground">
                      {role.description}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <StepInfoBox variant="info">
            Invitees will receive an email with a link to join your
            organization. You can invite more team members anytime.
          </StepInfoBox>
        </form>
      </Form>
    </OnboardingStepWrapper>
  );
}
