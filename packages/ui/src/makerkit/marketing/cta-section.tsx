import React from 'react';

import { cn } from '../../lib/utils';
import { Button } from '../../shadcn/button';

export interface CTASectionProps {
  heading: string;
  subheading?: string;
  primaryCta?: {
    text: string;
    href: string;
  };
  secondaryCta?: {
    text: string;
    href: string;
  };
  className?: string;
  variant?: 'default' | 'centered' | 'split';
}

export function CTASection({
  heading,
  subheading,
  primaryCta,
  secondaryCta,
  className,
  variant = 'centered',
}: CTASectionProps) {
  if (variant === 'split') {
    return (
      <section
        className={cn(
          'bg-muted/50 rounded-2xl px-6 py-12 md:px-12 md:py-16',
          className,
        )}
      >
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="text-center md:text-left">
            <h2 className="text-foreground text-2xl font-bold md:text-3xl">
              {heading}
            </h2>
            {subheading && (
              <p className="text-muted-foreground mt-2 text-base">
                {subheading}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {primaryCta && (
              <Button size="lg" asChild>
                <a href={primaryCta.href}>{primaryCta.text}</a>
              </Button>
            )}
            {secondaryCta && (
              <Button size="lg" variant="outline" asChild>
                <a href={secondaryCta.href}>{secondaryCta.text}</a>
              </Button>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn(
        'bg-muted/50 rounded-2xl px-6 py-12 md:px-12 md:py-16',
        className,
      )}
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-foreground text-2xl font-bold md:text-3xl">
          {heading}
        </h2>
        {subheading && (
          <p className="text-muted-foreground mt-4 text-base md:text-lg">
            {subheading}
          </p>
        )}

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          {primaryCta && (
            <Button size="lg" asChild>
              <a href={primaryCta.href}>{primaryCta.text}</a>
            </Button>
          )}
          {secondaryCta && (
            <Button size="lg" variant="outline" asChild>
              <a href={secondaryCta.href}>{secondaryCta.text}</a>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
