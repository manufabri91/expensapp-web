import { validateEnv } from '@/env';

describe('validateEnv', () => {
  const originalApiUrl = process.env.API_URL;
  const originalAuthSecret = process.env.AUTH_SECRET;

  afterEach(() => {
    process.env.API_URL = originalApiUrl;
    process.env.AUTH_SECRET = originalAuthSecret;
  });

  it('does not throw when every required env var is set', () => {
    process.env.API_URL = 'https://backend.test';
    process.env.AUTH_SECRET = 'secret';

    expect(() => validateEnv()).not.toThrow();
  });

  it('throws naming every missing required env var', () => {
    process.env.API_URL = '';
    process.env.AUTH_SECRET = '';

    expect(() => validateEnv()).toThrow('Missing required environment variable(s): API_URL, AUTH_SECRET');
  });

  it('throws naming only the one missing env var when the rest are set', () => {
    process.env.API_URL = 'https://backend.test';
    process.env.AUTH_SECRET = '';

    expect(() => validateEnv()).toThrow('Missing required environment variable(s): AUTH_SECRET');
  });
});
