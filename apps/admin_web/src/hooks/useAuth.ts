import { signIn, signOut } from 'next-auth/react';

import { authService } from '@/services/auth.service';
import { ADMIN_ROUTES } from '@/shared-config';

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

/**
 * Hook tập trung toàn bộ auth flow:
 * - login: wrap next-auth signIn (credentials provider gọi backend internally)
 * - logout: gọi backend blacklist token + next-auth signOut
 */
export function useAuth() {
  const login = async (credentials: LoginCredentials) => {
    return await signIn('credentials', {
      email: credentials.email,
      password: credentials.password,
      remember: String(credentials.remember ?? false),
      redirect: false,
    });
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Backend fail → vẫn xóa session client
    } finally {
      await signOut({ callbackUrl: ADMIN_ROUTES.LOGIN });
    }
  };

  return { login, logout };
}
