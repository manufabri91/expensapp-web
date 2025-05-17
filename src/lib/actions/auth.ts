'use server';
import { signIn, signOut } from '@/lib/auth';
import { register } from '@/lib/auth/handlers';
import { RegisterError } from '@/types/exceptions/RegisterError';
import { CredentialsSignin as CredentialsSigninError } from 'next-auth';

export const handleLogoutAction = async () => {
  await signOut({ redirectTo: '/' });
};

type RegisterUserData = {
  email: string;
  password: string;
  userName: string;
  passwordRepeat: string;
  firstName: string;
  lastName: string;
};
type ActionState = { error: string | null; payload?: FormData } | void;

export const handleRegisterAction = async (_: unknown, formData: FormData): Promise<ActionState> => {
  const { email, password, userName, passwordRepeat, firstName, lastName } = Object.fromEntries(
    formData
  ) as RegisterUserData;
  if (password !== passwordRepeat) {
    return { error: 'Passwords do not match', payload: formData };
  }
  try {
    await register(userName, email, password, firstName, lastName);
    return { error: null, payload: formData };
  } catch (err: unknown) {
    if (err instanceof RegisterError) {
      return { error: err.message, payload: formData };
    }
  }
};

export const handleLoginAction = async (_: unknown, formData: FormData): Promise<ActionState> => {
  const { email, password } = Object.fromEntries(formData);

  try {
    await signIn('credentials', { email, password, redirectTo: '/dashboard' });
    return { error: null, payload: formData };
  } catch (err: unknown) {
    if (err instanceof CredentialsSigninError) {
      return { error: 'Wrong credentials', payload: formData };
    }
    throw err;
  }
};
