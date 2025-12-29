'use client';

import { useEffect, useState } from 'react';

import { AlertCircle, Calendar, Check, Plus, X } from 'lucide-react';

import { Alert, AlertDescription } from '@kit/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@kit/ui/alert-dialog';
import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@kit/ui/card';
import { Skeleton } from '@kit/ui/skeleton';
import { Switch } from '@kit/ui/switch';
import { Trans } from '@kit/ui/trans';

import { apiFetch } from '~/lib/utils/csrf';

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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  // Toggle confirmation state
  const [togglingLeaveType, setTogglingLeaveType] = useState<LeaveType | null>(null);

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
        setLoadError(err instanceof Error ? err.message : 'Failed to load leave types');
      } finally {
        setIsLoading(false);
      }
    }

    fetchLeaveTypes();
  }, []);

  function openToggleConfirmation(leaveType: LeaveType) {
    setTogglingLeaveType(leaveType);
  }

  async function handleConfirmToggle() {
    if (!togglingLeaveType) return;

    const { id, isActive: currentStatus } = togglingLeaveType;
    setUpdatingIds((prev) => new Set(prev).add(id));
    setUpdateError(null);
    setTogglingLeaveType(null);

    const { error } = await apiFetch('/api/leave-types', {
      method: 'PATCH',
      body: JSON.stringify({ id, isActive: !currentStatus }),
    });

    if (error) {
      setUpdateError(error);
    } else {
      setLeaveTypes((prev) =>
        prev.map((lt) => (lt.id === id ? { ...lt, isActive: !currentStatus } : lt))
      );
    }

    setUpdatingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

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

  if (loadError) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground">{loadError}</p>
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

      {/* Update error alert */}
      {updateError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{updateError}</AlertDescription>
        </Alert>
      )}

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
                <span className="text-sm text-muted-foreground">
                  <Trans i18nKey="admin:leaveTypes.active" defaults="Active" />
                </span>
                <Switch
                  checked={leaveType.isActive}
                  disabled={updatingIds.has(leaveType.id)}
                  onCheckedChange={() => openToggleConfirmation(leaveType)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {leaveTypes.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">
              <Trans i18nKey="admin:leaveTypes.noTypes" defaults="No Leave Types" />
            </h3>
            <p className="text-muted-foreground">
              <Trans
                i18nKey="admin:leaveTypes.noTypesDescription"
                defaults="Leave types will appear here once the system is configured."
              />
            </p>
          </CardContent>
        </Card>
      )}

      {/* Toggle Active Confirmation Dialog */}
      <AlertDialog
        open={!!togglingLeaveType}
        onOpenChange={(open) => !open && setTogglingLeaveType(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {togglingLeaveType?.isActive ? (
                <Trans
                  i18nKey="admin:leaveTypes.deactivateDialog.title"
                  defaults="Deactivate Leave Type"
                />
              ) : (
                <Trans
                  i18nKey="admin:leaveTypes.activateDialog.title"
                  defaults="Activate Leave Type"
                />
              )}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {togglingLeaveType?.isActive ? (
                <Trans
                  i18nKey="admin:leaveTypes.deactivateDialog.description"
                  defaults="Are you sure you want to deactivate '{leaveTypeName}'? Employees will no longer be able to request this leave type. Existing requests will not be affected."
                  values={{ leaveTypeName: togglingLeaveType?.nameEn || '' }}
                />
              ) : (
                <Trans
                  i18nKey="admin:leaveTypes.activateDialog.description"
                  defaults="Are you sure you want to activate '{leaveTypeName}'? Employees will be able to request this leave type."
                  values={{ leaveTypeName: togglingLeaveType?.nameEn || '' }}
                />
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              <Trans i18nKey="common:cancel" defaults="Cancel" />
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmToggle}
              className={togglingLeaveType?.isActive
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : ""
              }
            >
              {togglingLeaveType?.isActive ? (
                <Trans
                  i18nKey="admin:leaveTypes.deactivateDialog.confirm"
                  defaults="Deactivate"
                />
              ) : (
                <Trans
                  i18nKey="admin:leaveTypes.activateDialog.confirm"
                  defaults="Activate"
                />
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
