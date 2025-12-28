'use client';

import type { ReactNode } from 'react';

import { Info, Lightbulb, AlertTriangle } from 'lucide-react';

import { cn } from '@kit/ui/utils';

interface StepInfoBoxProps {
  children: ReactNode;
  variant?: 'info' | 'tip' | 'warning';
  className?: string;
}

const VARIANTS = {
  info: {
    icon: Info,
    bgClass: 'bg-blue-50 dark:bg-blue-950/30',
    borderClass: 'border-blue-200 dark:border-blue-800',
    iconClass: 'text-blue-600 dark:text-blue-400',
    textClass: 'text-blue-900 dark:text-blue-100',
  },
  tip: {
    icon: Lightbulb,
    bgClass: 'bg-amber-50 dark:bg-amber-950/30',
    borderClass: 'border-amber-200 dark:border-amber-800',
    iconClass: 'text-amber-600 dark:text-amber-400',
    textClass: 'text-amber-900 dark:text-amber-100',
  },
  warning: {
    icon: AlertTriangle,
    bgClass: 'bg-red-50 dark:bg-red-950/30',
    borderClass: 'border-red-200 dark:border-red-800',
    iconClass: 'text-red-600 dark:text-red-400',
    textClass: 'text-red-900 dark:text-red-100',
  },
};

export function StepInfoBox({
  children,
  variant = 'info',
  className,
}: StepInfoBoxProps) {
  const config = VARIANTS[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-lg border p-4',
        config.bgClass,
        config.borderClass,
        className
      )}
    >
      <Icon className={cn('mt-0.5 h-5 w-5 flex-shrink-0', config.iconClass)} />
      <div className={cn('text-sm', config.textClass)}>{children}</div>
    </div>
  );
}
