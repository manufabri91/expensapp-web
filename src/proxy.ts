import { NextResponse } from 'next/server';
import NextAuth, { type NextAuthRequest } from 'next-auth';
import { authConfig } from '@/lib/auth/config';
import { hasValidSession } from '@/lib/auth/session';
import { DEFAULT_REDIRECT, HOME, PUBLIC_ROUTES, UNRESTRICTED_ROUTES } from '@/lib/routes';

const { auth } = NextAuth(authConfig);

// Falls back to next-auth's default JWT session cookie name (see defaultCookies() in
// @auth/core/lib/utils/cookie.js) when authConfig doesn't override it - `__Secure-` prefixed on
// HTTPS, and possibly split into `.0`, `.1`, ... chunks if the encoded token is large. `.includes`
// (not `startsWith`) so both variants match. Reads from authConfig rather than hardcoding so this
// stays correct if the cookie name is ever customized there.
const SESSION_COOKIE_MARKER = authConfig.cookies?.sessionToken?.name ?? 'authjs.session-token';

export function redirectForRoute(req: NextAuthRequest): NextResponse {
  const { nextUrl } = req;
  const isPublicRoute = PUBLIC_ROUTES.includes(nextUrl.pathname);
  const isUnrestrictedRoute = UNRESTRICTED_ROUTES.includes(nextUrl.pathname);
  const isAuthenticated = hasValidSession(req.auth);

  if (isPublicRoute && isAuthenticated) {
    return NextResponse.redirect(new URL(DEFAULT_REDIRECT, nextUrl));
  }
  if (!isPublicRoute && !isUnrestrictedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL(HOME, nextUrl));
  }
  return NextResponse.next();
}

// Server Components (AppProviders, Navbar, backendFetch) can't clear cookies at all - this
// middleware is the only point in the request that's allowed to, so a session that failed to
// refresh for good gets cleared here rather than left to linger and keep decoding as broken.
function clearStaleSessionCookie(req: NextAuthRequest, response: NextResponse): void {
  for (const cookie of req.cookies.getAll()) {
    if (cookie.name.includes(SESSION_COOKIE_MARKER)) {
      response.cookies.delete(cookie.name);
    }
  }
}

export const proxy = auth((req) => {
  const response = redirectForRoute(req);

  if (req.auth?.error) {
    clearStaleSessionCookie(req, response);
  }

  return response;
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*|static).*)',
  ],
};
