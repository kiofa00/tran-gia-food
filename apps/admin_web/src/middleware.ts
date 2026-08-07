export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - /login (auth page)
     * - /api/auth/** (NextAuth routes)
     * - /_next/** (Next.js internals)
     * - /favicon.ico, /robots.txt (static files)
     */
    '/((?!login|api/auth|_next/static|_next/image|favicon.ico|robots.txt).*)',
  ],
};
