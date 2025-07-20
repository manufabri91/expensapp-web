'use client';

import { CTAButton } from '@/components/LoginForm/components/CTAButton';
import { handleLoginAction, handleRegisterAction } from '@/lib/actions/auth';
import { HiInformationCircle } from 'react-icons/hi2';
import { Alert, Label, TextInput } from 'flowbite-react';
import Link from 'next/link';
import { useActionState, useEffect, useState } from 'react';

type FormMode = 'login' | 'register';

interface Props {
  mode?: FormMode;
  callback?: () => void;
}

export const LoginForm = ({ mode = 'login', callback = () => {} }: Props) => {
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
          <span className="font-medium">Whoops!</span> {error}.
        </Alert>
      )}
      <h3 className="text-xl font-medium text-gray-900 dark:text-white">{isLoginMode ? 'Sign in' : 'Register'}</h3>
      {!isLoginMode && (
        <>
          <div>
            <div className="mb-2 block">
              <Label htmlFor="firstName" value="First Name" />
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
              <Label htmlFor="lastName" value="Last Name" />
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
              <Label htmlFor="userName" value="Username" />
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
          <Label htmlFor="email" value="Your email" />
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
          <Label htmlFor="password" value="Your password" />
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
              <Label htmlFor="passwordRepeat" value="Repeat password" />
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
            Forgot Password?
          </Link>
        )}
      </div>
      <div className="w-full">
        <CTAButton handleLoginClicked={handleLoginClicked} isLoginMode={isLoginMode} />
      </div>
      {isLoginMode && (
        <div className="flex justify-between text-sm font-medium text-gray-500 dark:text-gray-300">
          Not registered?&nbsp;
          <a onClick={() => setFormMode('register')} className="text-cyan-700 hover:underline dark:text-cyan-500">
            Create account
          </a>
        </div>
      )}
      {!isLoginMode && (
        <div className="flex justify-between text-sm font-medium text-gray-500 dark:text-gray-300">
          Already registered?&nbsp;
          <a onClick={() => setFormMode('login')} className="text-cyan-700 hover:underline dark:text-cyan-500">
            Log in
          </a>
        </div>
      )}
    </form>
  );
};
