import { CredentialsSignin } from 'next-auth';

export type RegistrationErrorCode =
  | 'USER_EXISTS'
  | 'INVALID_DATA_PROVIDED'
  | 'SERVICE_UNAVAILABLE'
  | 'ACCOUNT_CREATED_SIGN_IN_REQUIRED'
  | 'REGISTRATION_OUTCOME_UNKNOWN';

export class RegistrationSigninError extends CredentialsSignin {
  constructor(public code: RegistrationErrorCode) {
    super();
  }
}
