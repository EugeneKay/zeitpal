'use client';

import { usePathname } from 'next/navigation';

import { NavigationMenuItem } from '@kit/ui/navigation-menu';
import { cn, isRouteActive } from '@kit/ui/utils';

import { LocalizedLink } from '~/components/localized-link';

const getClassName = (path: string, currentPathName: string) => {
  const isActive = isRouteActive(path, currentPathName);

  return cn(
    `inline-flex w-max text-sm font-medium transition-colors duration-300`,
    {
      'dark:text-gray-300 dark:hover:text-white': !isActive,
      'text-current dark:text-white': isActive,
    },
  );
};

export function SiteNavigationItem({
  path,
  children,
}: React.PropsWithChildren<{
  path: string;
}>) {
  const currentPathName = usePathname();
  const className = getClassName(path, currentPathName);

  return (
    <NavigationMenuItem key={path}>
      <LocalizedLink className={className} href={path}>
        {children}
      </LocalizedLink>
    </NavigationMenuItem>
  );
}
