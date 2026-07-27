/**
 * @jest-environment node
 */
import { backendFetch } from '@/lib/api/backendFetch';
import { auth } from '@/lib/auth';
import { UnauthorizedError } from '@/types/exceptions/unauthorized';

jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));

const mockedAuth = auth as unknown as jest.Mock;

describe('backendFetch', () => {
  const originalApiUrl = process.env.API_URL;

  beforeEach(() => {
    process.env.API_URL = 'https://backend.test';
    global.fetch = jest.fn();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    process.env.API_URL = originalApiUrl;
  });

  it('throws UnauthorizedError without calling the backend when there is no session', async () => {
    mockedAuth.mockResolvedValue(null);

    await expect(backendFetch('/account')).rejects.toBeInstanceOf(UnauthorizedError);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  // A session carrying `error` (set by the jwt() callback in src/lib/auth/config.ts when a
  // refresh attempt failed) still has a stale/expired bearer token in session.user.token.
  // Sending it anyway wastes a request that's guaranteed to 401 and surfaces as a confusing
  // generic "Failed to fetch X" from the calling action instead of the real cause.
  it('throws UnauthorizedError without calling the backend when the session has a refresh error', async () => {
    mockedAuth.mockResolvedValue({ error: 'RefreshAccessTokenError', user: { token: 'stale-token' } });

    await expect(backendFetch('/account')).rejects.toBeInstanceOf(UnauthorizedError);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('throws a descriptive Error when the fetch itself fails (network/timeout failure)', async () => {
    mockedAuth.mockResolvedValue({ user: { token: 'token-123' } });
    (global.fetch as jest.Mock).mockRejectedValue(new Error('network down'));

    await expect(backendFetch('/account')).rejects.toThrow('Failed to reach backend service at /account');
  });

  it('returns the raw response on success, with the session token as the Authorization header', async () => {
    mockedAuth.mockResolvedValue({ user: { token: 'token-123' } });
    (global.fetch as jest.Mock).mockResolvedValue(new Response('{}', { status: 200 }));

    const response = await backendFetch('/account');

    expect(response.status).toBe(200);
    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(init.headers.Authorization).toBe('token-123');
  });
});
