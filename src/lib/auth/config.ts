import { jwtDecode } from 'jwt-decode';
import { type Account, type BackendAccessJWT, type DecodedJWT, type NextAuthConfig, type User } from 'next-auth';
import { AdapterUser } from 'next-auth/adapters';
import type { JWT } from 'next-auth/jwt';

import { refresh } from '@/lib/auth/handlers';
import { loginProvider, registrationProvider } from './credentialProviders';

const doRefresh = async (token: JWT): Promise<JWT> => {
  try {
    const response = await refresh(token.data.tokens.refreshToken);

    if (!response.ok) {
      // The backend rejected the refresh token itself (e.g. expired/invalidated),
      // so the user needs to sign in again.
      console.error(`[auth:refresh] backend rejected refresh token (status ${response.status})`);
      return { ...token, error: 'RefreshTokenExpired' };
    }

    const newTokens: BackendAccessJWT = await response.json();
    // The backend can 200 a shape without a usable token during a refresh-token-rotation race
    // (see the dedup in refreshAccessToken below for the common cause). jwtDecode throws on
    // anything that isn't a string, which is indistinguishable from other failures here - check
    // explicitly so this reads as the specific case it is, both in behavior and in logs.
    if (typeof newTokens?.token !== 'string') {
      console.error('[auth:refresh] backend response was ok but had no usable token string');
      return { ...token, error: 'RefreshAccessTokenError' };
    }
    const access: DecodedJWT = jwtDecode(newTokens.token);

    return {
      ...token,
      data: {
        ...token.data,
        tokens: { ...token.data.tokens, ...newTokens },
        user: { ...token.data.user, token: newTokens.token },
        validity: { valid_until: access.exp },
      },
    };
  } catch {
    // Network/timeout failure while calling the refresh endpoint
    console.error('[auth:refresh] refresh request or response processing failed');
    return { ...token, error: 'RefreshAccessTokenError' };
  }
};

// AppProviders renders auth() directly and then Promise.all's three server actions, each of
// which calls auth() again via backendFetch - next-auth's auth() has no request-level
// memoization, so a single page load can fire several concurrent jwt() invocations. Without
// this, each one would independently call refresh() with the same refreshToken, racing the
// backend's token rotation and occasionally getting back a response for a token another
// concurrent call already consumed. Keying on the refresh token (rather than a single global
// in-flight slot) lets unrelated sessions refresh independently.
const inFlightRefreshes = new Map<string, Promise<JWT>>();

const refreshAccessToken = (token: JWT): Promise<JWT> => {
  const refreshToken = token.data.tokens.refreshToken;
  const inFlight = inFlightRefreshes.get(refreshToken);
  if (inFlight) return inFlight;

  const attempt = doRefresh(token).finally(() => {
    inFlightRefreshes.delete(refreshToken);
  });
  inFlightRefreshes.set(refreshToken, attempt);
  return attempt;
};

export const authConfig: NextAuthConfig = {
  // No explicit `secret` here: @auth/core reads `AUTH_SECRET` from the environment directly when
  // `secret` is left unset - the idiomatic next-auth v5 convention, and what `.env.example`/
  // `src/env.ts` actually document/validate (a previous `secret: process.env.NEXTAUTH_SECRET`
  // line only "worked" because that var was never set, silently triggering the same fallback).
  session: { strategy: 'jwt' },
  providers: [loginProvider, registrationProvider],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;

      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;

      return baseUrl;
    },
    async jwt({ token, user, account }: { token: JWT; user?: User | AdapterUser; account?: Account | null }) {
      // Initial signin contains a 'User' object from authorize method. Explicitly clear any
      // `error` carried over from a previous (failed-refresh) session on this same browser -
      // otherwise a successful re-login would still be treated as errored/unauthenticated by
      // proxy.ts's isAuthenticated check until some later request happened to overwrite it.
      if (user && account) {
        return { ...token, data: user, error: undefined };
      }

      // The current access token is still valid, nothing to do
      if (token.data && Date.now() < token.data.validity.valid_until * 1000) {
        return token;
      }

      // Already flagged as unrecoverable on a previous request: don't retry the refresh
      // endpoint again on every subsequent request with a refresh token we already know is
      // dead. proxy.ts's isAuthenticated check reads this error and forces the user back to
      // login; a fresh sign-in produces a new token with no `error` field.
      if (token.error) {
        return token;
      }

      // The access token has expired: use the stored refresh token to get a new one
      return refreshAccessToken(token);
    },
    async session({ session, token, user }) {
      session.user = { ...token.data.user, ...user };
      session.validity = token.data.validity;
      session.error = token.error;
      return session;
    },
    // Route protection for this app lives in `src/proxy.ts` (an `authorized`
    // callback here would be dead code: NextAuth only enforces a boolean
    // `authorized` return value when `auth()` is used directly as middleware,
    // but proxy.ts calls `auth((req) => { ... })` with its own function, which
    // makes proxy.ts's own isAuthenticated/isPublicRoute checks the real gate).
  },
};
