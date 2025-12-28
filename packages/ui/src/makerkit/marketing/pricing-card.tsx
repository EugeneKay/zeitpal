import React from 'react';

import { Check } from 'lucide-react';

import { cn } from '../../lib/utils';
import { Badge } from '../../shadcn/badge';
import { Button } from '../../shadcn/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../shadcn/card';

export interface PricingCardProps {
  name: string;
  price: string | number;
  period?: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
  ctaText: string;
  ctaHref: string;
  ctaVariant?: 'default' | 'outline';
  className?: string;
}

export function PricingCard({
  name,
  price,
  period,
  description,
  features,
  highlighted = false,
  badge,
  ctaText,
  ctaHref,
  ctaVariant = 'default',
  className,
}: PricingCardProps) {
  return (
    <Card
      className={cn(
        'relative flex flex-col',
        highlighted && 'border-primary shadow-lg ring-2 ring-primary/20',
        className,
      )}
    >
      {badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge
            variant={highlighted ? 'default' : 'secondary'}
            className="px-3 py-1 text-xs font-semibold"
          >
            {badge}
          </Badge>
        </div>
      )}

      <CardHeader className="pb-4 pt-8">
        <CardTitle className="text-xl font-semibold">{name}</CardTitle>
        <CardDescription className="text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="mb-6">
          <span className="text-4xl font-bold">
            {typeof price === 'number' ? `€${price}` : price}
          </span>
          {period && (
            <span className="text-muted-foreground ml-1 text-sm">{period}</span>
          )}
        </div>

        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="text-primary mt-0.5 h-4 w-4 flex-shrink-0" />
              <span className="text-muted-foreground text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="pt-4">
        <Button
          variant={ctaVariant}
          className="w-full"
          asChild
        >
          <a href={ctaHref}>{ctaText}</a>
        </Button>
      </CardFooter>
    </Card>
  );
}

export interface PricingTableProps {
  children: React.ReactNode;
  className?: string;
}

export function PricingTable({ children, className }: PricingTableProps) {
  return (
    <div
      className={cn(
        'grid gap-8 md:grid-cols-2 lg:grid-cols-3',
        className,
      )}
    >
      {children}
    </div>
  );
}
