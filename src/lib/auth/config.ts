import { jwtDecode } from 'jwt-decode';
import {
  type Account,
  type AuthValidity,
  type BackendAccessJWT,
  type BackendJWT,
  type DecodedJWT,
  type NextAuthConfig,
  type User,
  type UserObject,
} from 'next-auth';
import { AdapterUser } from 'next-auth/adapters';
import type { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';

import { login, refresh } from '@/lib/auth/handlers';
import { InvalidLoginError } from '@/types/exceptions/invalidLogin';
import { UnreachableLoginError } from '@/types/exceptions/unreachableLogin';

const refreshAccessToken = async (token: JWT): Promise<JWT> => {
  try {
    const response = await refresh(token.data.tokens.refreshToken);

    if (!response.ok) {
      // The backend rejected the refresh token itself (e.g. expired/invalidated),
      // so the user needs to sign in again.
      return { ...token, error: 'RefreshTokenExpired' };
    }

    const newTokens: BackendAccessJWT = await response.json();
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
  } catch (error) {
    // Network/timeout failure while calling the refresh endpoint
    console.error(error);
    return { ...token, error: 'RefreshAccessTokenError' };
  }
};

export const authConfig: NextAuthConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      name: 'Login',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'john@mail.com',
        },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          const res = await login((credentials?.email || '') as string, (credentials?.password || '') as string);

          if (!res?.ok) {
            console.error(res);
            // The backend's GlobalExceptionHandler maps InvalidLoginException (bad
            // credentials) to 401. 422 is returned for request validation failures on
            // the login payload, which is also invalid-login-shaped. 404 is the
            // generic "resource not found" status used across the whole API and isn't
            // login-specific, so it's intentionally left out here and falls through to
            // UnreachableLoginError below.
            if (res.status === 401 || res.status === 422) {
              throw new InvalidLoginError();
            }
            throw new UnreachableLoginError();
          }
          const responseData: BackendJWT = await res.json();

          const access: DecodedJWT = jwtDecode(responseData.token);
          // Extract the user from the access token
          const user: UserObject = {
            userId: access.user_id,
            validatedUser: access.email_verified,
            email: access.email,
            username: responseData.username,
            firstName: responseData.firstName,
            lastName: responseData.lastName,
            roles: access.roles,
            token: responseData.token,
          };
          // Extract the auth validity from the tokens
          const validity: AuthValidity = {
            valid_until: access.exp,
          };
          // Return the object that next-auth calls 'User'
          // (which we've defined in next-auth.d.ts)
          return {
            id: access.user_id,
            tokens: responseData,
            user: user,
            validity: validity,
          } as User;
        } catch (error) {
          console.error(error);
          if (
            error instanceof TypeError ||
            error instanceof SyntaxError ||
            (error instanceof DOMException && error.name === 'TimeoutError')
          ) {
            throw new UnreachableLoginError();
          }
          return null;
        }
      },
    }),
  ],
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
