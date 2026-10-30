import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { LoginForm } from '@/components/LoginForm';
import { handleLoginAction, handleRegisterAction } from '@/lib/actions/auth';

jest.mock('next-intl', () => ({
  useTranslations: () => {
    const t = (key: string) => key;
    t.rich = (_key: string, values: Record<string, (chunks: ReactNode) => ReactNode>) => (
      <>
        {values.terms('Terms of Use')} and {values.privacy('Privacy Policy')}
      </>
    );
    return t;
  },
}));

jest.mock('@/lib/actions/auth', () => ({
  handleLoginAction: jest.fn(),
  handleRegisterAction: jest.fn(),
}));

describe('LoginForm in register mode', () => {
  const mockedHandleRegisterAction = handleRegisterAction as jest.Mock;

  beforeEach(() => {
    mockedHandleRegisterAction.mockReset();
    (handleLoginAction as jest.Mock).mockReset();
  });

  it('requires the terms checkbox and links to the Terms of Use and Privacy Policy pages', () => {
    render(<LoginForm mode="register" />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeRequired();
    expect(screen.getByRole('link', { name: 'Terms of Use' })).toHaveAttribute('href', '/legal/terms-of-use');
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/legal/privacy-policy');
  });

  it('does not show the terms checkbox in login mode', () => {
    render(<LoginForm mode="login" />);

    expect(screen.queryByRole('checkbox', { name: /Terms of Use/ })).not.toBeInTheDocument();
  });

  it('submits registration only once while the first request is still pending', async () => {
    let resolveRegistration: (value: { error: null; succeded: boolean }) => void;
    mockedHandleRegisterAction.mockReturnValue(
      new Promise((resolve) => {
        resolveRegistration = resolve;
      })
    );

    const { container } = render(<LoginForm mode="register" />);
    const inputs = container.querySelectorAll('input');
    fireEvent.change(inputs[0], { target: { value: 'Test' } });
    fireEvent.change(inputs[1], { target: { value: 'User' } });
    fireEvent.change(inputs[2], { target: { value: 'TestUser1234' } });
    fireEvent.change(inputs[3], { target: { value: 'test@example.com' } });
    fireEvent.change(inputs[4], { target: { value: 'Test1234!' } });
    fireEvent.change(inputs[5], { target: { value: 'Test1234!' } });
    fireEvent.click(inputs[6]);

    const form = container.querySelector('form');
    if (!form) throw new Error('Registration form was not rendered');
    fireEvent.submit(form);
    fireEvent.submit(form);

    await waitFor(() => expect(mockedHandleRegisterAction).toHaveBeenCalledTimes(1));
    expect(screen.getByRole('button', { name: 'form.loading' })).toBeDisabled();

    await act(async () => {
      resolveRegistration!({ error: null, succeded: true });
    });
  });

  it.each(['ACCOUNT_CREATED_SIGN_IN_REQUIRED', 'REGISTRATION_OUTCOME_UNKNOWN'])(
    'offers sign-in with only the email preserved after %s',
    async (code) => {
      mockedHandleRegisterAction.mockResolvedValue({
        succeded: false,
        error: `System.ERRORS.${code}`,
        recovery: 'sign-in',
      });
      const { container } = render(<LoginForm mode="register" />);
      const values = ['Test', 'User', 'TestUser1234', 'test@example.com', 'Test1234!', 'Test1234!'];
      const inputs = container.querySelectorAll('input');
      values.forEach((value, index) => fireEvent.change(inputs[index], { target: { value } }));
      fireEvent.click(inputs[6]);
      fireEvent.submit(container.querySelector('form')!);

      await waitFor(() => expect(screen.getByText('login.title')).toBeInTheDocument());
      expect(screen.getByText(`System.ERRORS.${code}`)).toBeInTheDocument();
      expect(container.querySelector('input[type="email"]')).toHaveValue('test@example.com');
      expect(container.querySelector('input[type="password"]')).toHaveValue('');
      expect(mockedHandleRegisterAction).toHaveBeenCalledTimes(1);
      expect(handleLoginAction).not.toHaveBeenCalled();
    }
  );
});
