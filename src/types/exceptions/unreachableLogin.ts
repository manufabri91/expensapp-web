import { CredentialsSignin } from 'next-auth';

export class UnreachableLoginError extends CredentialsSignin {
  code = 'Login service unavailable';
}
