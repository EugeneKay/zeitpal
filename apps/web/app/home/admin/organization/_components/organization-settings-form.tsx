'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@kit/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
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
import { Separator } from '@kit/ui/separator';
import { Switch } from '@kit/ui/switch';
import { Trans } from '@kit/ui/trans';

import { BUNDESLAND_NAMES, type Bundesland } from '~/lib/types';

const bundeslandOptions = Object.entries(BUNDESLAND_NAMES) as [Bundesland, { en: string; de: string }][];

const organizationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
  bundesland: z.string().min(1, 'Please select a federal state'),
  defaultVacationDays: z.coerce.number().min(20).max(50),
  carryoverEnabled: z.boolean(),
  carryoverMaxDays: z.coerce.number().min(0).max(30),
  sickLeaveAuThreshold: z.coerce.number().min(1).max(7),
  requireApproval: z.boolean(),
  autoApproveThreshold: z.coerce.number().min(0).max(10).nullable(),
});

type OrganizationFormData = z.infer<typeof organizationSchema>;

// Mock data - will be replaced with React Query
const mockOrganization = {
  name: 'Acme Corp',
  slug: 'acme-corp',
  bundesland: 'BY' as Bundesland,
  defaultVacationDays: 30,
  carryoverEnabled: true,
  carryoverMaxDays: 5,
  sickLeaveAuThreshold: 3,
  requireApproval: true,
  autoApproveThreshold: null,
};

export function OrganizationSettingsForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OrganizationFormData>({
    resolver: zodResolver(organizationSchema),
    defaultValues: mockOrganization,
  });

  const carryoverEnabled = form.watch('carryoverEnabled');
  const requireApproval = form.watch('requireApproval');

  const onSubmit = async (data: OrganizationFormData) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement API call
      console.log('Saving organization settings:', data);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('Organization settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              General organization settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="admin:organization.name" />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="admin:organization.slug" />
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    Used in URLs: zeitpal.de/{field.value}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bundesland"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="admin:organization.bundesland" />
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select federal state" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {bundeslandOptions.map(([code, names]) => (
                        <SelectItem key={code} value={code}>
                          {names.de} ({names.en})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Determines which public holidays apply to your organization
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Leave Policy */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Trans i18nKey="admin:policies.title" />
            </CardTitle>
            <CardDescription>
              Configure default leave entitlements and rules
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="defaultVacationDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="admin:policies.defaultVacationDays" />
                  </FormLabel>
                  <FormControl>
                    <Input type="number" {...field} className="w-24" />
                  </FormControl>
                  <FormDescription>
                    <Trans i18nKey="admin:policies.defaultVacationDaysHelp" />
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <FormField
              control={form.control}
              name="carryoverEnabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      <Trans i18nKey="admin:policies.carryoverEnabled" />
                    </FormLabel>
                    <FormDescription>
                      Allow unused vacation days to carry over to the next year
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {carryoverEnabled && (
              <FormField
                control={form.control}
                name="carryoverMaxDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Trans i18nKey="admin:policies.carryoverMaxDays" />
                    </FormLabel>
                    <FormControl>
                      <Input type="number" {...field} className="w-24" />
                    </FormControl>
                    <FormDescription>
                      Maximum days that can be carried over (German law: typically expires March 31)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Separator />

            <FormField
              control={form.control}
              name="sickLeaveAuThreshold"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="admin:policies.auThreshold" />
                  </FormLabel>
                  <FormControl>
                    <Input type="number" {...field} className="w-24" />
                  </FormControl>
                  <FormDescription>
                    <Trans i18nKey="admin:policies.auThresholdHelp" />
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Approval Settings */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Trans i18nKey="admin:policies.approval" />
            </CardTitle>
            <CardDescription>
              Configure approval workflow settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="requireApproval"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      <Trans i18nKey="admin:policies.requireApproval" />
                    </FormLabel>
                    <FormDescription>
                      Require manager approval for leave requests
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {requireApproval && (
              <FormField
                control={form.control}
                name="autoApproveThreshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <Trans i18nKey="admin:policies.autoApproveThreshold" />
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(e.target.value ? Number(e.target.value) : null)
                        }
                        className="w-24"
                        placeholder="0"
                      />
                    </FormControl>
                    <FormDescription>
                      <Trans i18nKey="admin:policies.autoApproveHelp" />
                      {' '}Leave empty to require approval for all requests.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : <Trans i18nKey="admin:organization.save" />}
          </Button>
        </div>
      </form>
    </Form>
  );
}
