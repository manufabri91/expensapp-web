const REQUIRED_ENV_VARS = ['API_URL', 'AUTH_SECRET'] as const;

// Fails fast at boot (called from instrumentation.ts's register()) instead of letting a
// typo'd/missing env var surface later as a cryptic runtime error (e.g. a fetch to "undefined/...").
export const validateEnv = () => {
  const missing = REQUIRED_ENV_VARS.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variable(s): ${missing.join(', ')}`);
  }
};
