import { NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth/config';
import { DEFAULT_REDIRECT, HOME, PUBLIC_ROUTES } from '@/lib/routes';

const { auth } = NextAuth(authConfig);

export const proxy = auth((req) => {
  const { nextUrl } = req;

  // A session whose refresh attempt failed (`error` set by the `jwt` callback in
  // src/lib/auth/config.ts) still carries a stale/invalid bearer token. Treat it as
  // unauthenticated so the user is forced back to login instead of continuing to send
  // that dead token to the backend on every request.
  const isAuthenticated = req.auth != null && !req.auth.error;
  const isPublicRoute = PUBLIC_ROUTES.includes(nextUrl.pathname);

  if (isPublicRoute && isAuthenticated) return NextResponse.redirect(new URL(DEFAULT_REDIRECT, nextUrl));

  if (!isAuthenticated && !isPublicRoute) return NextResponse.redirect(new URL(HOME, nextUrl));

  // NOTE: this used to also set `x-current-host`/`x-protocol` headers (derived from the
  // client-controllable `Host` header) so that `src/lib/utils/url.ts#getBaseUrl()` could
  // reconstruct a base URL for server actions to call the backend through. That was an
  // SSRF / cookie-leak risk (a forged Host header could redirect an authenticated fetch to
  // an attacker-controlled origin). The `lib/actions/*.ts` files now call the Spring Boot
  // backend directly via the trusted `API_URL` env var instead, so those headers and
  // `getBaseUrl()` were removed entirely (confirmed via grep: no other callers existed).
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*|static).*)',
  ],
};
