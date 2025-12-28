'use client';

import { SessionProvider } from 'next-auth/react';

export function AuthProvider(props: React.PropsWithChildren) {
  return <SessionProvider>{props.children}</SessionProvider>;
}
