/**
 * @jest-environment node
 */
import { GET } from '@/app/api/privacy/export/route';
import { auth } from '@/lib/auth';

jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));

const mockedAuth = auth as unknown as jest.Mock;

describe('GET /api/privacy/export', () => {
  const originalApiUrl = process.env.API_URL;

  beforeEach(() => {
    process.env.API_URL = 'https://backend.test';
    global.fetch = jest.fn();
  });

  afterAll(() => {
    process.env.API_URL = originalApiUrl;
  });

  it('returns a 401 without calling the backend when there is no session', async () => {
    mockedAuth.mockResolvedValue(null);

    const response = await GET();

    expect(response.status).toBe(401);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('returns a 502 when the backend fetch throws', async () => {
    mockedAuth.mockResolvedValue({ user: { token: 'token-123' } });
    (global.fetch as jest.Mock).mockRejectedValue(new Error('network down'));

    const response = await GET();

    expect(response.status).toBe(502);
  });

  it('passes through the backend status when the response is not ok', async () => {
    mockedAuth.mockResolvedValue({ user: { token: 'token-123' } });
    (global.fetch as jest.Mock).mockResolvedValue(
      new Response(JSON.stringify({ message: 'Unexpected' }), { status: 500 })
    );

    const response = await GET();

    expect(response.status).toBe(500);
  });

  it('streams the export back as a downloadable JSON attachment on success', async () => {
    mockedAuth.mockResolvedValue({ user: { token: 'token-123' } });
    (global.fetch as jest.Mock).mockResolvedValue(
      new Response(JSON.stringify({ email: 'owner@example.com' }), { status: 200 })
    );

    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json');
    expect(response.headers.get('Content-Disposition')).toMatch(/^attachment; filename="my-data-\d{4}-\d{2}-\d{2}\.json"$/);
    expect(await response.json()).toEqual({ email: 'owner@example.com' });
  });

  it('includes an AbortSignal-based timeout on the outgoing request', async () => {
    mockedAuth.mockResolvedValue({ user: { token: 'token-123' } });
    (global.fetch as jest.Mock).mockResolvedValue(new Response('{}', { status: 200 }));

    await GET();

    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });
});
