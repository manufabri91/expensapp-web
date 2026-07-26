import { NextRequest, NextResponse } from 'next/server';
import { authenticatedBackendFetch } from '@/lib/api/authenticatedBackendFetch';

type tParams = Promise<{ year: string }>;

export const GET = async (_: NextRequest, { params }: { params: tParams }) => {
  const { year } = await params;

  const result = await authenticatedBackendFetch(`/summary/${year}`);
  if (!result.ok) {
    return result.response;
  }
  return NextResponse.json(result.data);
};
