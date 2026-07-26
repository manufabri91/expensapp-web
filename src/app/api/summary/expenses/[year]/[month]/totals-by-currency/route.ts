import { NextRequest, NextResponse } from 'next/server';
import { authenticatedBackendFetch } from '@/lib/api/authenticatedBackendFetch';

type tParams = Promise<{ year: string; month: string }>;

export const GET = async (_: NextRequest, { params }: { params: tParams }) => {
  const { year, month } = await params;

  const result = await authenticatedBackendFetch(`/summary/expenses/${year}/${month}/totals-by-currency`);
  if (!result.ok) {
    return result.response;
  }
  return NextResponse.json(result.data);
};
