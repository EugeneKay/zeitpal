'use client';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@kit/ui/button';
import { Calendar } from '@kit/ui/calendar';
import { Card, CardContent } from '@kit/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@kit/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@kit/ui/popover';
import { RadioGroup, RadioGroupItem } from '@kit/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@kit/ui/select';
import { Skeleton } from '@kit/ui/skeleton';
import { Textarea } from '@kit/ui/textarea';
import { Trans } from '@kit/ui/trans';
import { cn } from '@kit/ui/utils';

import pathsConfig from '~/config/paths.config';
import { useLeaveTypes, useHolidays, useCreateLeaveRequest } from '~/lib/hooks';
import { calculateWorkDays } from '~/lib/utils/leave-calculations';

const formSchema = z.object({
  leaveTypeId: z.string().min(1, 'Please select a leave type'),
  startDate: z.date({ required_error: 'Start date is required' }),
  endDate: z.date({ required_error: 'End date is required' }),
  startHalfDay: z.enum(['morning', 'afternoon', 'full']),
  endHalfDay: z.enum(['morning', 'afternoon', 'full']),
  reason: z.string().max(500, 'Reason must be less than 500 characters').optional(),
}).refine(
  (data) => data.endDate >= data.startDate,
  {
    message: 'End date must be after or equal to start date',
    path: ['endDate'],
  }
);

type FormData = z.infer<typeof formSchema>;

export function LeaveRequestForm() {
  const router = useRouter();

  // Fetch leave types and holidays from API
  const { data: leaveTypes, isLoading: isLoadingTypes } = useLeaveTypes();
  const { data: holidays, isLoading: isLoadingHolidays } = useHolidays();
  const createLeaveRequest = useCreateLeaveRequest();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      leaveTypeId: '',
      startHalfDay: 'full',
      endHalfDay: 'full',
      reason: '',
    },
  });

  const watchStartDate = form.watch('startDate');
  const watchEndDate = form.watch('endDate');
  const watchStartHalfDay = form.watch('startHalfDay');
  const watchEndHalfDay = form.watch('endHalfDay');

  // Convert holidays to date strings for calculation
  const holidayDates = holidays?.map((h) => h.date) || [];

  // Calculate work days
  const workDays =
    watchStartDate && watchEndDate
      ? calculateWorkDays(
          format(watchStartDate, 'yyyy-MM-dd'),
          format(watchEndDate, 'yyyy-MM-dd'),
          holidayDates,
          watchStartHalfDay === 'full' ? null : watchStartHalfDay,
          watchEndHalfDay === 'full' ? null : watchEndHalfDay
        )
      : 0;

  const onSubmit = async (data: FormData) => {
    try {
      await createLeaveRequest.mutateAsync({
        leaveTypeId: data.leaveTypeId,
        startDate: format(data.startDate, 'yyyy-MM-dd'),
        endDate: format(data.endDate, 'yyyy-MM-dd'),
        startHalfDay: data.startHalfDay === 'full' ? null : data.startHalfDay,
        endHalfDay: data.endHalfDay === 'full' ? null : data.endHalfDay,
        reason: data.reason,
      });

      toast.success('Leave request submitted successfully');
      router.push(pathsConfig.app.leave);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit leave request');
    }
  };

  const isLoading = isLoadingTypes || isLoadingHolidays;
  const isSubmitting = createLeaveRequest.isPending;

  const isSingleDay =
    watchStartDate &&
    watchEndDate &&
    format(watchStartDate, 'yyyy-MM-dd') === format(watchEndDate, 'yyyy-MM-dd');

  if (isLoading) {
    return (
      <Card>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Leave Type */}
            <FormField
              control={form.control}
              name="leaveTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="leave:request.leaveType" />
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {leaveTypes?.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: type.color }}
                            />
                            <Trans i18nKey={`leave:types.${type.code}`} />
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date Range */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>
                      <Trans i18nKey="leave:request.startDate" />
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>
                      <Trans i18nKey="leave:request.endDate" />
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date() ||
                            (watchStartDate && date < watchStartDate)
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Half Day Options */}
            {watchStartDate && watchEndDate && (
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="startHalfDay"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>
                        {isSingleDay ? (
                          <Trans i18nKey="leave:request.halfDay" />
                        ) : (
                          <>
                            <Trans i18nKey="leave:request.startDate" />{' '}
                            <Trans i18nKey="leave:request.halfDay" />
                          </>
                        )}
                      </FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-wrap gap-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="full" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              <Trans i18nKey="leave:request.fullDay" />
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="morning" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              <Trans i18nKey="leave:request.morning" />
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="afternoon" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              <Trans i18nKey="leave:request.afternoon" />
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!isSingleDay && (
                  <FormField
                    control={form.control}
                    name="endHalfDay"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>
                          <Trans i18nKey="leave:request.endDate" />{' '}
                          <Trans i18nKey="leave:request.halfDay" />
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-wrap gap-4"
                          >
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="full" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                <Trans i18nKey="leave:request.fullDay" />
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="morning" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                <Trans i18nKey="leave:request.morning" />
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-2 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="afternoon" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                <Trans i18nKey="leave:request.afternoon" />
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            )}

            {/* Work Days Calculation */}
            {workDays > 0 && (
              <div className="bg-muted rounded-lg p-4">
                <p className="text-sm">
                  <span className="font-semibold">{workDays}</span>{' '}
                  <Trans i18nKey="leave:request.workDaysCalculation" values={{ days: workDays }} />
                </p>
              </div>
            )}

            {/* Reason */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <Trans i18nKey="leave:request.reason" />
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add a reason for your leave request..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional. Max 500 characters.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                <Trans i18nKey="leave:request.cancel" />
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <Trans i18nKey="leave:request.submit" />
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
