import React from 'react';

import { cn } from '../../lib/utils';

export interface StatItemProps {
  value: string;
  label: string;
  suffix?: string;
  className?: string;
}

export function StatItem({ value, label, suffix, className }: StatItemProps) {
  return (
    <div className={cn('text-center', className)}>
      <div className="text-primary text-4xl font-bold md:text-5xl">
        {value}
        {suffix && <span className="text-3xl md:text-4xl">{suffix}</span>}
      </div>
      <p className="text-muted-foreground mt-2 text-sm font-medium">{label}</p>
    </div>
  );
}

export interface StatsSectionProps {
  stats: Array<{
    value: string;
    label: string;
    suffix?: string;
  }>;
  heading?: string;
  subheading?: string;
  className?: string;
}

export function StatsSection({
  stats,
  heading,
  subheading,
  className,
}: StatsSectionProps) {
  return (
    <section className={cn('py-12 md:py-16', className)}>
      {(heading || subheading) && (
        <div className="mb-12 text-center">
          {heading && (
            <h2 className="text-foreground text-2xl font-bold md:text-3xl">
              {heading}
            </h2>
          )}
          {subheading && (
            <p className="text-muted-foreground mt-2 text-base">
              {subheading}
            </p>
          )}
        </div>
      )}

      <div
        className={cn(
          'grid gap-8',
          stats.length === 2 && 'grid-cols-2',
          stats.length === 3 && 'grid-cols-2 md:grid-cols-3',
          stats.length === 4 && 'grid-cols-2 md:grid-cols-4',
          stats.length > 4 && 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
        )}
      >
        {stats.map((stat, index) => (
          <StatItem
            key={index}
            value={stat.value}
            label={stat.label}
            suffix={stat.suffix}
          />
        ))}
      </div>
    </section>
  );
}
