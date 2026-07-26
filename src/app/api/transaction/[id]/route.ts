import { NextRequest, NextResponse } from 'next/server';
import { authenticatedBackendFetch } from '@/lib/api/authenticatedBackendFetch';

type tParams = Promise<{ id: string }>;

export const GET = async (_: NextRequest, { params }: { params: tParams }) => {
  const { id } = await params;

  const result = await authenticatedBackendFetch(`/transaction/${id}`);
  if (!result.ok) {
    return result.response;
  }
  return NextResponse.json(result.data);
};

export const PUT = async (req: NextRequest, { params }: { params: tParams }) => {
  const { id } = await params;
  const payload = await req.json();

  const result = await authenticatedBackendFetch(`/transaction/${id}`, {
    method: 'PUT',
    body: payload,
  });
  if (!result.ok) {
    return result.response;
  }
  return NextResponse.json(result.data);
};

export const DELETE = async (_: NextRequest, { params }: { params: tParams }) => {
  const { id } = await params;

  const result = await authenticatedBackendFetch(`/transaction/${id}`, { method: 'DELETE' });
  if (!result.ok) {
    return result.response;
  }
  return NextResponse.json({ deleted: true });
};
