import { NextRequest, NextResponse } from 'next/server';
import { authenticatedBackendFetch } from '@/lib/api/authenticatedBackendFetch';

export const GET = async () => {
  const result = await authenticatedBackendFetch('/category');
  if (!result.ok) {
    return result.response;
  }
  return NextResponse.json(result.data);
};

export const POST = async (req: NextRequest) => {
  const payload = await req.json();
  const result = await authenticatedBackendFetch('/category', {
    method: 'POST',
    body: payload,
  });
  if (!result.ok) {
    return result.response;
  }
  return NextResponse.json(result.data);
};
