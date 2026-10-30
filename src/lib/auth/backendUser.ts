import { jwtDecode } from 'jwt-decode';
import type { User } from 'next-auth';
import { z } from 'zod';

const authenticationResponseSchema = z.object({
  userId: z.string().min(1),
  username: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.email(),
  token: z.string().min(1),
  refreshToken: z.string().min(1),
  tokenExpiresIn: z.string().min(1),
});

const accessClaimsSchema = z.object({
  user_id: z.string().min(1),
  email: z.email(),
  email_verified: z.boolean(),
  roles: z.array(z.string()),
  exp: z
    .number()
    .finite()
    .refine((expiry) => expiry * 1000 > Date.now()),
});

// Call only with a response fetched from the backend, never client-submitted claims.
export const backendUser = (payload: unknown): User => {
  const tokens = authenticationResponseSchema.parse(payload);
  const claims = accessClaimsSchema.parse(jwtDecode(tokens.token));
  if (claims.user_id !== tokens.userId || claims.email !== tokens.email) {
    throw new Error('Authentication identity mismatch');
  }
  return {
    id: claims.user_id,
    tokens,
    user: {
      userId: claims.user_id,
      validatedUser: claims.email_verified,
      email: claims.email,
      username: tokens.username,
      firstName: tokens.firstName,
      lastName: tokens.lastName,
      roles: claims.roles,
      token: tokens.token,
    },
    validity: { valid_until: claims.exp },
  };
};
