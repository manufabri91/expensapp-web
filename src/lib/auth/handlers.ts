import { z } from 'zod';
import { RegisterError } from '@/types/exceptions/RegisterError';
import { authRequest, authTimeout } from './authRequest';

/**
 * Log in a user by sending a POST request to the backend using the supplied
 * credentials.
 *
 *
 * @param email The email of the user
 * @param password The password of the user
 * @returns A BackendJWT response from the backend.
 */
export async function login(email: string, password: string): Promise<Response> {
  return authRequest(
    'login',
    {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: {
        'Content-Type': 'application/json',
      },
    },
    authTimeout('AUTH_REQUEST_TIMEOUT_MS', 10000)
  );
}

/**
 * Refresh the access token by sending a POST request to the backend using
 * the supplied refresh token.
 * @param token The current refresh token
 * @returns A BackendAccessJWT response from the backend.
 */
export async function refresh(token: string): Promise<Response> {
  if (!token) {
    throw new Error('Token is required');
  }
  // Verify that the token is valid and not expired
  return authRequest(
    'refresh',
    {
      headers: {
        ['X-Refresh-Token']: token,
      },
    },
    authTimeout('AUTH_REQUEST_TIMEOUT_MS', 10000)
  );
}

/**
 * Register a new user by sending a POST request to the backend with the
 * supplied profile data.
 * @param acceptedTerms Whether the user checked the Terms of Use / Privacy Policy consent
 * checkbox - the backend rejects registration (422) without it via `@AssertTrue` on
 * `UserRegisterDto.acceptedTerms`.
 * @returns The backend registration payload, validated by the registration provider.
 */
export async function register(
  userName: string,
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  acceptedTerms: boolean
): Promise<unknown> {
  let response: Response;
  const timeout = authTimeout('REGISTRATION_REQUEST_TIMEOUT_MS', 15000);
  try {
    response = await authRequest(
      'register',
      {
        method: 'POST',
        body: JSON.stringify({
          userName,
          email,
          password,
          firstName,
          lastName,
          acceptedTerms,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      },
      timeout
    );
  } catch {
    throw new RegisterError('REGISTRATION_OUTCOME_UNKNOWN');
  }
  if (response.status === 409) {
    const payload: unknown = await response.json().catch(() => null);
    const duplicate = z.object({ code: z.literal('USER_EXISTS') }).safeParse(payload);
    if (!duplicate.success) throw new RegisterError('SERVICE_UNAVAILABLE');
    throw new RegisterError('USER_EXISTS');
  }
  if (response.status === 400 || response.status === 422) {
    throw new RegisterError('INVALID_DATA_PROVIDED');
  }
  if (!response.ok) {
    throw new RegisterError('SERVICE_UNAVAILABLE');
  }

  try {
    return await response.json();
  } catch {
    throw new RegisterError('REGISTRATION_OUTCOME_UNKNOWN');
  }
}
