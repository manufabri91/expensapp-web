/**
 * @jest-environment node
 */
import { revalidatePath } from 'next/cache';
import { confirmTransaction } from '@/lib/actions/transactions';
import { auth } from '@/lib/auth';

jest.mock('@/lib/auth', () => ({ auth: jest.fn() }));
jest.mock('next/cache', () => ({ revalidatePath: jest.fn(), unstable_noStore: jest.fn() }));

const mockedAuth = auth as unknown as jest.Mock;

const lastFetchRequest = () => {
  const [url, init] = (global.fetch as jest.Mock).mock.calls[0];
  return { url, init };
};

describe('transactions actions', () => {
  const originalApiUrl = process.env.API_URL;

  beforeEach(() => {
    process.env.API_URL = 'https://backend.test';
    global.fetch = jest.fn();
    mockedAuth.mockResolvedValue({ user: { token: 'token-123' } });
  });

  afterAll(() => {
    process.env.API_URL = originalApiUrl;
  });

  describe('confirmTransaction', () => {
    it('PATCHes /transaction/{id}/confirm and revalidates affected pages', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(new Response('{"id":1}', { status: 200 }));

      const result = await confirmTransaction(1);

      expect(result).toEqual({ id: 1 });
      const { url, init } = lastFetchRequest();
      expect(url).toBe('https://backend.test/transaction/1/confirm');
      expect(init.method).toBe('PATCH');
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
      expect(revalidatePath).toHaveBeenCalledWith('/transactions');
    });

    it('throws a descriptive error naming the id when the backend rejects the confirmation', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(new Response('', { status: 500 }));

      await expect(confirmTransaction(1)).rejects.toThrow('Failed to confirm transaction 1');
    });
  });
});
