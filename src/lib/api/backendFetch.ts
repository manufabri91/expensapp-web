import { auth } from '@/lib/auth';
import { UnauthorizedError } from '@/types/exceptions/unauthorized';

type BackendFetchMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type BackendFetchOptions = {
  method?: BackendFetchMethod;
  body?: unknown;
  revalidate?: number;
};

/**
 * Shared fetch for the `src/lib/actions/*.ts` server actions that call the Spring Boot backend
 * directly using the trusted API_URL env var (never derived from request headers - see
 * proxy.ts) and authenticate with the session's bearer token.
 *
 * Unlike `authenticatedBackendFetch` (used by the Next.js API route handlers, which need a
 * NextResponse-shaped result), this returns the raw `Response` so each action keeps its own
 * `!response.ok` / error-message / revalidatePath handling. It centralizes what was previously
 * duplicated across every actions/*.ts file: auth-header construction, a request timeout, and
 * turning a network failure into a thrown Error instead of an unhandled rejection.
 */
export const backendFetch = async (path: string, options: BackendFetchOptions = {}): Promise<Response> => {
  const { method = 'GET', body, revalidate } = options;

  const session = await auth();
  if (!session) throw new UnauthorizedError();

  try {
    return await fetch(`${process.env.API_URL}${path}`, {
      method,
      signal: AbortSignal.timeout(2000),
      headers: {
        Authorization: session.user.token,
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      ...(revalidate !== undefined ? { next: { revalidate } } : {}),
    });
  } catch (error) {
    console.error(`Failed to reach backend service at ${path}:`, error);
    throw new Error(`Failed to reach backend service at ${path}`);
  }
};
