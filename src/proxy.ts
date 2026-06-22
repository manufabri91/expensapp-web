import { NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth/config';
import { DEFAULT_REDIRECT, HOME, PUBLIC_ROUTES } from '@/lib/routes';

const { auth } = NextAuth(authConfig);

export const proxy = auth((req) => {
  const { nextUrl } = req;

  const isAuthenticated = !!req.auth;
  const isPublicRoute = PUBLIC_ROUTES.includes(nextUrl.pathname);

  if (isPublicRoute && isAuthenticated) return NextResponse.redirect(new URL(DEFAULT_REDIRECT, nextUrl));

  if (!isAuthenticated && !isPublicRoute) return NextResponse.redirect(new URL(HOME, nextUrl));

  const requestHeaders = new Headers(req.headers);

  requestHeaders.set('x-current-host', req.nextUrl.host);
  requestHeaders.set('x-protocol', req.nextUrl.protocol);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*|static).*)',
  ],
};
