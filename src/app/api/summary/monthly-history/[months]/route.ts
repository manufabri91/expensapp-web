import { NextRequest, NextResponse } from 'next/server';
import { authenticatedBackendFetch } from '@/lib/api/authenticatedBackendFetch';

type tParams = Promise<{ months: string }>;

export const GET = async (_: NextRequest, { params }: { params: tParams }) => {
  const { months } = await params;

  const result = await authenticatedBackendFetch(`/summary/monthly-history/${months}`);
  if (!result.ok) {
    return result.response;
  }
  return NextResponse.json(result.data);
};
