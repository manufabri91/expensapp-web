'use client';

import { Alert, Checkbox, Form, InputGroup, Label, Modal, TextField } from '@heroui/react';
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
      <Modal.Header>
        <Modal.Heading>{isLoginMode ? t('login.title') : t('register.title')}</Modal.Heading>
      </Modal.Header>
      <Form action={action}>
      <Modal.Body className="flex w-full flex-col gap-4">
        {error && (
          <Alert status="danger">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>{error}.</Alert.Title>
            </Alert.Content>
          </Alert>
        )}
        {!isLoginMode && (
          <>
            <TextField
              name="firstName"
              isRequired
              defaultValue={(formData?.get('firstName') || '') as string}
              fullWidth
            >
              <Label>{t('form.name')}</Label>
              <InputGroup variant="secondary">
                <InputGroup.Input type="text" />
              </InputGroup>
            </TextField>
            <TextField name="lastName" isRequired defaultValue={(formData?.get('lastName') || '') as string} fullWidth>
              <Label>{t('form.surname')}</Label>
              <InputGroup variant="secondary">
                <InputGroup.Input type="text" />
              </InputGroup>
            </TextField>
            <TextField name="userName" isRequired defaultValue={(formData?.get('userName') || '') as string} fullWidth>
              <Label>{t('form.username')}</Label>
              <InputGroup variant="secondary">
                <InputGroup.Input type="text" />
              </InputGroup>
            </TextField>
          </>
        )}
        <TextField name="email" isRequired defaultValue={(formData?.get('email') || '') as string} fullWidth>
          <Label>{t('form.email')}</Label>
          <InputGroup variant="secondary">
            {isLoginMode && (
              <InputGroup.Prefix>
                <HiEnvelope />
              </InputGroup.Prefix>
            )}
            <InputGroup.Input type="email" placeholder="john_doe@email.com" />
          </InputGroup>
        </TextField>
        <TextField name="password" isRequired defaultValue={(formData?.get('password') || '') as string} fullWidth>
          <Label>{t('form.password')}</Label>
          <InputGroup variant="secondary">
            {isLoginMode && (
              <InputGroup.Prefix>
                <HiKey />
              </InputGroup.Prefix>
            )}
            <InputGroup.Input type={isVisible ? 'text' : 'password'} />
            <InputGroup.Suffix>
              <button
                aria-label="toggle password visibility"
                className="outline-transparent focus:outline-solid"
                type="button"
                onClick={toggleVisibility}
              >
                {isVisible ? <HiEyeSlash className="text-2xl" /> : <HiEye className="text-2xl" />}
              </button>
            </InputGroup.Suffix>
          </InputGroup>
        </TextField>
        {!isLoginMode && (
          <TextField
            name="passwordRepeat"
            isRequired
            defaultValue={(formData?.get('passwordRepeat') || '') as string}
            fullWidth
          >
            <Label>{t('form.confirmPassword')}</Label>
            <InputGroup variant="secondary">
              <InputGroup.Input type="password" />
            </InputGroup>
          </TextField>
        )}
        {isLoginMode && (
          <div className="flex justify-between">
            <Checkbox name="remember" variant="secondary">
              <Checkbox.Content>
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                <span>{t('form.rememberMe')}</span>
              </Checkbox.Content>
            </Checkbox>
            <Link
              href="/auth/forgot-password"
              onClick={() => callback()}
              className="text-sm text-cyan-700 hover:underline dark:text-cyan-500"
            >
              {t('form.forgotPassword')}
            </Link>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer className="flex w-full flex-col gap-3">
        <CTAButton handleLoginClicked={handleLoginClicked} isLoginMode={isLoginMode} />
        <div className="flex text-sm">
          {isLoginMode && (
            <>
              {t('form.noAccount')}
              <a
                onClick={() => setFormMode('register')}
                className="ml-1 text-cyan-700 hover:cursor-pointer hover:underline dark:text-cyan-500"
              >
                {t('form.createAccount')}
              </a>
            </>
          )}
          {!isLoginMode && (
            <>
              {t('form.alreadyHaveAccount')}
              <a
                onClick={() => setFormMode('login')}
                className="ml-1 text-cyan-700 hover:cursor-pointer hover:underline dark:text-cyan-500"
              >
                {t('form.login')}
              </a>
            </>
          )}
        </div>
      </Modal.Footer>
      </Form>
    </>
  );
};
