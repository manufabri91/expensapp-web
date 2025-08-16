import CredentialsProvider from 'next-auth/providers/credentials';
import {
  type User,
  type UserObject,
  type AuthValidity,
  type DecodedJWT,
  type BackendJWT,
  type NextAuthConfig,
  type Account,
} from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import { jwtDecode } from 'jwt-decode';

import { login, refresh } from '@/lib/auth/handlers';
import { InvalidLoginError } from '@/types/exceptions/invalidLogin';
import { AdapterUser } from 'next-auth/adapters';
import { UnreachableLoginError } from '@/types/exceptions/unreachableLogin';

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
            if (res.status === 404 || res.status === 422) {
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
            (error instanceof Error && error.name === 'AbortError')
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
    async jwt({ token, user, account }: { token: JWT; user: User | AdapterUser; account: Account | null }) {
      // Initial signin contains a 'User' object from authorize method
      if (user && account) {
        console.debug('Initial signin');
        return { ...token, data: user };
      }

      // The current access token is still valid
      if (Date.now() < token.data.validity.valid_until * 1000) {
        console.debug('Access token is still valid');
        return token;
      }

      // The refresh token is still valid
      if (Date.now() < token.data.validity.valid_until * 1000) {
        console.debug('Access token is being refreshed');
        return (await refresh(user.tokens.refreshToken)).json();
      }

      // The current access token and refresh token have both expired
      // This should not really happen unless you get really unlucky with
      // the timing of the token expiration because the middleware should
      // have caught this case before the callback is called
      console.debug('Both tokens have expired');
      return null;
    },
    async session({ session, token, user }) {
      session.user = { ...token.data.user, ...user };
      session.validity = token.data.validity;
      session.error = token.error;
      return session;
    },
    authorized({ auth, request }) {
      const user = auth?.user;
      const isOnLoginPages = request.nextUrl?.pathname.startsWith('/auth/');
      const isOnHome = request.nextUrl?.pathname === '/';

      // ONLY USERS CAN ACCESS BLOGS PAGE
      if (!isOnHome && !user) {
        return false;
      }

      // ONLY UNAUTHORIZED USERS CAN ACCESS LOGIN PAGES
      if (isOnLoginPages && user) {
        return Response.redirect(new URL('/', request.nextUrl));
      }

      return true;
    },
  },
};
