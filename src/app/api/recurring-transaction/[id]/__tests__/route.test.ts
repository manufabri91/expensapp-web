/**
 * @jest-environment node
 */
import { NextRequest, NextResponse } from 'next/server';
import { DELETE, GET, PUT } from '@/app/api/recurring-transaction/[id]/route';
import { authenticatedBackendFetch } from '@/lib/api/authenticatedBackendFetch';

jest.mock('@/lib/api/authenticatedBackendFetch', () => ({ authenticatedBackendFetch: jest.fn() }));

const mockedAuthenticatedBackendFetch = authenticatedBackendFetch as jest.Mock;

const callWithId = <T>(handler: (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => Promise<T>, id: string, req?: NextRequest) =>
  handler(req ?? ({} as NextRequest), { params: Promise.resolve({ id }) });

describe('GET /api/recurring-transaction/[id]', () => {
  it('fetches the recurrence by id', async () => {
    mockedAuthenticatedBackendFetch.mockResolvedValue({ ok: true, status: 200, data: { id: 1 } });

    const response = await callWithId(GET, '1');

    expect(mockedAuthenticatedBackendFetch).toHaveBeenCalledWith('/recurrent-transaction/1');
    expect(await response.json()).toEqual({ id: 1 });
  });

  it('returns the backend failure response as-is', async () => {
    const failureResponse = NextResponse.json({ error: 'Not found' }, { status: 404 });
    mockedAuthenticatedBackendFetch.mockResolvedValue({ ok: false, response: failureResponse });

    const response = await callWithId(GET, '999');

    expect(response).toBe(failureResponse);
  });
});

describe('PUT /api/recurring-transaction/[id]', () => {
  it('forwards the request body to the backend', async () => {
    mockedAuthenticatedBackendFetch.mockResolvedValue({ ok: true, status: 200, data: { id: 1 } });
    const payload = { description: 'Updated' };
    const request = new NextRequest('http://localhost/api/recurring-transaction/1', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    const response = await callWithId(PUT, '1', request);

    expect(mockedAuthenticatedBackendFetch).toHaveBeenCalledWith('/recurrent-transaction/1', {
      method: 'PUT',
      body: payload,
    });
    expect(await response.json()).toEqual({ id: 1 });
  });

  it('returns the backend failure response as-is', async () => {
    const failureResponse = NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    mockedAuthenticatedBackendFetch.mockResolvedValue({ ok: false, response: failureResponse });
    const request = new NextRequest('http://localhost/api/recurring-transaction/1', {
      method: 'PUT',
      body: JSON.stringify({}),
    });

    const response = await callWithId(PUT, '1', request);

    expect(response).toBe(failureResponse);
  });
});

describe('DELETE /api/recurring-transaction/[id]', () => {
  it('deletes the recurrence and confirms', async () => {
    mockedAuthenticatedBackendFetch.mockResolvedValue({ ok: true, status: 200, data: null });

    const response = await callWithId(DELETE, '1');

    expect(mockedAuthenticatedBackendFetch).toHaveBeenCalledWith('/recurrent-transaction/1', { method: 'DELETE' });
    expect(await response.json()).toEqual({ deleted: true });
  });

  it('returns the backend failure response as-is', async () => {
    const failureResponse = NextResponse.json({ error: 'Not found' }, { status: 404 });
    mockedAuthenticatedBackendFetch.mockResolvedValue({ ok: false, response: failureResponse });

    const response = await callWithId(DELETE, '999');

    expect(response).toBe(failureResponse);
  });
});
