'use client';

import { Alert, Checkbox, FieldError, InputGroup, Label, Modal, TextField } from '@heroui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { HiEnvelope, HiEye, HiEyeSlash, HiKey } from 'react-icons/hi2';
import { CTAButton } from '@/components/LoginForm/components/CTAButton';
import { handleLoginAction, handleRegisterAction } from '@/lib/actions/auth';
import { LoginFormValues, loginSchema, RegisterFormValues, registerSchema } from '@/schemas/auth';

type FormMode = 'login' | 'register';

interface Props {
  mode?: FormMode;
  callback?: () => void;
}

const loginDefaultValues: LoginFormValues = { email: '', password: '', remember: false };
const registerDefaultValues: RegisterFormValues = {
  ...loginDefaultValues,
  firstName: '',
  lastName: '',
  userName: '',
  passwordRepeat: '',
};

export const LoginForm = ({ mode = 'login', callback = () => {} }: Props) => {
  const t = useTranslations('Auth');
  const tValidation = useTranslations();
  const [formMode, setFormMode] = useState<FormMode>(mode);

  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);
  const isLoginMode = formMode === 'login';
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<LoginFormValues | RegisterFormValues>({
    resolver: zodResolver(isLoginMode ? loginSchema : registerSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: isLoginMode ? loginDefaultValues : registerDefaultValues,
  });

  useEffect(() => {
    setError(null);
    reset(isLoginMode ? loginDefaultValues : registerDefaultValues);
  }, [formMode, isLoginMode, reset]);

  const onValid = async (data: LoginFormValues | RegisterFormValues) => {
    const actionResult = isLoginMode
      ? await handleLoginAction(data as LoginFormValues)
      : await handleRegisterAction(data as RegisterFormValues);

    if (actionResult?.succeded) {
      setError(null);
      callback();
    } else if (actionResult?.error) {
      setError(actionResult.error);
    }
  };

  const handleLoginClicked = () => {
    setError(null);
  };

  return (
    <>
      <Modal.Header>
        <Modal.Heading>
          <span>{isLoginMode ? t('login.title') : t('register.title')}</span>
          {error && (
            <Alert status="danger" className="mt-4">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>{error}.</Alert.Title>
              </Alert.Content>
            </Alert>
          )}
        </Modal.Heading>
      </Modal.Header>
      <form onSubmit={handleSubmit(onValid)}>
        <Modal.Body className="flex w-full flex-col gap-4 py-4">
          {!isLoginMode && (
            <>
              <Controller
                control={control}
                name="firstName"
                render={({ field, fieldState }) => (
                  <TextField isRequired fullWidth isInvalid={fieldState.invalid} value={field.value} onChange={field.onChange} onBlur={field.onBlur}>
                    <Label>{t('form.name')}</Label>
                    <InputGroup variant="secondary">
                      <InputGroup.Input type="text" />
                    </InputGroup>
                    {fieldState.error?.message && <FieldError>{tValidation(fieldState.error.message)}</FieldError>}
                  </TextField>
                )}
              />
              <Controller
                control={control}
                name="lastName"
                render={({ field, fieldState }) => (
                  <TextField isRequired fullWidth isInvalid={fieldState.invalid} value={field.value} onChange={field.onChange} onBlur={field.onBlur}>
                    <Label>{t('form.surname')}</Label>
                    <InputGroup variant="secondary">
                      <InputGroup.Input type="text" />
                    </InputGroup>
                    {fieldState.error?.message && <FieldError>{tValidation(fieldState.error.message)}</FieldError>}
                  </TextField>
                )}
              />
              <Controller
                control={control}
                name="userName"
                render={({ field, fieldState }) => (
                  <TextField isRequired fullWidth isInvalid={fieldState.invalid} value={field.value} onChange={field.onChange} onBlur={field.onBlur}>
                    <Label>{t('form.username')}</Label>
                    <InputGroup variant="secondary">
                      <InputGroup.Input type="text" />
                    </InputGroup>
                    {fieldState.error?.message && <FieldError>{tValidation(fieldState.error.message)}</FieldError>}
                  </TextField>
                )}
              />
            </>
          )}
          <Controller
            control={control}
            name="email"
            render={({ field, fieldState }) => (
              <TextField isRequired fullWidth isInvalid={fieldState.invalid} value={field.value} onChange={field.onChange} onBlur={field.onBlur}>
                <Label>{t('form.email')}</Label>
                <InputGroup variant="secondary">
                  {isLoginMode && (
                    <InputGroup.Prefix>
                      <HiEnvelope />
                    </InputGroup.Prefix>
                  )}
                  <InputGroup.Input type="email" placeholder="john_doe@email.com" />
                </InputGroup>
                {fieldState.error?.message && <FieldError>{tValidation(fieldState.error.message)}</FieldError>}
              </TextField>
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field, fieldState }) => (
              <TextField isRequired fullWidth isInvalid={fieldState.invalid} value={field.value} onChange={field.onChange} onBlur={field.onBlur}>
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
                {fieldState.error?.message && <FieldError>{tValidation(fieldState.error.message)}</FieldError>}
              </TextField>
            )}
          />
          {!isLoginMode && (
            <Controller
              control={control}
              name="passwordRepeat"
              render={({ field, fieldState }) => (
                <TextField isRequired fullWidth isInvalid={fieldState.invalid} value={field.value} onChange={field.onChange} onBlur={field.onBlur}>
                  <Label>{t('form.confirmPassword')}</Label>
                  <InputGroup variant="secondary">
                    <InputGroup.Input type="password" />
                  </InputGroup>
                  {fieldState.error?.message && <FieldError>{tValidation(fieldState.error.message)}</FieldError>}
                </TextField>
              )}
            />
          )}
          {isLoginMode && (
            <div className="flex justify-between">
              <Controller
                control={control}
                name="remember"
                render={({ field }) => (
                  <Checkbox variant="secondary" isSelected={field.value} onChange={field.onChange}>
                    <Checkbox.Content>
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                      <span>{t('form.rememberMe')}</span>
                    </Checkbox.Content>
                  </Checkbox>
                )}
              />
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
          <CTAButton handleLoginClicked={handleLoginClicked} isLoginMode={isLoginMode} isSubmitting={isSubmitting} />
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
      </form>
    </>
  );
};
