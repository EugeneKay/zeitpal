import Link from 'next/link';

import { cn } from '@kit/ui/utils';

function LogoIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-8 w-8', className)}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="24"
        cy="24"
        r="20"
        className="stroke-purple-600 dark:stroke-purple-400"
        strokeWidth="3"
        fill="none"
      />
      <circle
        cx="24"
        cy="24"
        r="16"
        className="fill-purple-100 dark:fill-purple-900/30"
      />
      <path
        d="M24 12V24L32 28"
        className="stroke-purple-600 dark:stroke-purple-400"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="8" r="1.5" className="fill-purple-500 dark:fill-purple-400" />
      <circle cx="40" cy="24" r="1.5" className="fill-purple-500 dark:fill-purple-400" />
      <circle cx="24" cy="40" r="1.5" className="fill-purple-500 dark:fill-purple-400" />
      <circle cx="8" cy="24" r="1.5" className="fill-purple-500 dark:fill-purple-400" />
    </svg>
  );
}

function LogoFull({ className }: { className?: string }) {
  return (
    <svg
      className={cn('w-[120px] lg:w-[140px]', className)}
      viewBox="0 0 200 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Clock icon */}
      <circle
        cx="24"
        cy="24"
        r="20"
        className="stroke-purple-600 dark:stroke-purple-400"
        strokeWidth="3"
        fill="none"
      />
      <circle
        cx="24"
        cy="24"
        r="16"
        className="fill-purple-100 dark:fill-purple-900/30"
      />
      <path
        d="M24 12V24L32 28"
        className="stroke-purple-600 dark:stroke-purple-400"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Small decorative dots */}
      <circle cx="24" cy="8" r="1.5" className="fill-purple-500 dark:fill-purple-400" />
      <circle cx="40" cy="24" r="1.5" className="fill-purple-500 dark:fill-purple-400" />
      <circle cx="24" cy="40" r="1.5" className="fill-purple-500 dark:fill-purple-400" />
      <circle cx="8" cy="24" r="1.5" className="fill-purple-500 dark:fill-purple-400" />
      {/* ZeitPal text */}
      <text
        x="54"
        y="32"
        className="fill-purple-700 dark:fill-white"
        style={{
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: '26px',
          fontWeight: 700,
          letterSpacing: '-0.5px',
        }}
      >
        Zeit
        <tspan className="fill-purple-500 dark:fill-purple-400">Pal</tspan>
      </text>
    </svg>
  );
}

export function AppLogo({
  href,
  label,
  className,
  iconOnly = false,
}: {
  href?: string | null;
  className?: string;
  label?: string;
  iconOnly?: boolean;
}) {
  const Logo = iconOnly ? LogoIcon : LogoFull;

  if (href === null) {
    return <Logo className={className} />;
  }

  return (
    <Link aria-label={label ?? 'Home Page'} href={href ?? '/'}>
      <Logo className={className} />
    </Link>
  );
}

export { LogoIcon, LogoFull };
