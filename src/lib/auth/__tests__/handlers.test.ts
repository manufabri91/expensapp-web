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
});
