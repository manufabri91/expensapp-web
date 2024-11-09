'use client';
import { useActionState } from 'react';

import styles from './loginForm.module.css';
import Link from 'next/link';
import { handleLogin } from '@/lib/actions/auth';
import { Button, ButtonVariant } from '@/components';
import { Alert, TextInput } from 'flowbite-react';

const LoginForm = () => {
  const [state, formAction] = useActionState(handleLogin, undefined);

  return (
    <>
      <div className={styles.wrapper}>
        {state?.error && <Alert className={styles.error}>{state.error}</Alert>}
        <form className={styles.form} action={formAction}>
          <TextInput type="text" placeholder="Email" name="email" />
          <TextInput type="password" placeholder="Password" name="password" />
          <Button variant={ButtonVariant.Primary} type="submit">
            Login
          </Button>
        </form>
        <Link href="/register" className={styles.link}>
          Don&apos;t have an account? <b>Register</b>
        </Link>
      </div>
    </>
  );
};

export default LoginForm;
