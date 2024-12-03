import { CredentialsSignin } from 'next-auth';

export class InvalidLoginError extends CredentialsSignin {
  code = 'Invalid email or password';
}
