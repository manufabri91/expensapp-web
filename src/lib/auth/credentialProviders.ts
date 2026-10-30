import CredentialsProvider from 'next-auth/providers/credentials';
import { z } from 'zod';
import { registrationRequestSchema } from '@/schemas/auth';
import { InvalidLoginError } from '@/types/exceptions/invalidLogin';
import { RegisterError } from '@/types/exceptions/RegisterError';
import { RegistrationSigninError } from '@/types/exceptions/registrationSignin';
import { UnreachableLoginError } from '@/types/exceptions/unreachableLogin';
import { backendUser } from './backendUser';
import { login, register } from './handlers';

const loginCredentialsSchema = z.object({ email: z.email(), password: z.string().min(1) });

export const loginProvider = CredentialsProvider({
  name: 'Login',
  credentials: { email: { type: 'email' }, password: { type: 'password' } },
  async authorize(credentials) {
    const parsed = loginCredentialsSchema.safeParse(credentials);
    if (!parsed.success) throw new InvalidLoginError();
    try {
      const response = await login(parsed.data.email, parsed.data.password);
      if (response.status === 401 || response.status === 422) throw new InvalidLoginError();
      if (!response.ok) throw new UnreachableLoginError();
      return backendUser(await response.json());
    } catch (error) {
      if (error instanceof InvalidLoginError || error instanceof UnreachableLoginError) throw error;
      throw new UnreachableLoginError();
    }
  },
});

const registrationOutcomeSchema = z.object({
  registrationStatus: z.enum(['AUTHENTICATED', 'SIGN_IN_REQUIRED']).optional(),
  email: z.email(),
  token: z.string().nullish(),
  refreshToken: z.string().nullish(),
});

const registerUser = async (credentials: Partial<Record<string, unknown>>) => {
  const parsed = registrationRequestSchema.safeParse(credentials);
  if (!parsed.success) throw new RegistrationSigninError('INVALID_DATA_PROVIDED');
  const { userName, email, password, firstName, lastName, acceptedTerms } = parsed.data;
  const payload = await register(userName, email, password, firstName, lastName, acceptedTerms);
  const outcome = registrationOutcomeSchema.safeParse(payload);
  if (
    outcome.success &&
    (outcome.data.registrationStatus === 'SIGN_IN_REQUIRED' ||
      (!outcome.data.registrationStatus && !outcome.data.token && !outcome.data.refreshToken))
  ) {
    throw new RegistrationSigninError('ACCOUNT_CREATED_SIGN_IN_REQUIRED');
  }
  try {
    if (!outcome.success) throw new Error('Invalid registration response');
    return backendUser(payload);
  } catch {
    const confirmed = z.object({ registrationStatus: z.literal('AUTHENTICATED') }).safeParse(payload);
    throw new RegistrationSigninError(
      confirmed.success ? 'ACCOUNT_CREATED_SIGN_IN_REQUIRED' : 'REGISTRATION_OUTCOME_UNKNOWN'
    );
  }
};

export const registrationProvider = CredentialsProvider({
  id: 'register',
  name: 'Register',
  credentials: {
    email: {},
    password: {},
    userName: {},
    firstName: {},
    lastName: {},
    acceptedTerms: {},
  },
  async authorize(credentials) {
    try {
      return await registerUser(credentials);
    } catch (error) {
      if (error instanceof RegistrationSigninError) throw error;
      if (error instanceof RegisterError) throw new RegistrationSigninError(error.reason);
      throw new RegistrationSigninError('REGISTRATION_OUTCOME_UNKNOWN');
    }
  },
});
