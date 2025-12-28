'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Progress } from '@kit/ui/progress';
import { Skeleton } from '@kit/ui/skeleton';
import { Trans } from '@kit/ui/trans';

import { useLeaveBalances } from '~/lib/hooks';

interface LeaveBalanceCardProps {
  leaveType: {
    code: string;
    nameEn: string;
    nameDe: string;
    color: string;
  };
  entitled: number;
  carriedOver: number;
  used: number;
  pending: number;
  remaining: number;
}

function LeaveBalanceCard({
  leaveType,
  entitled,
  carriedOver,
  used,
  pending,
  remaining,
}: LeaveBalanceCardProps) {
  const total = entitled + carriedOver;
  const usedPercentage = total > 0 ? ((used + pending) / total) * 100 : 0;

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: leaveType.color }}
          />
          <CardTitle className="text-base">
            <Trans i18nKey={`leave:types.${leaveType.code}`} />
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">{remaining}</span>
            <span className="text-muted-foreground text-sm">
              <Trans i18nKey="leave:balance.days" />
            </span>
            <span className="text-muted-foreground ml-auto text-sm">
              <Trans i18nKey="leave:balance.remaining" />
            </span>
          </div>

          {total > 0 && (
            <>
              <Progress value={usedPercentage} className="h-2" />

              <div className="text-muted-foreground flex justify-between text-xs">
                <span>
                  <Trans i18nKey="leave:balance.used" />: {used}
                </span>
                {pending > 0 && (
                  <span>
                    <Trans i18nKey="leave:balance.pending" />: {pending}
                  </span>
                )}
                <span>
                  <Trans i18nKey="leave:balance.total" />: {total}
                </span>
              </div>
            </>
          )}

          {total === 0 && used > 0 && (
            <div className="text-muted-foreground text-xs">
              <Trans i18nKey="leave:balance.used" />: {used}{' '}
              <Trans i18nKey="leave:balance.days" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function LeaveBalanceCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-baseline gap-1">
            <Skeleton className="h-8 w-12" />
            <Skeleton className="h-4 w-10" />
          </div>
          <Skeleton className="h-2 w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function LeaveBalanceOverview() {
  const { data: balances, isLoading } = useLeaveBalances();

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <LeaveBalanceCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!balances || balances.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">
            <Trans i18nKey="leave:balance.noBalance" />
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {balances.map((balance) => {
        const total = balance.entitled + balance.carriedOver;
        const remaining = total - balance.used - balance.pending;
        return (
          <LeaveBalanceCard
            key={balance.id}
            leaveType={{
              code: balance.leaveType?.code || 'unknown',
              nameEn: balance.leaveType?.nameEn || 'Unknown',
              nameDe: balance.leaveType?.nameDe || 'Unbekannt',
              color: balance.leaveType?.color || '#6B7280',
            }}
            entitled={balance.entitled}
            carriedOver={balance.carriedOver}
            used={balance.used}
            pending={balance.pending}
            remaining={remaining}
          />
        );
      })}
    </div>
  );
}
