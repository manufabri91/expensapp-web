'use client';

import { CTAButton } from '@/components/LoginForm/components/CTAButton';
import { handleLoginAction, handleRegisterAction } from '@/lib/actions/auth';
import { HiInformationCircle } from 'react-icons/hi2';
import { Alert, Label, TextInput } from 'flowbite-react';
import Link from 'next/link';
import { useActionState, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

type FormMode = 'login' | 'register';

interface Props {
  mode?: FormMode;
  callback?: () => void;
}

export const LoginForm = ({ mode = 'login', callback = () => {} }: Props) => {
  const t = useTranslations('Auth');
  const [formMode, setFormMode] = useState<FormMode>(mode);
  const isLoginMode = formMode === 'login';
  const actionFn = isLoginMode ? handleLoginAction : handleRegisterAction;
  const [actionState, action] = useActionState(actionFn, null);
  const [error, setError] = useState<string | null>(null);
  const formData = actionState && actionState.payload;

  useEffect(() => {
    setError(null);
  }, [formMode]);

  useEffect(() => {
    if (actionState?.succeded) {
      setError(null);
      callback();
    } else if (actionState?.error) {
      setError(actionState.error);
    }
  }, [actionState, callback]);

  const handleLoginClicked = () => {
    setError(null);
  };

  return (
    <form className="space-y-6" action={action}>
      {error && (
        <Alert color="failure" icon={HiInformationCircle}>
          {error}.
        </Alert>
      )}
      <h3 className="text-xl font-medium text-gray-900 dark:text-white">
        {isLoginMode ? t('login.title') : t('register.title')}
      </h3>
      {!isLoginMode && (
        <>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="firstName" value={t('form.name')} />
            </div>
            <TextInput
              id="firstName"
              name="firstName"
              placeholder="John"
              defaultValue={(formData?.get('firstName') || '') as string}
              required
            />
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="lastName" value={t('form.surname')} />
            </div>
            <TextInput
              id="lastName"
              name="lastName"
              placeholder="Doe"
              defaultValue={(formData?.get('lastName') || '') as string}
              required
            />
          </div>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="userName" value={t('form.username')} />
            </div>
            <TextInput
              id="userName"
              name="userName"
              placeholder="john.doe"
              defaultValue={(formData?.get('userName') || '') as string}
              required
            />
          </div>
        </>
      )}
      <div>
        <div className="mb-2 block">
          <Label htmlFor="email" value={t('form.email')} />
        </div>
        <TextInput
          id="email"
          name="email"
          placeholder="john_doe@email.com"
          defaultValue={(formData?.get('email') || '') as string}
          required
        />
      </div>
      <div>
        <div className="mb-2 block">
          <Label htmlFor="password" value={t('form.password')} />
        </div>
        <TextInput
          id="password"
          type="password"
          name="password"
          defaultValue={(formData?.get('password') || '') as string}
          required
        />
      </div>
      {!isLoginMode && (
        <>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="passwordRepeat" value={t('form.confirmPassword')} />
            </div>
            <TextInput
              id="passwordRepeat"
              type="password"
              name="passwordRepeat"
              defaultValue={(formData?.get('passwordRepeat') || '') as string}
              required
            />
          </div>
        </>
      )}
      <div className="flex justify-between">
        {/* TODO: Implement rembember me cookiy and password recovery features 
              <div className="flex items-center gap-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember">Remember me</Label>
              </div>
              */}
        {isLoginMode && (
          <Link
            href="/auth/forgot-password"
            onClick={() => callback()}
            className="text-sm text-cyan-700 hover:underline dark:text-cyan-500"
          >
            {t('form.forgotPassword')}
          </Link>
        )}
      </div>
      <div className="w-full">
        <CTAButton handleLoginClicked={handleLoginClicked} isLoginMode={isLoginMode} />
      </div>
      {isLoginMode && (
        <div className="flex justify-between text-sm font-medium text-gray-500 dark:text-gray-300">
          {t('form.noAccount')}
          <a onClick={() => setFormMode('register')} className="text-cyan-700 hover:underline dark:text-cyan-500">
            {t('form.createAccount')}
          </a>
        </div>
      )}
      {!isLoginMode && (
        <div className="flex justify-between text-sm font-medium text-gray-500 dark:text-gray-300">
          {t('form.alreadyHaveAccount')}
          <a onClick={() => setFormMode('login')} className="text-cyan-700 hover:underline dark:text-cyan-500">
            {t('form.login')}
          </a>
        </div>
      )}
    </form>
  );
};
