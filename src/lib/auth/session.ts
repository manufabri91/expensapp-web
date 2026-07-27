import { Session } from 'next-auth';

// A session with `error` set means the jwt() callback in src/lib/auth/config.ts already tried
// and failed to refresh the access token, so session.user.token is known-stale. Every caller of
// auth() needs to treat that the same as "no session" - a fresh sign-in is the only thing that
// clears it.
export function hasValidSession(session: Session | null | undefined): session is Session {
  return session != null && !session.error;
}

// Shared by backendFetch.ts and authenticatedBackendFetch.ts, whose refusal-to-call logging is
// otherwise identical apart from the caller name.
export function logSessionRefusal(caller: string, path: string, session: Session | null | undefined): void {
  if (session?.error) {
    // Fail fast instead of sending a doomed request the backend will 401 anyway - that would
    // otherwise surface here as a generic "Failed to reach backend" instead of the real, more
    // actionable cause.
    console.error(`[${caller}] refusing to call ${path}: session has error "${session.error}"`);
  }
}
