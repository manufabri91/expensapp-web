import { RegisterError } from '@/types/exceptions/RegisterError';

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
  console.debug('Logging in');

  return fetch(`${process.env.API_URL}/auth/login`, {
    signal: AbortSignal.timeout(2000),
    method: 'POST',
    body: JSON.stringify({ email, password }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Refresh the access token by sending a POST request to the backend using
 * the supplied refresh token.
 * @param token The current refresh token
 * @returns A BackendAccessJWT response from the backend.
 */
export async function refresh(token: string): Promise<Response> {
  console.debug('Refreshing token');

  if (!token) {
    throw new Error('Token is required');
  }
  // Verify that the token is valid and not expired
  return fetch(`${process.env.API_URL}/auth/refresh`, {
    headers: {
      ['X-Refresh-Token']: token,
    },
  });
}

/**
 * Refresh the access token by sending a POST request to the backend using
 * the supplied refresh token.
 * @param token The current refresh token
 * @returns A BackendAccessJWT response from the backend.
 */
export async function register(
  userName: string,
  email: string,
  password: string,
  firstName: string,
  lastName: string
): Promise<Response> {
  const response = await fetch(`${process.env.API_URL}/auth/register`, {
    signal: AbortSignal.timeout(2000),
    method: 'POST',
    body: JSON.stringify({
      userName,
      email,
      password,
      firstName,
      lastName,
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (response.status === 424) {
    throw new RegisterError('System.ERRORS.USER_EXISTS');
  }
  if (response.status === 400) {
    throw new RegisterError('System.ERRORS.INVALID_DATA_PROVIDED');
  }
  if (response.status === 500) {
    throw new RegisterError('System.ERRORS.UNHANDLED_EXCEPTION');
  }

  if (!response.ok) {
    throw new RegisterError('System.ERRORS.USER_CREATION_FAIL');
  }

  console.log(`New user: ${email} created`);
  return await response.json();
}
