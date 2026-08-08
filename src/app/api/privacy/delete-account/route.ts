import { NextResponse } from 'next/server';
import { authenticatedBackendFetch } from '@/lib/api/authenticatedBackendFetch';

export const DELETE = async () => {
  const result = await authenticatedBackendFetch('/privacy/account', { method: 'DELETE' });
  if (!result.ok) {
    return result.response;
  }
  return NextResponse.json({ deleted: true });
};
