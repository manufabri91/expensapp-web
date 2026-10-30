/** @jest-environment node */
import { backendUser } from '../backendUser';

const claims = {
  user_id: 'user-1',
  email: 'user@example.com',
  email_verified: false,
  roles: ['ROLE_BASIC_USER'],
  exp: 4102444800,
};
const payload = (overrides = {}) => ({
  userId: 'user-1',
  username: 'testuser123',
  firstName: 'Test',
  lastName: 'User',
  email: 'user@example.com',
  token: `eyJhbGciOiJub25lIn0.${Buffer.from(JSON.stringify(claims)).toString('base64url')}.signature`,
  refreshToken: 'refresh',
  tokenExpiresIn: '3600',
  ...overrides,
});

describe('backendUser', () => {
  it('builds the session identity and validity from the backend response', () => {
    const user = backendUser(payload());
    expect(user.id).toBe('user-1');
    expect(user.user.roles).toEqual(['ROLE_BASIC_USER']);
    expect(user.validity.valid_until).toBe(4102444800);
    expect(user.tokens.refreshToken).toBe('refresh');
  });

  it.each([
    { token: '' },
    { refreshToken: null },
    { userId: 'different-user' },
    { email: 'other@example.com' },
    { firstName: null },
  ])('rejects incomplete or inconsistent authentication data: %j', (overrides) => {
    expect(() => backendUser(payload(overrides))).toThrow();
  });

  it('rejects an expired token', () => {
    const token = `header.${Buffer.from(JSON.stringify({ ...claims, exp: 1 })).toString('base64url')}.signature`;
    expect(() => backendUser(payload({ token }))).toThrow();
  });
});
