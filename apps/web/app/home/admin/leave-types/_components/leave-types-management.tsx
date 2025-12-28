'use client';

import { useEffect, useState } from 'react';

import { Calendar, Check, Edit2, Plus, X } from 'lucide-react';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { Skeleton } from '@kit/ui/skeleton';
import { Switch } from '@kit/ui/switch';

interface LeaveType {
  id: string;
  code: string;
  nameEn: string;
  nameDe: string;
  descriptionEn: string | null;
  color: string;
  icon: string;
  isPaid: boolean;
  requiresApproval: boolean;
  requiresDocument: boolean;
  documentRequiredAfterDays: number | null;
  hasAllowance: boolean;
  defaultDaysPerYear: number | null;
  allowHalfDays: boolean;
  allowCarryover: boolean;
  isActive: boolean;
  sortOrder: number;
}

export function LeaveTypesManagement() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeaveTypes() {
      try {
        const response = await fetch('/api/leave-types');
        if (!response.ok) {
          throw new Error('Failed to fetch leave types');
        }
        const data = await response.json();
        setLeaveTypes(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load leave types');
      } finally {
        setIsLoading(false);
      }
    }

    fetchLeaveTypes();
  }, []);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Manage the leave types available in your organization. These are the
          system defaults - you can customize them for your organization.
        </p>
        <Button disabled>
          <Plus className="mr-2 h-4 w-4" />
          Add Custom Type
        </Button>
      </div>

      {/* Leave types grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {leaveTypes.map((leaveType) => (
          <Card key={leaveType.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${leaveType.color}20` }}
                  >
                    <Calendar
                      className="h-5 w-5"
                      style={{ color: leaveType.color }}
                    />
                  </div>
                  <div>
                    <CardTitle className="text-base">{leaveType.nameEn}</CardTitle>
                    <CardDescription className="text-xs">
                      {leaveType.nameDe}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={leaveType.isActive ? 'default' : 'secondary'}>
                  {leaveType.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {leaveType.descriptionEn && (
                <p className="text-sm text-muted-foreground">
                  {leaveType.descriptionEn}
                </p>
              )}

              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  {leaveType.isPaid ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                  <span>Paid</span>
                </div>
                <div className="flex items-center gap-2">
                  {leaveType.requiresApproval ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                  <span>Needs Approval</span>
                </div>
                <div className="flex items-center gap-2">
                  {leaveType.allowHalfDays ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                  <span>Half Days</span>
                </div>
                <div className="flex items-center gap-2">
                  {leaveType.hasAllowance ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                  <span>Has Allowance</span>
                </div>
              </div>

              {leaveType.hasAllowance && leaveType.defaultDaysPerYear && (
                <div className="rounded-md bg-muted px-3 py-2 text-sm">
                  Default: <strong>{leaveType.defaultDaysPerYear}</strong> days/year
                </div>
              )}

              {leaveType.requiresDocument && (
                <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 px-3 py-2 text-sm text-amber-800 dark:text-amber-200">
                  Requires document
                  {leaveType.documentRequiredAfterDays
                    ? ` after ${leaveType.documentRequiredAfterDays} days`
                    : ''}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm text-muted-foreground">Active</span>
                <Switch checked={leaveType.isActive} disabled />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {leaveTypes.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No Leave Types</h3>
            <p className="text-muted-foreground">
              Leave types will appear here once the system is configured.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
