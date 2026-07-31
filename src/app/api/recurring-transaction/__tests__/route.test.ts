/**
 * @jest-environment node
 */
import { NextRequest, NextResponse } from 'next/server';
import { GET, POST } from '@/app/api/recurring-transaction/route';
import { authenticatedBackendFetch } from '@/lib/api/authenticatedBackendFetch';

jest.mock('@/lib/api/authenticatedBackendFetch', () => ({ authenticatedBackendFetch: jest.fn() }));

const mockedAuthenticatedBackendFetch = authenticatedBackendFetch as jest.Mock;

describe('GET /api/recurring-transaction', () => {
  it('returns the list from the backend', async () => {
    mockedAuthenticatedBackendFetch.mockResolvedValue({ ok: true, status: 200, data: [{ id: 1 }] });

    const response = await GET();

    expect(mockedAuthenticatedBackendFetch).toHaveBeenCalledWith('/recurrent-transaction');
    expect(await response.json()).toEqual([{ id: 1 }]);
  });

  it('returns the backend failure response as-is', async () => {
    const failureResponse = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    mockedAuthenticatedBackendFetch.mockResolvedValue({ ok: false, response: failureResponse });

    const response = await GET();

    expect(response).toBe(failureResponse);
  });
});

describe('POST /api/recurring-transaction', () => {
  it('forwards the request body to the backend and returns the created recurrence', async () => {
    mockedAuthenticatedBackendFetch.mockResolvedValue({ ok: true, status: 201, data: { id: 1 } });
    const payload = { description: 'Streaming subscription' };
    const request = new NextRequest('http://localhost/api/recurring-transaction', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const response = await POST(request);

    expect(mockedAuthenticatedBackendFetch).toHaveBeenCalledWith('/recurrent-transaction', {
      method: 'POST',
      body: payload,
    });
    expect(await response.json()).toEqual({ id: 1 });
  });

  it('returns the backend failure response as-is', async () => {
    const failureResponse = NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    mockedAuthenticatedBackendFetch.mockResolvedValue({ ok: false, response: failureResponse });
    const request = new NextRequest('http://localhost/api/recurring-transaction', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);

    expect(response).toBe(failureResponse);
  });
});
