import { NextResponse } from 'next/server';
import { authenticatedBackendFetch } from '@/lib/api/authenticatedBackendFetch';

export const GET = async () => {
  const result = await authenticatedBackendFetch('/summary/totals-by-category');
  if (!result.ok) {
    return result.response;
  }
  return NextResponse.json(result.data);
};
