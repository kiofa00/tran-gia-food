import NextAuth, { type NextAuthOptions } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';

import { ADMIN_ROUTES } from '@/shared-config';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

// 14 phút (backend accessToken hết hạn sau 15 phút, buffer 60s để refresh kịp)
const ACCESS_TOKEN_TTL_MS = 14 * 60 * 1000;

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: token.refreshToken }),
    });

    if (!res.ok) throw new Error('Refresh failed');

    const data = (await res.json()) as { accessToken: string; refreshToken: string };

    return {
      ...token,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      accessTokenExpiry: Date.now() + ACCESS_TOKEN_TTL_MS,
      error: undefined,
    };
  } catch {
    // Refresh token hết hạn hoặc không hợp lệ → buộc đăng xuất
    return { ...token, error: 'RefreshTokenExpired' };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Admin Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        remember: { label: 'Remember', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const res = await fetch(`${API_URL}/auth/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: credentials.email, password: credentials.password }),
          });

          if (!res.ok) return null;
          const data = (await res.json()) as {
            accessToken: string;
            refreshToken: string;
            user: { id: string; email: string; name: string; role: string };
          };

          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            remember: credentials.remember === 'true',
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Lần đầu login: gán toàn bộ thông tin vào token
      if (user) {
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          role: user.role,
          userId: user.id,
          accessTokenExpiry: Date.now() + ACCESS_TOKEN_TTL_MS,
          // remember=false: session 8h | remember=true: 30 ngày
          sessionExpiry: user.remember
            ? Date.now() + 30 * 24 * 60 * 60 * 1000
            : Date.now() + 8 * 60 * 60 * 1000,
        };
      }

      // Session hết hạn (do remember=false)
      if (token.sessionExpiry && Date.now() > token.sessionExpiry) {
        return { ...token, error: 'SessionExpired' };
      }

      // accessToken còn hạn → trả về nguyên
      if (token.accessTokenExpiry && Date.now() < token.accessTokenExpiry) {
        return token;
      }

      // accessToken hết hạn → tự động refresh
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.user.id = token.userId;
      session.user.role = token.role;
      session.error = token.error;

      return session;
    },
  },
  pages: { signIn: ADMIN_ROUTES.LOGIN, error: ADMIN_ROUTES.LOGIN },
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 }, // cookie max 30 ngày
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
