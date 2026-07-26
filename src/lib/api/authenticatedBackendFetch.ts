import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

type BackendMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

type BackendFetchOptions = {
  method?: BackendMethod;
  body?: unknown;
  searchParams?: URLSearchParams;
};

type BackendFetchSuccess<T> = {
  ok: true;
  status: number;
  data: T;
};

type BackendFetchFailure = {
  ok: false;
  response: NextResponse;
};

export type BackendFetchResult<T> = BackendFetchSuccess<T> | BackendFetchFailure;

const unauthorized = (): BackendFetchFailure => ({
  ok: false,
  response: NextResponse.json({ error: 'Not authorized' }, { status: 401 }),
});

const buildBackendUrl = (path: string, searchParams?: URLSearchParams): string => {
  const queryString = searchParams && searchParams.size > 0 ? `?${searchParams.toString()}` : '';
  return `${process.env.API_URL}${path}${queryString}`;
};

const fetchBackend = async (
  url: string,
  method: BackendMethod,
  token: string,
  body: unknown,
): Promise<Response | BackendFetchFailure> => {
  try {
    return await fetch(url, {
      method,
      signal: AbortSignal.timeout(2000),
      headers: {
        Authorization: token,
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    console.error(`Failed to reach backend service at ${url}:`, error);
    return {
      ok: false,
      response: NextResponse.json({ error: 'Failed to reach backend service' }, { status: 502 }),
    };
  }
};

const toFailureResult = async (response: Response, path: string): Promise<BackendFetchFailure> => {
  const errorBody = await response.json().catch(() => null);
  console.error(`Backend request to ${path} failed with status ${response.status}:`, errorBody);
  return {
    ok: false,
    response: NextResponse.json(
      { error: errorBody?.message || `Backend request failed with status ${response.status}` },
      { status: response.status },
    ),
  };
};

// A response body is only parsed as JSON when there IS a body: an empty body (e.g. a 200/204
// DELETE response with no content) is a legitimate success with no data, not a parse failure.
// A non-empty body that fails to parse means the backend sent something unexpected, which is a
// failure the caller must see rather than a silent `data: null` masquerading as success.
const toSuccessResult = async <T>(response: Response, path: string): Promise<BackendFetchResult<T>> => {
  const rawBody = await response.text();
  if (rawBody === '') {
    return { ok: true, status: response.status, data: null as T };
  }

  try {
    return { ok: true, status: response.status, data: JSON.parse(rawBody) as T };
  } catch (error) {
    console.error(`Backend response for ${path} was not valid JSON:`, error);
    return {
      ok: false,
      response: NextResponse.json({ error: 'Invalid response from backend' }, { status: 502 }),
    };
  }
};

const toResult = async <T>(response: Response, path: string): Promise<BackendFetchResult<T>> => {
  if (!response.ok) {
    return toFailureResult(response, path);
  }
  return toSuccessResult<T>(response, path);
};

/**
 * Shared helper for the Next.js API routes that proxy requests to the Spring Boot backend.
 *
 * Encapsulates: checking the session via `auth()`, forwarding the request to the backend with
 * the session token, checking `response.ok`, and parsing the JSON body. Auth failures and backend
 * failures are both returned as a proper `NextResponse.json({...}, { status })` (never
 * `NextResponse.error()`), preserving the real status code (401 for missing session, the
 * backend's actual status - or 502 - for backend failures).
 *
 * Callers should check `result.ok` and either return `result.response` (on failure) or build
 * their own success response from `result.data` (on success), so each route keeps full control
 * over its success response shape.
 */
export const authenticatedBackendFetch = async <T = unknown>(
  path: string,
  options: BackendFetchOptions = {},
): Promise<BackendFetchResult<T>> => {
  const { method = 'GET', body, searchParams } = options;

  const session = await auth();
  if (!session) {
    return unauthorized();
  }

  const url = buildBackendUrl(path, searchParams);
  const response = await fetchBackend(url, method, session.user.token, body);
  if (!(response instanceof Response)) {
    return response;
  }

  return toResult<T>(response, path);
};
