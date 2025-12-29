'use client';

import type { User } from 'next-auth';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarNavigation,
  useSidebar,
} from '@kit/ui/shadcn-sidebar';

import { AppLogo } from '~/components/app-logo';
import { ProfileAccountDropdownContainer } from '~/components/personal-account-dropdown-container';
import { navigationConfig } from '~/config/navigation.config';

function SidebarLogo() {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <AppLogo
      className={isCollapsed ? 'h-8 w-8' : 'max-w-full'}
      iconOnly={isCollapsed}
    />
  );
}

export function HomeSidebar(props: {
  account?: {
    id: string | null;
    name: string | null;
    picture_url: string | null;
  };
  user: User;
}) {
  return (
    <Sidebar collapsible={'icon'}>
      <SidebarHeader className={'h-16 justify-center'}>
        <div className={'flex items-center justify-between space-x-2'}>
          <div>
            <SidebarLogo />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarNavigation config={navigationConfig} />
      </SidebarContent>

      <SidebarFooter>
        <ProfileAccountDropdownContainer
          user={props.user}
          account={props.account}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
