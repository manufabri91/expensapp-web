/**
 * @jest-environment node
 */
import { authenticatedBackendFetch } from '@/lib/api/authenticatedBackendFetch';
import { auth } from '@/lib/auth';

jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));

const mockedAuth = auth as unknown as jest.Mock;

describe('authenticatedBackendFetch', () => {
  const originalApiUrl = process.env.API_URL;

  beforeEach(() => {
    process.env.API_URL = 'https://backend.test';
    global.fetch = jest.fn();
  });

  afterAll(() => {
    process.env.API_URL = originalApiUrl;
  });

  it('returns a 401 failure without calling the backend when there is no session', async () => {
    mockedAuth.mockResolvedValue(null);

    const result = await authenticatedBackendFetch('/account');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(401);
    }
    expect(global.fetch).not.toHaveBeenCalled();
  });

  // A session with `error` set (the jwt() callback in src/lib/auth/config.ts failed to refresh
  // the access token) still has a stale bearer token in session.user.token - sending it anyway
  // wastes a request the backend will 401 regardless. Same guard as backendFetch.ts (used by
  // server actions); this is the equivalent for the API-route helper.
  it('returns a 401 failure without calling the backend when the session has a refresh error', async () => {
    mockedAuth.mockResolvedValue({ error: 'RefreshAccessTokenError', user: { token: 'stale-token' } });

    const result = await authenticatedBackendFetch('/account');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(401);
    }
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('returns a 502 failure when the backend fetch itself throws (network/timeout failure)', async () => {
    mockedAuth.mockResolvedValue({ user: { token: 'token-123' } });
    (global.fetch as jest.Mock).mockRejectedValue(new Error('network down'));

    const result = await authenticatedBackendFetch('/account');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(502);
    }
  });

  it('passes through the backend status and error message when the response is not ok', async () => {
    mockedAuth.mockResolvedValue({ user: { token: 'token-123' } });
    (global.fetch as jest.Mock).mockResolvedValue(
      new Response(JSON.stringify({ message: 'Account not found' }), { status: 404 })
    );

    const result = await authenticatedBackendFetch('/account/1');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(404);
      const body = await result.response.json();
      expect(body.error).toBe('Account not found');
    }
  });

  it('returns parsed JSON data on success', async () => {
    mockedAuth.mockResolvedValue({ user: { token: 'token-123' } });
    (global.fetch as jest.Mock).mockResolvedValue(
      new Response(JSON.stringify({ id: 1, name: 'Checking' }), { status: 200 })
    );

    const result = await authenticatedBackendFetch<{ id: number; name: string }>('/account/1');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual({ id: 1, name: 'Checking' });
    }
  });

  it('treats an empty success body (e.g. a 200 DELETE with no content) as data: null, not a parse failure', async () => {
    mockedAuth.mockResolvedValue({ user: { token: 'token-123' } });
    (global.fetch as jest.Mock).mockResolvedValue(new Response('', { status: 200 }));

    const result = await authenticatedBackendFetch('/account/1');

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toBeNull();
    }
  });

  it('treats a non-empty but invalid JSON success body as a failure instead of silently returning data: null', async () => {
    mockedAuth.mockResolvedValue({ user: { token: 'token-123' } });
    (global.fetch as jest.Mock).mockResolvedValue(new Response('<html>not json</html>', { status: 200 }));

    const result = await authenticatedBackendFetch('/account/1');

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(502);
    }
  });

  it('includes an AbortSignal-based timeout on the outgoing request', async () => {
    mockedAuth.mockResolvedValue({ user: { token: 'token-123' } });
    (global.fetch as jest.Mock).mockResolvedValue(new Response('{}', { status: 200 }));

    await authenticatedBackendFetch('/account');

    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });
});
