/**
 * @jest-environment node
 */
import { jwtDecode } from 'jwt-decode';
import type { Account, User } from 'next-auth';
import type { AdapterUser } from 'next-auth/adapters';
import type { JWT } from 'next-auth/jwt';
import { authConfig } from '@/lib/auth/config';
import { refresh } from '@/lib/auth/handlers';

jest.mock('@/lib/auth/handlers', () => ({
  login: jest.fn(),
  refresh: jest.fn(),
}));

jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn(),
}));

const mockedRefresh = refresh as unknown as jest.Mock;
const mockedJwtDecode = jwtDecode as unknown as jest.Mock;

// Mirrors the exact param shape config.ts's own jwt() callback destructures, rather than the
// full (much broader) NextAuth callback signature, which isn't relevant to what's under test.
type JwtCallbackParams = { token: JWT; user?: User | AdapterUser; account?: Account | null };
type JwtCallback = (params: JwtCallbackParams) => Promise<JWT | null>;

const jwtCallback = authConfig.callbacks!.jwt as unknown as JwtCallback;

const call = async (params: Partial<JwtCallbackParams>): Promise<JWT> => {
  const result = await jwtCallback(params as JwtCallbackParams);
  return result as JWT;
};

const expiredToken = (): JWT =>
  ({
    data: {
      tokens: { refreshToken: 'refresh-token-abc' },
      user: { token: 'old-access-token' },
      validity: { valid_until: Math.floor(Date.now() / 1000) - 60 },
    },
  }) as JWT;

describe('authConfig.callbacks.jwt', () => {
  beforeEach(() => {
    // authorize()/jwt() intentionally log expected failures (invalid login, refresh rejected,
    // refresh network error) via console.error - silence that expected noise in test output.
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('passes the token through unchanged when the access token is still valid', async () => {
    const token = {
      data: {
        tokens: { refreshToken: 'refresh-token-abc' },
        user: { token: 'still-valid' },
        validity: { valid_until: Math.floor(Date.now() / 1000) + 3600 },
      },
    } as JWT;

    const result = await call({ token });

    expect(result).toBe(token);
    expect(mockedRefresh).not.toHaveBeenCalled();
  });

  it('calls refresh() with the stored refresh token and applies the new tokens on success', async () => {
    const token = expiredToken();
    const newValidUntil = Math.floor(Date.now() / 1000) + 3600;
    mockedRefresh.mockResolvedValue({
      ok: true,
      json: async () => ({ token: 'new-access-token', refreshToken: 'new-refresh-token' }),
    });
    mockedJwtDecode.mockReturnValue({ exp: newValidUntil });

    const result = await call({ token });

    expect(mockedRefresh).toHaveBeenCalledWith('refresh-token-abc');
    expect(result.error).toBeUndefined();
    expect(result.data.user.token).toBe('new-access-token');
    expect(result.data.tokens.refreshToken).toBe('new-refresh-token');
    expect(result.data.validity.valid_until).toBe(newValidUntil);
  });

  it('sets error: RefreshTokenExpired when the backend rejects the refresh token, without throwing', async () => {
    const token = expiredToken();
    mockedRefresh.mockResolvedValue({ ok: false });

    const result = await call({ token });

    expect(result.error).toBe('RefreshTokenExpired');
    expect(result.data).toBe(token.data);
  });

  it('sets error: RefreshAccessTokenError when refresh() throws (network/timeout failure)', async () => {
    const token = expiredToken();
    mockedRefresh.mockRejectedValue(new Error('timeout'));

    const result = await call({ token });

    expect(result.error).toBe('RefreshAccessTokenError');
  });

  it('does not retry refresh() when token.error is already set from a previous request', async () => {
    const token = { ...expiredToken(), error: 'RefreshTokenExpired' } as JWT;

    const result = await call({ token });

    expect(result).toBe(token);
    expect(mockedRefresh).not.toHaveBeenCalled();
  });

  it('accepts a fresh sign-in (user + account present) even over a previously-errored token', async () => {
    const token = { error: 'RefreshTokenExpired' } as JWT;
    const user = { tokens: {}, user: { token: 'brand-new' }, validity: { valid_until: 123 } } as User;
    const account = {} as Account;

    const result = await call({ token, user, account });

    expect(result.data).toBe(user);
    expect(result.error).toBeUndefined();
    expect(mockedRefresh).not.toHaveBeenCalled();
  });
});
