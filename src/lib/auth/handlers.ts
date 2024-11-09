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

  return fetch('https://expensapp-api.manuelfabri.com/auth/login', {
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
  return fetch('https://expensapp-api.manuelfabri.com/auth/refresh', {
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
  console.debug('Creating user');

  // Verify that the token is valid and not expired
  return fetch('https://expensapp-api.manuelfabri.com/auth/register', {
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
}
