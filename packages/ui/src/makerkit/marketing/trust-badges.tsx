import React from 'react';

import { Check, Globe, Lock, Server, Shield } from 'lucide-react';

import { cn } from '../../lib/utils';

export interface TrustBadgeProps {
  icon: React.ReactNode;
  label: string;
  className?: string;
}

export function TrustBadge({ icon, label, className }: TrustBadgeProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 text-sm text-muted-foreground',
        className,
      )}
    >
      <span className="text-primary flex-shrink-0">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

export interface TrustBadgesProps {
  badges: Array<{
    icon: React.ReactNode;
    label: string;
  }>;
  className?: string;
  layout?: 'row' | 'grid';
}

export function TrustBadges({
  badges,
  className,
  layout = 'row',
}: TrustBadgesProps) {
  return (
    <div
      className={cn(
        layout === 'row'
          ? 'flex flex-wrap items-center justify-center gap-4 md:gap-6'
          : 'grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5',
        className,
      )}
    >
      {badges.map((badge, index) => (
        <TrustBadge key={index} icon={badge.icon} label={badge.label} />
      ))}
    </div>
  );
}

// Pre-configured German trust badges
export function GermanTrustBadges({
  className,
  layout = 'row',
}: {
  className?: string;
  layout?: 'row' | 'grid';
}) {
  const badges = [
    { icon: <Shield className="h-4 w-4" />, label: 'DSGVO-konform' },
    { icon: <Globe className="h-4 w-4" />, label: 'Made in Germany' },
    { icon: <Lock className="h-4 w-4" />, label: 'SSL-verschlüsselt' },
    { icon: <Server className="h-4 w-4" />, label: 'Deutsche Server' },
    { icon: <Check className="h-4 w-4" />, label: 'Keine versteckten Kosten' },
  ];

  return <TrustBadges badges={badges} className={className} layout={layout} />;
}

// English version
export function EnglishTrustBadges({
  className,
  layout = 'row',
}: {
  className?: string;
  layout?: 'row' | 'grid';
}) {
  const badges = [
    { icon: <Shield className="h-4 w-4" />, label: 'GDPR Compliant' },
    { icon: <Globe className="h-4 w-4" />, label: 'Made in Germany' },
    { icon: <Lock className="h-4 w-4" />, label: 'SSL Encrypted' },
    { icon: <Server className="h-4 w-4" />, label: 'EU Servers' },
    { icon: <Check className="h-4 w-4" />, label: 'No Hidden Costs' },
  ];

  return <TrustBadges badges={badges} className={className} layout={layout} />;
}
