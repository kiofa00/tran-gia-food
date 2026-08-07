'use client';

import { Suspense } from 'react';

import { LoginForm, LoginPageFallback } from '@/components';
import { cn } from '@/utils/cn';

export default function LoginPage() {
  return (
    <div
      className={cn(
        'min-h-screen flex items-center justify-center bg-linear-to-br from-orange-500 via-orange-400 to-yellow-400 p-6',
      )}
    >
      <Suspense fallback={<LoginPageFallback />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
