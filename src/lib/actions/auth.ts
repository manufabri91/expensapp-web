'use server';
import { CredentialsSignin as CredentialsSigninError } from 'next-auth';
import { getTranslations } from 'next-intl/server';
import { signIn, signOut } from '@/lib/auth';
import { register } from '@/lib/auth/handlers';
import { RegisterError } from '@/types/exceptions/RegisterError';
import { UnreachableLoginError } from '@/types/exceptions/unreachableLogin';

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
type ActionState = { error: string | null; payload?: FormData; succeded: boolean } | void;

export const handleRegisterAction = async (_: unknown, formData: FormData): Promise<ActionState> => {
  const t = await getTranslations();
  const { email, password, userName, passwordRepeat, firstName, lastName } = Object.fromEntries(
    formData
  ) as RegisterUserData;
  if (password !== passwordRepeat) {
    return { error: t('System.ERRORS.PASSWORDS_NOT_MATCH'), payload: formData, succeded: false };
  }
  try {
    await register(userName, email, password, firstName, lastName);
    await signIn('credentials', { email, password, redirectTo: '/dashboard' });
    return { succeded: true, error: null, payload: formData };
  } catch (err: unknown) {
    if (err instanceof RegisterError) {
      return { error: t(err.message), payload: formData, succeded: false };
    } else if (err instanceof Error && err.message === 'NEXT_REDIRECT') {
      throw err;
    } else if (err instanceof UnreachableLoginError) {
      return { error: t('System.ERRORS.SERVICE_UNAVAILABLE'), payload: formData, succeded: false };
    }
    return { error: t('System.ERRORS.REGISTRATION_FAILED'), payload: formData, succeded: false };
  }
};

export const handleLoginAction = async (_: unknown, formData: FormData): Promise<ActionState> => {
  const t = await getTranslations();
  const { email, password } = Object.fromEntries(formData);

  try {
    await signIn('credentials', { email, password, redirectTo: '/dashboard' });
    return { error: null, payload: formData, succeded: true };
  } catch (err: unknown) {
    if (err instanceof UnreachableLoginError) {
      return { error: t('System.ERRORS.SERVICE_UNAVAILABLE'), payload: formData, succeded: false };
    } else if (err instanceof CredentialsSigninError) {
      return { error: t('System.ERRORS.WRONG_CREDENTIALS'), payload: formData, succeded: false };
    } else if (err instanceof Error && err.message === 'NEXT_REDIRECT') {
      throw err;
    }
    return { error: t('System.ERRORS.LOGIN_FAILED'), payload: formData, succeded: false };
  }
};
