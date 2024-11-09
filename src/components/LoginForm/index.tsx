'use client';

import { Button, ButtonVariant } from '@/components/Button';
import { handleLogin, handleRegister } from '@/lib/actions/auth';
import { Label, TextInput } from 'flowbite-react';
import Link from 'next/link';
import { useActionState, useEffect, useState } from 'react';

interface Props {
  mode?: 'login' | 'register';
  callback?: () => void;
}

export const LoginForm = ({ mode = 'login', callback = () => {} }: Props) => {
  const [formMode, setFormMode] = useState(mode);
  const [loginState, login] = useActionState(handleLogin, undefined);
  const [registerState, register] = useActionState(handleRegister, undefined);
  const isLoginMode = formMode === 'login';

  useEffect(() => {
    if (loginState) {
      callback();
    }
    if (registerState) {
      callback();
    }
  }, [loginState, registerState, callback]);

  return (
    <form className="space-y-6" action={isLoginMode ? login : register}>
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
        <Button variant={ButtonVariant.Primary} className="w-full" type="submit">
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
