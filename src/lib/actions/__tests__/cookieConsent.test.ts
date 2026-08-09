/**
 * @jest-environment node
 */
import { cookies } from 'next/headers';
import { acknowledgeCookieConsent, hasAcknowledgedCookieConsent } from '@/lib/actions/cookieConsent';

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}));

const mockedCookies = cookies as unknown as jest.Mock;

describe('hasAcknowledgedCookieConsent', () => {
  it('returns true when the cookie_consent cookie is present', async () => {
    mockedCookies.mockResolvedValue({ has: jest.fn().mockReturnValue(true) });

    await expect(hasAcknowledgedCookieConsent()).resolves.toBe(true);
  });

  it('returns false when the cookie_consent cookie is absent', async () => {
    mockedCookies.mockResolvedValue({ has: jest.fn().mockReturnValue(false) });

    await expect(hasAcknowledgedCookieConsent()).resolves.toBe(false);
  });
});

describe('acknowledgeCookieConsent', () => {
  it('sets the cookie_consent cookie with a one-year expiry', async () => {
    const set = jest.fn();
    mockedCookies.mockResolvedValue({ set });

    await acknowledgeCookieConsent();

    expect(set).toHaveBeenCalledWith('cookie_consent', expect.any(String), { maxAge: 60 * 60 * 24 * 365 });
  });
});
