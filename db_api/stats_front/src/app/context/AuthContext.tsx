'use client';

import { SessionProvider } from 'next-auth/react';

export default function Provider({ children, session }) {
  // The `session` prop is optional; SessionProvider can fetch it automatically.
  return <SessionProvider session={session}>{children}</SessionProvider>;
}