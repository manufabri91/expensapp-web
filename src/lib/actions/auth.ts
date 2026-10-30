'use server';
import { CredentialsSignin as CredentialsSigninError } from 'next-auth';
import { getTranslations } from 'next-intl/server';
import { signIn, signOut } from '@/lib/auth';
import { LoginFormValues, loginSchema, RegisterFormValues, registerSchema } from '@/schemas/auth';
import { RegistrationSigninError } from '@/types/exceptions/registrationSignin';
import { UnreachableLoginError } from '@/types/exceptions/unreachableLogin';

export const handleLogoutAction = async () => {
  await signOut({ redirectTo: '/' });
};

type ActionState = { error: string | null; succeded: boolean; recovery?: 'sign-in' } | void;

export const handleRegisterAction = async (data: RegisterFormValues): Promise<ActionState> => {
  const t = await getTranslations();
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    return { error: t('System.ERRORS.INVALID_DATA_PROVIDED'), succeded: false };
  }
  const { email, password, userName, firstName, lastName, acceptedTerms } = parsed.data;
  try {
    await signIn('register', {
      userName,
      email,
      password,
      firstName,
      lastName,
      acceptedTerms,
      redirectTo: '/dashboard',
    });
    return { succeded: true, error: null };
  } catch (err: unknown) {
    if (err instanceof RegistrationSigninError) {
      const recovery = err.code === 'ACCOUNT_CREATED_SIGN_IN_REQUIRED' || err.code === 'REGISTRATION_OUTCOME_UNKNOWN';
      return {
        error: t(`System.ERRORS.${err.code}`),
        succeded: false,
        ...(recovery ? { recovery: 'sign-in' as const } : {}),
      };
    } else if (err instanceof Error && err.message === 'NEXT_REDIRECT') {
      throw err;
    } else if (err instanceof UnreachableLoginError) {
      return { error: t('System.ERRORS.SERVICE_UNAVAILABLE'), succeded: false };
    }
    return { error: t('System.ERRORS.REGISTRATION_OUTCOME_UNKNOWN'), succeded: false, recovery: 'sign-in' };
  }
};

export const handleLoginAction = async (data: LoginFormValues): Promise<ActionState> => {
  const t = await getTranslations();
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) {
    return { error: t('System.ERRORS.INVALID_DATA_PROVIDED'), succeded: false };
  }
  const { email, password } = parsed.data;

  try {
    await signIn('credentials', { email, password, redirectTo: '/dashboard' });
    return { error: null, succeded: true };
  } catch (err: unknown) {
    if (err instanceof UnreachableLoginError) {
      return { error: t('System.ERRORS.SERVICE_UNAVAILABLE'), succeded: false };
    } else if (err instanceof CredentialsSigninError) {
      return { error: t('System.ERRORS.WRONG_CREDENTIALS'), succeded: false };
    } else if (err instanceof Error && err.message === 'NEXT_REDIRECT') {
      throw err;
    }
    return { error: t('System.ERRORS.LOGIN_FAILED'), succeded: false };
  }
};
