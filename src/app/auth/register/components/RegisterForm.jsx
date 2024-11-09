'use client';
import { useFormState } from 'react-dom';

import styles from './registerForm.module.css';
import { handleRegister } from '@/lib/actions/auth';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const RegisterForm = () => {
  const [state, formAction] = useFormState(handleRegister, undefined);
  const router = useRouter();

  useEffect(() => {
    if (state?.userId) {
      router.push('/login');
    }
  }, [state?.userId, router]);

  return (
    <>
      <div className={styles.wrapper}>
        {state?.error && <div className={styles.error}>{state.error}</div>}
        <form className={styles.form} action={formAction}>
          <input type="text" placeholder="Username" name="username" />
          <input type="email" placeholder="Email" name="email" />
          <input type="password" placeholder="Password" name="password" />
          <input type="password" placeholder="Confirm Password" name="passwordRepeat" />
          <button type="submit">Register</button>
        </form>
        <Link href="/login" className={styles.link}>
          Already have an account? <b>Login</b>
        </Link>
      </div>
    </>
  );
};

export default RegisterForm;
