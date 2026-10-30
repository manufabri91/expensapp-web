/** @jest-environment node */
import { Auth, type AuthConfig, raw, skipCSRFCheck } from '@auth/core';
import { CredentialsSignin } from '@auth/core/errors';
import type { Session } from 'next-auth';

import { authConfig } from '@/lib/auth/config';

const origin = 'https://expenses.example';
const registration = {
  email: 'new@example.com',
  password: 'Password123!',
  passwordRepeat: 'Password123!',
  userName: 'new-user',
  firstName: 'New',
  lastName: 'User',
  acceptedTerms: 'true',
};
const configuration = {
  ...authConfig,
  basePath: '/api/auth',
  secret: 'integration-test-secret-with-at-least-32-characters',
  trustHost: true,
  skipCSRFCheck,
} satisfies AuthConfig;

function backendAuthentication(expiresAt = Math.floor(Date.now() / 1000) + 3600) {
  const claims = {
    user_id: 'backend-user-id',
    sub: 'backend-user-id',
    email: registration.email,
    email_verified: false,
    roles: ['USER'],
    iat: Math.floor(Date.now() / 1000),
    exp: expiresAt,
  };
  const encoded = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
  return {
    userId: claims.user_id,
    username: 'backend-username',
    firstName: 'Backend',
    lastName: 'Profile',
    email: claims.email,
    token: `${encoded({ alg: 'RS256', typ: 'JWT' })}.${encoded(claims)}.backend-signature`,
    refreshToken: 'backend-refresh-token',
    tokenExpiresIn: '3600',
    registrationStatus: 'AUTHENTICATED',
  };
}

