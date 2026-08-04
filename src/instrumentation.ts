import { type Instrumentation } from 'next';
import { validateEnv } from '@/env';

// Runs once when a new server instance starts, before it handles any requests - the right place
// to fail fast on a missing/typo'd env var instead of surfacing it later as a cryptic runtime error.
export const register = () => {
  validateEnv();
};

// Vercel captures anything written to stderr/console.error in its Runtime Logs with zero extra
// setup, so this is enough to get server-side error visibility (Server Components, Route
// Handlers, Server Actions) without adding an observability SDK/dependency.
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  console.error('[onRequestError]', err, request, context);
};
