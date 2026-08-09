import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { hasValidSession, logSessionRefusal } from '@/lib/auth/session';

// Bulk data export aggregates every table the user owns (accounts, transactions, categories,
// subcategories, recurring transactions), so it can't reuse `authenticatedBackendFetch`'s
// hardcoded 2s timeout or its always-JSON `NextResponse.json` response shape - this needs a
// longer timeout and a `Content-Disposition` header so the browser downloads a file instead of
// rendering the JSON inline.
const EXPORT_TIMEOUT_MS = 10000;

export const GET = async () => {
  const session = await auth();
  if (!hasValidSession(session)) {
    logSessionRefusal('privacy/export', '/privacy/export', session);
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }

  let response: Response;
  try {
    response = await fetch(`${process.env.API_URL}/privacy/export`, {
      signal: AbortSignal.timeout(EXPORT_TIMEOUT_MS),
      headers: { Authorization: session.user.token },
    });
  } catch (error) {
    console.error('Failed to reach backend service at /privacy/export:', error);
    return NextResponse.json({ error: 'Failed to reach backend service' }, { status: 502 });
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    console.error(`Backend request to /privacy/export failed with status ${response.status}:`, errorBody);
    return NextResponse.json(
      { error: errorBody?.message || `Backend request failed with status ${response.status}` },
      { status: response.status },
    );
  }

  const body = await response.text();
  const fileDate = new Date().toISOString().split('T')[0];

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="my-data-${fileDate}.json"`,
    },
  });
};
