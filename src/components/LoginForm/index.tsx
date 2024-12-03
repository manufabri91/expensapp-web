'use client';

import { Button, ButtonVariant } from '@/components/Button';
import { handleLoginAction, handleRegisterAction } from '@/lib/actions/auth';
import { Label, TextInput } from 'flowbite-react';
import Link from 'next/link';
import { useActionState, useEffect, useState } from 'react';

interface Props {
  mode?: 'login' | 'register';
  callback?: () => void;
}

export const LoginForm = ({ mode = 'login', callback = () => {} }: Props) => {
  const [formMode, setFormMode] = useState<'login' | 'register'>(mode);
  const [loginState, login] = useActionState(handleLoginAction, { error: null });
  const [registerState, register] = useActionState(handleRegisterAction, { error: null });
  const [error, setError] = useState<string | null>(null);
  const isLoginMode = formMode === 'login';

  useEffect(() => {
    const hasLoggedOrRegistered = !!loginState?.error && !!registerState?.error;
    const error = !!(loginState && loginState?.error) || !!(registerState && registerState?.error);
    if (error) {
      setError('Invalid username or password');
    } else if (hasLoggedOrRegistered) {
      setError(null);
      callback();
    }
  }, [loginState?.error, registerState?.error, callback, loginState, registerState]);

  const handleLoginClicked = () => {
    setError(null);
  };

  return (
    <form className="space-y-6" action={isLoginMode ? login : register}>
      {error && <div className="flex items-center justify-between">{error}</div>}
      <h3 className="text-xl font-medium text-gray-900 dark:text-white">{isLoginMode ? 'Sign in' : 'Register'}</h3>
      <div>
        <div className="mb-2 block">
          <Label htmlFor="email" value="Your email" />
        </div>
        <TextInput id="email" name="email" placeholder="name@company.com" required />
      </div>
      <div>
        <div className="mb-2 block">
          <Label htmlFor="password" value="Your password" />
        </div>
        <TextInput id="password" type="password" name="password" required />
      </div>
      <div className="flex justify-between">
        {/* TODO: Implement rembember me cookiy and password recovery features 
              <div className="flex items-center gap-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember">Remember me</Label>
              </div>
              */}
        <Link
          href="/auth/forgot-password"
          onClick={() => callback()}
          className="text-sm text-cyan-700 hover:underline dark:text-cyan-500"
        >
          Lost Password?
        </Link>
      </div>
      <div className="w-full">
        <Button variant={ButtonVariant.Primary} className="w-full" type="submit" onClick={handleLoginClicked}>
          {isLoginMode ? 'Log in to your account' : 'Register your account'}
        </Button>
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
