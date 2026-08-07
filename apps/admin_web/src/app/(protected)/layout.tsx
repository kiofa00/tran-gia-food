import React from 'react';

import { redirect } from 'next/navigation';

import { getServerSession } from 'next-auth';

import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Footer } from '@/components/shared-ui/Footer';
import { Header } from '@/components/shared-ui/Header';
import { SessionGuard } from '@/components/shared-ui/SessionGuard';
import { ADMIN_ROUTES } from '@/shared-config';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(ADMIN_ROUTES.LOGIN);
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <SessionGuard />
      <Header userName={session.user?.name ?? 'Admin'} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
