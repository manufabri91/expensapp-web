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

  // AppProviders (src/lib/providers/index.tsx) calls auth() directly and then Promise.all's
  // three server actions, each of which independently calls auth() again via backendFetch.
  // next-auth's auth() has no request-level memoization (verified directly in
  // node_modules/next-auth/lib/index.js), so a single page load fires several concurrent jwt()
  // invocations. Without dedup, each one independently calls refresh() with the same
  // refreshToken, racing the backend's token-rotation and wasting calls.
  it('dedupes concurrent refresh attempts for the same refresh token into a single backend call', async () => {
    const newValidUntil = Math.floor(Date.now() / 1000) + 3600;
    let resolveRefresh: (value: unknown) => void = () => {};
    mockedRefresh.mockReturnValue(
      new Promise((resolve) => {
        resolveRefresh = resolve;
      })
    );
    mockedJwtDecode.mockReturnValue({ exp: newValidUntil });

    // Two separate concurrent invocations (as AppProviders' Promise.all would produce), both
    // carrying the same refreshToken.
    const callA = call({ token: expiredToken() });
    const callB = call({ token: expiredToken() });

    resolveRefresh({
      ok: true,
      json: async () => ({ token: 'new-access-token', refreshToken: 'new-refresh-token' }),
    });
    const [resultA, resultB] = await Promise.all([callA, callB]);

    expect(mockedRefresh).toHaveBeenCalledTimes(1);
    expect(resultA.data.user.token).toBe('new-access-token');
    expect(resultB.data.user.token).toBe('new-access-token');
  });

  it('treats a refresh response missing a usable token string as a failure instead of throwing', async () => {
    const token = expiredToken();
    mockedRefresh.mockResolvedValue({
      ok: true,
      json: async () => ({ refreshToken: 'new-refresh-token' }), // no `token` field
    });

    const result = await call({ token });

    expect(result.error).toBe('RefreshAccessTokenError');
    expect(mockedJwtDecode).not.toHaveBeenCalled();
  });

  it('allows a later refresh for the same refresh token once a prior in-flight attempt has settled', async () => {
    mockedRefresh.mockResolvedValueOnce({ ok: false });
    const first = await call({ token: expiredToken() });
    expect(first.error).toBe('RefreshTokenExpired');

    mockedRefresh.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: 'new-access-token', refreshToken: 'new-refresh-token' }),
    });
    mockedJwtDecode.mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 });
    const second = await call({ token: expiredToken() });

    expect(mockedRefresh).toHaveBeenCalledTimes(2);
    expect(second.data.user.token).toBe('new-access-token');
  });
});
