// app/login/page.jsx
'use client';

import LoginForm from './LoginForm';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { LoadingSpinner } from '@/app/components/LoadingSpinner/page';

export default function LoginPage() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <LoadingSpinner />;
  }

  if (session) {
    redirect('/home');
  }

  return (
    <div className="h-screen flex flex-row justify-center items-center bg-gray-50">
      <LoginForm />
    </div>
  );
}