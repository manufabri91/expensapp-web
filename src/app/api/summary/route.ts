import { NextRequest, NextResponse } from 'next/server';
import { authenticatedBackendFetch } from '@/lib/api/authenticatedBackendFetch';

export const GET = async (request: NextRequest) => {
  const result = await authenticatedBackendFetch('/summary', {
    searchParams: request.nextUrl.searchParams,
  });
  if (!result.ok) {
    return result.response;
  }
  return NextResponse.json(result.data);
};
