'use client';

import { Alert } from '@heroui/alert';
import { Form } from '@heroui/form';
import { Input } from '@heroui/input';
import { ModalBody, ModalHeader } from '@heroui/modal';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useState } from 'react';
import { HiEnvelope, HiEye, HiEyeSlash, HiKey } from 'react-icons/hi2';
import { CTAButton } from '@/components/LoginForm/components/CTAButton';
import { handleLoginAction, handleRegisterAction } from '@/lib/actions/auth';

type FormMode = 'login' | 'register';

interface Props {
  mode?: FormMode;
  callback?: () => void;
}

export const LoginForm = ({ mode = 'login', callback = () => {} }: Props) => {
  const t = useTranslations('Auth');
  const [formMode, setFormMode] = useState<FormMode>(mode);

  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);
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
    <>
      <ModalHeader>{isLoginMode ? t('login.title') : t('register.title')}</ModalHeader>
      <ModalBody className="mb-4">
        {error && <Alert color="danger">{error}.</Alert>}
        <Form className="space-y-4" action={action}>
          {!isLoginMode && (
            <>
              <Input
                labelPlacement="outside-top"
                size="lg"
                fullWidth
                isRequired
                errorMessage="Please your name"
                label={t('form.name')}
                name="firstName"
                type="text"
                defaultValue={(formData?.get('firstName') || '') as string}
              />
              <Input
                labelPlacement="outside-top"
                size="lg"
                fullWidth
                isRequired
                errorMessage="Please enter your last name"
                label={t('form.surname')}
                name="lastName"
                defaultValue={(formData?.get('lastName') || '') as string}
                type="text"
              />
              <Input
                labelPlacement="outside-top"
                size="lg"
                fullWidth
                isRequired
                errorMessage="Please an username"
                label={t('form.username')}
                name="lastName"
                defaultValue={(formData?.get('userName') || '') as string}
                type="text"
              />
            </>
          )}
          <Input
            labelPlacement="outside-top"
            size="lg"
            fullWidth
            isRequired
            placeholder="john_doe@email.com"
            startContent={isLoginMode ? <HiEnvelope /> : undefined}
            errorMessage="Please a valid email"
            label={t('form.email')}
            name="email"
            defaultValue={(formData?.get('email') || '') as string}
            type="email"
          />
          <Input
            labelPlacement="outside-top"
            size="lg"
            fullWidth
            isRequired
            startContent={isLoginMode ? <HiKey /> : undefined}
            endContent={
              <button
                aria-label="toggle password visibility"
                className="outline-transparent focus:outline-solid"
                type="button"
                onClick={toggleVisibility}
              >
                {isVisible ? <HiEyeSlash className="text-2xl" /> : <HiEye className="text-2xl" />}
              </button>
            }
            errorMessage="Please a valid password"
            label={t('form.password')}
            name="password"
            defaultValue={(formData?.get('password') || '') as string}
            type={isVisible ? 'text' : 'password'}
          />
          {!isLoginMode && (
            <Input
              labelPlacement="outside-top"
              size="lg"
              fullWidth
              isRequired
              errorMessage="Please a valid password"
              label={t('form.confirmPassword')}
              name="passwordRepeat"
              defaultValue={(formData?.get('passwordRepeat') || '') as string}
              type="password"
            />
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
          <CTAButton handleLoginClicked={handleLoginClicked} isLoginMode={isLoginMode} />
          {isLoginMode && (
            <div className="flex justify-between text-sm font-medium text-gray-500 dark:text-gray-300">
              {t('form.noAccount')}
              <a
                onClick={() => setFormMode('register')}
                className="ml-1 text-cyan-700 hover:cursor-pointer hover:underline dark:text-cyan-500"
              >
                {t('form.createAccount')}
              </a>
            </div>
          )}
          {!isLoginMode && (
            <div className="flex justify-between text-sm font-medium text-gray-500 dark:text-gray-300">
              {t('form.alreadyHaveAccount')}
              <a
                onClick={() => setFormMode('login')}
                className="ml-1 text-cyan-700 hover:cursor-pointer hover:underline dark:text-cyan-500"
              >
                {t('form.login')}
              </a>
            </div>
          )}
        </Form>
      </ModalBody>
    </>
  );
};
