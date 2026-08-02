/**
 * @jest-environment node
 */
import { NextRequest, NextResponse } from 'next/server';
import { PATCH } from '@/app/api/recurring-transaction/[id]/[action]/route';
import { authenticatedBackendFetch } from '@/lib/api/authenticatedBackendFetch';

jest.mock('@/lib/api/authenticatedBackendFetch', () => ({ authenticatedBackendFetch: jest.fn() }));

const mockedAuthenticatedBackendFetch = authenticatedBackendFetch as jest.Mock;

const callPatch = (id: string, action: string) =>
  PATCH({} as NextRequest, { params: Promise.resolve({ id, action }) });

describe('PATCH /api/recurring-transaction/[id]/[action]', () => {
  it.each(['pause', 'resume', 'cancel'])('forwards the "%s" action to the backend', async (action) => {
    mockedAuthenticatedBackendFetch.mockResolvedValue({ ok: true, status: 200, data: { id: 1, status: action } });

    const response = await callPatch('1', action);

    expect(mockedAuthenticatedBackendFetch).toHaveBeenCalledWith(`/recurrent-transaction/1/${action}`, {
      method: 'PATCH',
    });
    expect(response.status).toBe(200);
  });

  it('rejects an action outside the allow-list without calling the backend', async () => {
    const response = await callPatch('1', 'delete-everything');

    expect(mockedAuthenticatedBackendFetch).not.toHaveBeenCalled();
    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body.error).toBe('Invalid action');
  });

  it('returns the backend failure response as-is when the backend call fails', async () => {
    const failureResponse = NextResponse.json({ error: 'Not found' }, { status: 404 });
    mockedAuthenticatedBackendFetch.mockResolvedValue({ ok: false, response: failureResponse });

    const response = await callPatch('999', 'pause');

    expect(response).toBe(failureResponse);
  });
});
