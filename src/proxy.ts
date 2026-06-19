import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import { authConfig } from './auth.config';

// Edge-safe Auth.js instance for the proxy (uses the Sanity-free base config).
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  if (!req.auth) {
    if (req.nextUrl.pathname.startsWith('/api')) {
      return new NextResponse('Authentication Error', { status: 401 });
    }

    const { pathname, search, origin, basePath } = req.nextUrl;
    const signInUrl = new URL(`/api/auth/signin`, origin);
    signInUrl.searchParams.append('callbackUrl', `${basePath}${pathname}${search}`);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/new',
    '/',
    '/api/bookmarks',
    '/api/comments',
    '/api/likes',
    '/api/follow',
    '/api/me',
    '/api/posts/:path*',
  ],
};
