import { render, screen } from '@testing-library/react';
import { ReactNode } from 'react';
import { LoginForm } from '@/components/LoginForm';

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
});
