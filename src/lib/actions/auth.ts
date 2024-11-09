'use server';
import { signIn, signOut } from '@/lib/auth';
import { register } from '@/lib/auth/handlers';

export const handleLogout = async () => {
  await signOut({ redirectTo: '/' });
};

export const handleRegister = async (_: unknown, formData: FormData) => {
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
  } catch (error: any) {
    console.log(error);
    throw new Error(error);
  }
};

export const handleLogin = async (_: unknown, formData: FormData) => {
  const { email, password } = Object.fromEntries(formData);

  try {
    await signIn('credentials', { email, password });
  } catch (err: any) {
    if (err.message.includes('CredentialsSignin')) {
      return { error: 'Wrong credentials' };
    }
    throw err;
  }
};
