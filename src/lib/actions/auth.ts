'use server';
import { signIn, signOut } from '@/lib/auth';
import { register } from '@/lib/auth/handlers';
import { CredentialsSignin as CredentialsSigninError } from 'next-auth';

export const handleLogoutAction = async () => {
  await signOut({ redirectTo: '/' });
};

export const handleRegisterAction = async (
  _: unknown,
  formData: FormData
): Promise<void | { error: string | null }> => {
  const { email, password, username, passwordRepeat, firstName, lastName } = Object.fromEntries(formData) as {
    email: string;
    password: string;
    username: string;
    passwordRepeat: string;
    firstName: string;
    lastName: string;
  }; // TODO Improve this type
  if (password !== passwordRepeat) {
    return { error: 'Passwords do not match' };
  }
  try {
    await register(username, email, password, firstName, lastName);
    return { error: null };
  } catch (error: unknown) {
    console.log(error);
    throw error;
  }
};

export const handleLoginAction = async (_: unknown, formData: FormData): Promise<void | { error: string | null }> => {
  const { email, password } = Object.fromEntries(formData);

  try {
    await signIn('credentials', { email, password, redirectTo: '/dashboard' });
    return { error: null };
  } catch (err: unknown) {
    if (err instanceof CredentialsSigninError) {
      return { error: 'Wrong credentials' };
    }
    throw err;
  }
};