function callbackRequest(provider = 'register') {
  return new Request(`${origin}/api/auth/callback/${provider}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ ...registration, callbackUrl: `${origin}/dashboard` }),
  });
}

function sessionCookie(response: Response) {
  const cookies = response.headers.getSetCookie();
  const cookie = cookies.find((value) => value.startsWith('__Secure-authjs.session-token='));
  expect(cookie).toBeDefined();
  expect(cookie).toMatch(/; HttpOnly/i);
  expect(cookie).toMatch(/; Secure/i);
  return cookie!.split(';')[0];
}

async function readSession(cookie: string) {
  const response = await Auth(new Request(`${origin}/api/auth/session`, { headers: { cookie } }), configuration);
  expect(response.status).toBe(200);
  return { response, session: (await response.json()) as Session | null };
}

describe('registration through the real Auth.js session lifecycle', () => {
  let backendFetch: jest.SpiedFunction<typeof fetch>;
  const originalApiUrl = process.env.API_URL;

  beforeEach(() => {
    backendFetch = jest.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Unexpected backend request'));
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'info').mockImplementation(() => {});
    process.env.API_URL = 'https://backend.example';
  });

  afterEach(() => {
    jest.restoreAllMocks();
    if (originalApiUrl === undefined) delete process.env.API_URL;
    else process.env.API_URL = originalApiUrl;
  });

  it('creates an HttpOnly session from one registration response and preserves backend identity on reload', async () => {
    const authentication = backendAuthentication();
    backendFetch.mockResolvedValueOnce(Response.json(authentication));

    const response = await Auth(callbackRequest(), configuration);
    const cookie = sessionCookie(response);
    const firstRead = await readSession(cookie);
    const reload = await readSession(sessionCookie(firstRead.response));

    expect(response.headers.get('Location')).toBe(`${origin}/dashboard`);
    expect(reload.session?.user).toMatchObject({
      userId: 'backend-user-id',
      username: 'backend-username',
      firstName: 'Backend',
      lastName: 'Profile',
      email: registration.email,
      token: authentication.token,
    });
    expect(reload.session?.validity.valid_until).toBe(firstRead.session?.validity.valid_until);
    expect(backendFetch).toHaveBeenCalledTimes(1);
    expect(backendFetch).toHaveBeenCalledWith(
      'https://backend.example/auth/register',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('expires the session cookie on signout and still supports ordinary credentials login', async () => {
    backendFetch.mockImplementation(async () => Response.json(backendAuthentication()));
    const registrationResponse = await Auth(callbackRequest(), configuration);
    const cookie = sessionCookie(registrationResponse);

    const signout = await Auth(
      new Request(`${origin}/api/auth/signout`, {
        method: 'POST',
        headers: { cookie, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ callbackUrl: origin }),
      }),
      configuration
    );
    const login = await Auth(callbackRequest('credentials'), configuration);

    expect(signout.headers.getSetCookie().join(';')).toMatch(/session-token=;.*Max-Age=0/i);
    expect((await readSession('')).session).toBeNull();
    expect((await readSession(sessionCookie(login))).session?.user.userId).toBe('backend-user-id');
    expect(backendFetch.mock.calls.map(([url]) => url)).toEqual([
      'https://backend.example/auth/register',
      'https://backend.example/auth/login',
    ]);
  });

  it('refreshes the registered session after the backend access token expires', async () => {
    const initialTime = Date.now();
    const authentication = backendAuthentication(Math.floor(initialTime / 1000) + 10);
    const refreshed = backendAuthentication(Math.floor(initialTime / 1000) + 3600);
    backendFetch.mockResolvedValueOnce(Response.json(authentication)).mockResolvedValueOnce(Response.json(refreshed));
    const response = await Auth(callbackRequest(), configuration);
    jest.spyOn(Date, 'now').mockReturnValue(initialTime + 11_000);

    const { session } = await readSession(sessionCookie(response));

    expect(session?.user.token).toBe(refreshed.token);
    expect(session?.error).toBeUndefined();
    expect(backendFetch).toHaveBeenCalledTimes(2);
    expect(backendFetch).toHaveBeenLastCalledWith(
      'https://backend.example/auth/refresh',
      expect.objectContaining({ headers: expect.objectContaining({ 'X-Refresh-Token': authentication.refreshToken }) })
    );
  });

  it('allows registration taking longer than the former two-second deadline without replaying the request', async () => {
    backendFetch.mockImplementationOnce(
      async (_url, options) =>
        new Promise<Response>((resolve, reject) => {
          const responseTimer = setTimeout(() => resolve(Response.json(backendAuthentication())), 2100);
          options?.signal?.addEventListener(
            'abort',
            () => {
              clearTimeout(responseTimer);
              reject(options.signal?.reason);
            },
            { once: true }
          );
        })
    );

    const response = await Auth(callbackRequest(), configuration);

    expect((await readSession(sessionCookie(response))).session?.user.userId).toBe('backend-user-id');
    expect(backendFetch).toHaveBeenCalledTimes(1);
  });

  it.each([
    [
      'explicit sign-in required',
      { email: registration.email, registrationStatus: 'SIGN_IN_REQUIRED' },
      'ACCOUNT_CREATED_SIGN_IN_REQUIRED',
    ],
    ['legacy tokenless success', { email: registration.email }, 'ACCOUNT_CREATED_SIGN_IN_REQUIRED'],
    [
      'malformed authentication success',
      { ...backendAuthentication(), registrationStatus: undefined, token: 'malformed' },
      'REGISTRATION_OUTCOME_UNKNOWN',
    ],
    [
      'confirmed account with missing tokens',
      { email: registration.email, registrationStatus: 'AUTHENTICATED' },
      'ACCOUNT_CREATED_SIGN_IN_REQUIRED',
    ],
    ['confirmed account with expired tokens', backendAuthentication(1), 'ACCOUNT_CREATED_SIGN_IN_REQUIRED'],
    [
      'confirmed account with malformed tokens',
      { ...backendAuthentication(), token: 'malformed' },
      'ACCOUNT_CREATED_SIGN_IN_REQUIRED',
    ],
  ])('propagates %s as a typed credentials error without creating a session', async (_description, payload, code) => {
    backendFetch.mockImplementation(async () => Response.json(payload));

    await expect(Auth(callbackRequest(), { ...configuration, raw })).rejects.toMatchObject({
      type: 'CredentialsSignin',
      code,
    });
    expect(backendFetch).toHaveBeenCalledTimes(1);
    backendFetch.mockClear();
    const response = await Auth(callbackRequest(), configuration);

    expect(new URL(response.headers.get('Location')!).searchParams.get('code')).toBe(code);
    expect(response.headers.getSetCookie().join(';')).not.toContain('session-token=');
    expect(backendFetch).toHaveBeenCalledTimes(1);
    expect((await readSession('')).session).toBeNull();
  });

  it('preserves an uncertain network outcome without retrying registration or calling login', async () => {
    backendFetch.mockRejectedValueOnce(new TypeError('The response was lost after account creation'));

    const failure = await Auth(callbackRequest(), { ...configuration, raw }).catch((error: unknown) => error);

    expect(failure).toBeInstanceOf(CredentialsSignin);
    expect(failure).toMatchObject({ code: 'REGISTRATION_OUTCOME_UNKNOWN' });
    expect(backendFetch).toHaveBeenCalledTimes(1);
    expect((await readSession('')).session).toBeNull();
  });
});
