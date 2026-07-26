import { NextRequest, NextResponse } from 'next/server';
import { authenticatedBackendFetch } from '@/lib/api/authenticatedBackendFetch';

type tParams = Promise<{ id: string }>;

export const GET = async (_: NextRequest, { params }: { params: tParams }) => {
  const { id } = await params;

  const result = await authenticatedBackendFetch(`/category/${id}/subcategories`);
  if (!result.ok) {
    return result.response;
  }
  return NextResponse.json(result.data);
};
