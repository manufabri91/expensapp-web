/**
 * @jest-environment node
 */
import { handleRegisterAction } from '@/lib/actions/auth';
import { signIn } from '@/lib/auth';
import { register } from '@/lib/auth/handlers';

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

const buildFormData = (overrides: Record<string, string> = {}, includeAcceptedTerms = true) => {
  const formData = new FormData();
  formData.set('email', 'john@example.com');
  formData.set('password', 'password1');
  formData.set('passwordRepeat', 'password1');
  formData.set('userName', 'johndoe');
  formData.set('firstName', 'John');
  formData.set('lastName', 'Doe');
  if (includeAcceptedTerms) {
    formData.set('acceptedTerms', 'on');
  }
  Object.entries(overrides).forEach(([key, value]) => formData.set(key, value));
  return formData;
};

describe('handleRegisterAction', () => {
  beforeEach(() => {
    mockedRegister.mockReset();
    mockedSignIn.mockReset();
  });

  it('returns a TERMS_NOT_ACCEPTED error without registering when the checkbox is unchecked', async () => {
    const result = await handleRegisterAction(null, buildFormData({}, false));

    expect(result?.error).toBe('System.ERRORS.TERMS_NOT_ACCEPTED');
    expect(mockedRegister).not.toHaveBeenCalled();
  });

  it('registers with acceptedTerms: true and signs in when the checkbox is checked', async () => {
    mockedRegister.mockResolvedValue(undefined);
    mockedSignIn.mockResolvedValue(undefined);

    const result = await handleRegisterAction(null, buildFormData());

    expect(mockedRegister).toHaveBeenCalledWith('johndoe', 'john@example.com', 'password1', 'John', 'Doe', true);
    expect(result?.succeded).toBe(true);
  });
});
