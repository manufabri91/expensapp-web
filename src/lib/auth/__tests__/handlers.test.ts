/**
 * @jest-environment node
 */
import { register } from '@/lib/auth/handlers';
import { RegisterError } from '@/types/exceptions/RegisterError';

describe('register', () => {
  const originalApiUrl = process.env.API_URL;

  beforeEach(() => {
    process.env.API_URL = 'https://backend.test';
    global.fetch = jest.fn();
  });

  afterAll(() => {
    process.env.API_URL = originalApiUrl;
  });

  it('sends acceptedTerms in the request body', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(new Response(JSON.stringify({ token: 'abc' }), { status: 200 }));

    await register('johndoe', 'john@example.com', 'password1', 'John', 'Doe', true);

    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(JSON.parse(init.body)).toEqual({
      userName: 'johndoe',
      email: 'john@example.com',
      password: 'password1',
      firstName: 'John',
      lastName: 'Doe',
      acceptedTerms: true,
    });
  });

  it('throws a RegisterError with the invalid-data reason on a 400 (e.g. terms not accepted)', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(new Response(null, { status: 400 }));

    await expect(register('johndoe', 'john@example.com', 'password1', 'John', 'Doe', false)).rejects.toThrow(
      RegisterError
    );
  });

  it('does not misreport a dependency failure as an existing user', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(new Response(null, { status: 424 }));
    await expect(register('johndoe123', 'john@example.com', 'password1', 'John', 'Doe', true)).rejects.toThrow(
      'System.ERRORS.SERVICE_UNAVAILABLE'
    );
  });

  it('reports a network interruption as an uncertain registration without retrying', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new DOMException('deadline', 'TimeoutError'));
    await expect(register('johndoe123', 'john@example.com', 'password1', 'John', 'Doe', true)).rejects.toThrow(
      'System.ERRORS.REGISTRATION_OUTCOME_UNKNOWN'
    );
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it.each([400, 422])('maps validation HTTP %s to invalid data', async (status) => {
    (global.fetch as jest.Mock).mockResolvedValue(new Response(null, { status }));
    await expect(register('johndoe123', 'john@example.com', 'password1', 'John', 'Doe', true)).rejects.toThrow(
      'System.ERRORS.INVALID_DATA_PROVIDED'
    );
  });

  it('requires the duplicate error code before reporting an existing user', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(
      new Response(JSON.stringify({ code: 'USER_EXISTS' }), { status: 409 })
    );
    await expect(register('johndoe123', 'john@example.com', 'password1', 'John', 'Doe', true)).rejects.toThrow(
      'System.ERRORS.USER_EXISTS'
    );
  });

  it('treats unreadable successful responses as uncertain registration', async () => {
    (global.fetch as jest.Mock).mockResolvedValue(new Response('not json', { status: 200 }));
    await expect(register('johndoe123', 'john@example.com', 'password1', 'John', 'Doe', true)).rejects.toThrow(
      'System.ERRORS.REGISTRATION_OUTCOME_UNKNOWN'
    );
  });
});
