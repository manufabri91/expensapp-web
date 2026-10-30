/**
 * @jest-environment node
 */
import { handleRegisterAction } from '@/lib/actions/auth';
import { signIn } from '@/lib/auth';
import { register } from '@/lib/auth/handlers';
import { RegisterFormValues } from '@/schemas/auth';
import { RegistrationSigninError } from '@/types/exceptions/registrationSignin';

jest.mock('@/lib/auth', () => ({
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

jest.mock('@/lib/auth/handlers', () => ({
  register: jest.fn(),
}));

jest.mock('next-intl/server', () => ({
  getTranslations: async () => (key: string) => key,
}));

const mockedSignIn = signIn as jest.Mock;
const mockedRegister = register as jest.Mock;

const buildRegisterData = (overrides: Partial<RegisterFormValues> = {}): RegisterFormValues => ({
  email: 'john@example.com',
  password: 'password1',
  passwordRepeat: 'password1',
  userName: 'johndoe123',
  firstName: 'John',
  lastName: 'Doe',
  remember: false,
  acceptedTerms: true,
  ...overrides,
});

describe('handleRegisterAction', () => {
  beforeEach(() => {
    mockedRegister.mockReset();
    mockedSignIn.mockReset();
  });

  it('returns an INVALID_DATA_PROVIDED error without registering when the terms checkbox is unchecked', async () => {
    const result = await handleRegisterAction(buildRegisterData({ acceptedTerms: false }));

    expect(result?.error).toBe('System.ERRORS.INVALID_DATA_PROVIDED');
    expect(mockedRegister).not.toHaveBeenCalled();
  });

  it('registers with acceptedTerms: true and signs in when the checkbox is checked', async () => {
    mockedRegister.mockResolvedValue(undefined);
    mockedSignIn.mockResolvedValue(undefined);

    const result = await handleRegisterAction(buildRegisterData());

    expect(mockedRegister).not.toHaveBeenCalled();
    expect(mockedSignIn).toHaveBeenCalledWith(
      'register',
      expect.objectContaining({
        email: 'john@example.com',
        acceptedTerms: true,
        redirectTo: '/dashboard',
      })
    );
    expect(result?.succeded).toBe(true);
  });

  it.each(['ACCOUNT_CREATED_SIGN_IN_REQUIRED', 'REGISTRATION_OUTCOME_UNKNOWN'] as const)(
    'offers sign-in recovery for %s',
    async (code) => {
      mockedSignIn.mockRejectedValue(new RegistrationSigninError(code));
      const result = await handleRegisterAction(buildRegisterData());
      expect(result).toEqual({ error: `System.ERRORS.${code}`, succeded: false, recovery: 'sign-in' });
    }
  );

  it('preserves the Auth.js redirect after session creation', async () => {
    mockedSignIn.mockRejectedValue(new Error('NEXT_REDIRECT'));
    await expect(handleRegisterAction(buildRegisterData())).rejects.toThrow('NEXT_REDIRECT');
  });
});
