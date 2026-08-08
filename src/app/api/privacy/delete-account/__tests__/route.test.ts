/**
 * @jest-environment node
 */
import { NextResponse } from 'next/server';
import { DELETE } from '@/app/api/privacy/delete-account/route';
import { authenticatedBackendFetch } from '@/lib/api/authenticatedBackendFetch';

jest.mock('@/lib/api/authenticatedBackendFetch', () => ({ authenticatedBackendFetch: jest.fn() }));

const mockedAuthenticatedBackendFetch = authenticatedBackendFetch as jest.Mock;

describe('DELETE /api/privacy/delete-account', () => {
  it('deletes the account and confirms', async () => {
    mockedAuthenticatedBackendFetch.mockResolvedValue({ ok: true, status: 200, data: null });

    const response = await DELETE();

    expect(mockedAuthenticatedBackendFetch).toHaveBeenCalledWith('/privacy/account', { method: 'DELETE' });
    expect(await response.json()).toEqual({ deleted: true });
  });

  it('returns the backend failure response as-is', async () => {
    const failureResponse = NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    mockedAuthenticatedBackendFetch.mockResolvedValue({ ok: false, response: failureResponse });

    const response = await DELETE();

    expect(response).toBe(failureResponse);
  });
});
