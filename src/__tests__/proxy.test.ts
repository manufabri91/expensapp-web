/**
 * @jest-environment node
 */
import type { NextAuthRequest } from 'next-auth';
import { redirectForRoute } from '@/proxy';

const fakeRequest = (pathname: string, isAuthenticated: boolean): NextAuthRequest =>
  ({
    nextUrl: new URL(`https://example.com${pathname}`),
    auth: isAuthenticated ? { user: { token: 'token' }, expires: '' } : null,
  }) as unknown as NextAuthRequest;

describe('redirectForRoute', () => {
  it('redirects an authenticated user away from a public auth route', () => {
    const response = redirectForRoute(fakeRequest('/auth/signin', true));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('https://example.com/dashboard');
  });

  it('redirects an unauthenticated user away from a protected route', () => {
    const response = redirectForRoute(fakeRequest('/dashboard', false));

    expect(response.status).toBe(307);
    expect(response.headers.get('location')).toBe('https://example.com/');
  });

  it('lets an unauthenticated visitor reach a legal page without redirecting', () => {
    const response = redirectForRoute(fakeRequest('/legal/privacy-policy', false));

    expect(response.status).toBe(200);
  });

  // This is the bug the UNRESTRICTED_ROUTES/PUBLIC_ROUTES split fixes: legal pages must stay
  // reachable for a logged-in user, unlike PUBLIC_ROUTES (e.g. /auth/signin), which bounces an
  // authenticated visitor straight to /dashboard.
  it('lets an authenticated user reach a legal page without bouncing them to the dashboard', () => {
    const response = redirectForRoute(fakeRequest('/legal/terms-of-use', true));

    expect(response.status).toBe(200);
  });

  it('allows an authenticated user through on a protected route', () => {
    const response = redirectForRoute(fakeRequest('/dashboard', true));

    expect(response.status).toBe(200);
  });
});
