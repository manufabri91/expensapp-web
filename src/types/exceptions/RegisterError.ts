import type { RegistrationErrorCode } from './registrationSignin';

export class RegisterError extends Error {
  constructor(public reason: RegistrationErrorCode) {
    super(`System.ERRORS.${reason}`);
    this.name = 'RegisterError';
  }
}
