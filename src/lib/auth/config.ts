import CredentialsProvider from 'next-auth/providers/credentials';
import type { User, UserObject, AuthValidity, DecodedJWT, BackendJWT, NextAuthConfig } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import { jwtDecode } from 'jwt-decode';

import { login, refresh } from '@/lib/auth/handlers';

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
          const tokens: BackendJWT = await res.json();
          if (!res.ok) throw tokens;

          const access: DecodedJWT = jwtDecode(tokens.token);
          // Extract the user from the access token
          const user: UserObject = {
            userId: access.user_id,
            validatedUser: access.email_verified,
            email: access.email,
            username: tokens.username,
            firstName: tokens.firstName,
            lastName: tokens.lastName,
            roles: access.roles,
          };
          // Extract the auth validity from the tokens
          const validity: AuthValidity = {
            valid_until: access.exp,
          };
          // Return the object that next-auth calls 'User'
          // (which we've defined in next-auth.d.ts)
          return {
            id: access.user_id,
            tokens: tokens,
            user: user,
            validity: validity,
          } as User;
        } catch (error) {
          console.error(error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      return url.startsWith(baseUrl) ? Promise.resolve(url) : Promise.resolve(baseUrl);
    },
    async jwt({ token, user, account }) {
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
      return { ...token, error: 'RefreshTokenExpired' } as JWT;
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
