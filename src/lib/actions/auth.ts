'use server';
import { signIn, signOut } from '@/lib/auth';
import { register } from '@/lib/auth/handlers';
import { RegisterError } from '@/types/exceptions/RegisterError';
import { UnreachableLoginError } from '@/types/exceptions/unreachableLogin';
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
type ActionState = { error: string | null; payload?: FormData, succeded: boolean } | void;

export const handleRegisterAction = async (_: unknown, formData: FormData): Promise<ActionState> => {
  const { email, password, userName, passwordRepeat, firstName, lastName } = Object.fromEntries(
    formData
  ) as RegisterUserData;
  if (password !== passwordRepeat) {
    return { error: 'Passwords do not match', payload: formData, succeded: false };
  }
  try {
    await register(userName, email, password, firstName, lastName);
    await signIn('credentials', { email, password, redirectTo: '/dashboard' });
    return { succeded: true, error: null, payload: formData };
  } catch (err: unknown) {
    if (err instanceof RegisterError) {
      return { error: err.message, payload: formData, succeded: false  };
    } else if (err instanceof Error && err.message === 'NEXT_REDIRECT') {
      throw err;
    }
    return { error: 'Registration failed', payload: formData, succeded: false };
  }
};

export const handleLoginAction = async (_: unknown, formData: FormData): Promise<ActionState> => {
  const { email, password } = Object.fromEntries(formData);

  try {
    await signIn('credentials', { email, password, redirectTo: '/dashboard' });
    return { error: null, payload: formData, succeded: true  };
  } catch (err: unknown) {
    if (err instanceof UnreachableLoginError) {
      return { error: 'Login service unavailable', payload: formData, succeded: false  };
    }  else if (err instanceof CredentialsSigninError) {
      return { error: 'Wrong credentials', payload: formData, succeded: false  };
    }  else if (err instanceof Error && err.message === 'NEXT_REDIRECT') {
      throw err;
    }
    return { error: 'Login failed', payload: formData, succeded: false };
  }
};
