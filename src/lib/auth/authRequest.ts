export const authTimeout = (name: string, fallback: number) => {
  const value = Number(process.env[name] ?? fallback);
  if (!Number.isInteger(value) || value < 1000 || value > 120000) {
    throw new Error(`Invalid ${name}: expected milliseconds between 1000 and 120000`);
  }
  return value;
};

export const authRequest = async (path: string, init: RequestInit, timeout: number): Promise<Response> => {
  const requestId = crypto.randomUUID();
  const started = Date.now();
  try {
    const response = await fetch(`${process.env.API_URL}/auth/${path}`, {
      ...init,
      cache: 'no-store',
      signal: AbortSignal.timeout(timeout),
      headers: { ...init.headers, 'X-Request-ID': requestId },
    });
    console.info('[auth:request]', { path, requestId, status: response.status, durationMs: Date.now() - started });
    return response;
  } catch {
    console.warn('[auth:request]', { path, requestId, outcome: 'unknown', durationMs: Date.now() - started });
    throw new Error('Authentication request interrupted');
  }
};
