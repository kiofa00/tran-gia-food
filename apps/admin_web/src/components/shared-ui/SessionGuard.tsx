'use client';

import { useEffect } from 'react';

import { signOut, useSession } from 'next-auth/react';

import { ADMIN_ROUTES } from '@/shared-config';

/**
 * Đặt component này trong layout protected để tự động đăng xuất
 * khi session hết hạn hoặc refresh token không còn hợp lệ.
 */
export function SessionGuard() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.error === 'SessionExpired' || session?.error === 'RefreshTokenExpired') {
      signOut({ callbackUrl: ADMIN_ROUTES.LOGIN });
    }
  }, [session?.error]);

  return null;
}
