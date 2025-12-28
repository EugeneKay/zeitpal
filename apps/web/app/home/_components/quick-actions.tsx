'use client';

import Link from 'next/link';

import { CalendarDays, ClipboardList, Clock } from 'lucide-react';

import { Button } from '@kit/ui/button';
import { Card, CardContent } from '@kit/ui/card';
import { Trans } from '@kit/ui/trans';

import pathsConfig from '~/config/paths.config';

const quickActions = [
  {
    href: pathsConfig.app.leaveRequest,
    icon: ClipboardList,
    labelKey: 'leave:dashboard.newRequest',
    variant: 'default' as const,
  },
  {
    href: pathsConfig.app.calendar,
    icon: CalendarDays,
    labelKey: 'leave:dashboard.viewCalendar',
    variant: 'outline' as const,
  },
  {
    href: pathsConfig.app.leave,
    icon: Clock,
    labelKey: 'leave:dashboard.viewHistory',
    variant: 'outline' as const,
  },
];

export function QuickActions() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-3">
          {quickActions.map((action) => (
            <Button
              key={action.href}
              variant={action.variant}
              asChild
              className="flex-1 min-w-[140px]"
            >
              <Link href={action.href}>
                <action.icon className="mr-2 h-4 w-4" />
                <Trans i18nKey={action.labelKey} />
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
