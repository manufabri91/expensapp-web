import { NextRequest, NextResponse } from 'next/server';
import { authenticatedBackendFetch } from '@/lib/api/authenticatedBackendFetch';

type tParams = Promise<{ id: string; action: string }>;

const ALLOWED_ACTIONS = ['pause', 'resume', 'cancel'];

export const PATCH = async (_: NextRequest, { params }: { params: tParams }) => {
  const { id, action } = await params;
  if (!ALLOWED_ACTIONS.includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 404 });
  }

  const result = await authenticatedBackendFetch(`/recurrent-transaction/${id}/${action}`, { method: 'PATCH' });
  if (!result.ok) {
    return result.response;
  }
  return NextResponse.json(result.data);
};
