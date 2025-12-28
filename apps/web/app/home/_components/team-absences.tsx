'use client';

import { format, addDays, startOfWeek, isSameDay } from 'date-fns';

import { Avatar, AvatarFallback, AvatarImage } from '@kit/ui/avatar';
import { Card, CardContent } from '@kit/ui/card';
import { Skeleton } from '@kit/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@kit/ui/tooltip';
import { Trans } from '@kit/ui/trans';

// TODO: Replace with React Query hook
const mockAbsences: {
  id: string;
  user: { name: string; image: string | null; initials: string };
  leaveType: { code: string; color: string };
  startDate: string;
  endDate: string;
}[] = [];

interface TeamAbsenceRowProps {
  user: {
    name: string;
    image: string | null;
    initials: string;
  };
  leaveType: { code: string; color: string };
  startDate: string;
  endDate: string;
  weekDays: Date[];
}

function TeamAbsenceRow({
  user,
  leaveType,
  startDate,
  endDate,
  weekDays,
}: TeamAbsenceRowProps) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const isAbsentOnDay = (day: Date) => {
    return day >= start && day <= end;
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex w-40 items-center gap-2">
        <Avatar className="h-6 w-6">
          <AvatarImage src={user.image ?? undefined} alt={user.name} />
          <AvatarFallback className="text-xs">{user.initials}</AvatarFallback>
        </Avatar>
        <span className="truncate text-sm">{user.name}</span>
      </div>

      <div className="flex flex-1 gap-1">
        {weekDays.map((day) => {
          const isAbsent = isAbsentOnDay(day);
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;

          return (
            <Tooltip key={day.toISOString()}>
              <TooltipTrigger asChild>
                <div
                  className={`h-8 flex-1 rounded-sm ${
                    isWeekend
                      ? 'bg-muted/50'
                      : isAbsent
                        ? ''
                        : 'bg-muted/30'
                  }`}
                  style={
                    isAbsent && !isWeekend
                      ? { backgroundColor: leaveType.color, opacity: 0.7 }
                      : undefined
                  }
                />
              </TooltipTrigger>
              <TooltipContent>
                <p>{format(day, 'EEEE, MMM d')}</p>
                {isAbsent && !isWeekend && (
                  <p className="text-xs">
                    <Trans i18nKey={`leave:types.${leaveType.code}`} />
                  </p>
                )}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}

function TeamAbsencesSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="flex w-40 items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex flex-1 gap-1">
            {[...Array(7)].map((_, j) => (
              <Skeleton key={j} className="h-8 flex-1 rounded-sm" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function TeamAbsences() {
  // TODO: Replace with React Query hook
  const isLoading = false;
  const absences = mockAbsences;

  // Get current week days
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <TeamAbsencesSkeleton />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        {/* Week header */}
        <div className="mb-3 flex items-center gap-3">
          <div className="w-40" />
          <div className="flex flex-1 gap-1">
            {weekDays.map((day) => {
              const isToday = isSameDay(day, today);
              const isWeekend = day.getDay() === 0 || day.getDay() === 6;

              return (
                <div
                  key={day.toISOString()}
                  className={`flex-1 text-center text-xs ${
                    isToday
                      ? 'font-semibold'
                      : isWeekend
                        ? 'text-muted-foreground'
                        : ''
                  }`}
                >
                  <div>{format(day, 'EEE')}</div>
                  <div>{format(day, 'd')}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Absences */}
        {absences.length === 0 ? (
          <p className="text-muted-foreground py-4 text-center text-sm">
            No team absences this week
          </p>
        ) : (
          <div className="space-y-2">
            {absences.map((absence) => (
              <TeamAbsenceRow
                key={absence.id}
                user={absence.user}
                leaveType={absence.leaveType}
                startDate={absence.startDate}
                endDate={absence.endDate}
                weekDays={weekDays}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
