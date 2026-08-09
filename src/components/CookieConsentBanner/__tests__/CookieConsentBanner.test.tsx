import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CookieConsentBanner } from '@/components/CookieConsentBanner';
import { acknowledgeCookieConsent } from '@/lib/actions/cookieConsent';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock('@/components', () => ({
  Button: jest.requireActual('@/components/Button').Button,
}));

jest.mock('@/lib/actions/cookieConsent', () => ({ acknowledgeCookieConsent: jest.fn() }));

const mockedAcknowledgeCookieConsent = acknowledgeCookieConsent as jest.Mock;

describe('CookieConsentBanner', () => {
  beforeEach(() => {
    mockedAcknowledgeCookieConsent.mockReset();
  });

  it('does not render when the visitor has already acknowledged the notice', () => {
    render(<CookieConsentBanner initialAcknowledged />);

    expect(screen.queryByText('message')).not.toBeInTheDocument();
  });

  it('shows the notice with a link to the cookie policy when not yet acknowledged', () => {
    render(<CookieConsentBanner initialAcknowledged={false} />);

    expect(screen.getByText('message', { exact: false })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'learnMore' })).toHaveAttribute('href', '/legal/cookie-policy');
  });

  it('hides itself and persists the consent when acknowledged', async () => {
    mockedAcknowledgeCookieConsent.mockResolvedValue(undefined);
    render(<CookieConsentBanner initialAcknowledged={false} />);

    fireEvent.click(screen.getByRole('button', { name: 'acknowledge' }));

    expect(screen.queryByText('message', { exact: false })).not.toBeInTheDocument();
    await waitFor(() => expect(mockedAcknowledgeCookieConsent).toHaveBeenCalled());
  });
});
