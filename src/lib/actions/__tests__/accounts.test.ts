/**
 * @jest-environment node
 */
import { revalidatePath } from 'next/cache';
import { createAccount, deleteAccountById, editAccount, getAccounts } from '@/lib/actions/accounts';
import { auth } from '@/lib/auth';

jest.mock('@/lib/auth', () => ({ auth: jest.fn() }));
jest.mock('next/cache', () => ({ revalidatePath: jest.fn(), unstable_noStore: jest.fn() }));

const mockedAuth = auth as unknown as jest.Mock;

const lastFetchRequest = () => {
  const [url, init] = (global.fetch as jest.Mock).mock.calls[0];
  return { url, init, body: init.body ? JSON.parse(init.body) : undefined };
};

describe('accounts actions', () => {
  const originalApiUrl = process.env.API_URL;

  beforeEach(() => {
    process.env.API_URL = 'https://backend.test';
    global.fetch = jest.fn();
    mockedAuth.mockResolvedValue({ user: { token: 'token-123' } });
  });

  afterAll(() => {
    process.env.API_URL = originalApiUrl;
  });

  describe('getAccounts', () => {
    it('fetches from the backend account endpoint', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(new Response('[]', { status: 200 }));

      const result = await getAccounts();

      expect(result).toEqual([]);
      const { url } = lastFetchRequest();
      expect(url).toBe('https://backend.test/account');
    });

    it('throws when the backend response is not ok', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(new Response('', { status: 500 }));

      await expect(getAccounts()).rejects.toThrow('Failed to fetch accounts');
    });
  });

  describe('createAccount', () => {
    it('posts the payload and revalidates dashboard, transactions, and manage', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(new Response('{"id":1}', { status: 201 }));

      const result = await createAccount({ name: 'Checking', currency: 'USD', initialBalance: 100 });

      expect(result).toEqual({ id: 1 });
      const { url, init } = lastFetchRequest();
      expect(url).toBe('https://backend.test/account');
      expect(init.method).toBe('POST');
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
      expect(revalidatePath).toHaveBeenCalledWith('/transactions');
      expect(revalidatePath).toHaveBeenCalledWith('/manage');
    });

    it('throws when the backend rejects the request', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(new Response('', { status: 400 }));

      await expect(createAccount({ name: 'Checking', currency: 'USD', initialBalance: 100 })).rejects.toThrow(
        'Failed to create account'
      );
    });

    it('throws when the data fails server-side validation', async () => {
      await expect(
        createAccount({ name: '', currency: 'USD', initialBalance: 100 })
      ).rejects.toThrow('Invalid account data');
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('editAccount', () => {
    it('puts the payload and revalidates dashboard, transactions, and manage', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(new Response('{"id":1}', { status: 200 }));

      await editAccount({ id: 1, name: 'Checking', currency: 'USD', initialBalance: 100 });

      const { url, init } = lastFetchRequest();
      expect(url).toBe('https://backend.test/account/1');
      expect(init.method).toBe('PUT');
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
      expect(revalidatePath).toHaveBeenCalledWith('/transactions');
      expect(revalidatePath).toHaveBeenCalledWith('/manage');
    });
  });

  describe('deleteAccountById', () => {
    it('returns a success result and revalidates dashboard, transactions, and manage', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(new Response('', { status: 200 }));

      const result = await deleteAccountById(1);

      expect(result).toEqual({ success: true, message: 'Transaction 1 deleted' });
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
      expect(revalidatePath).toHaveBeenCalledWith('/transactions');
      expect(revalidatePath).toHaveBeenCalledWith('/manage');
    });

    it('returns a failure result without throwing when the backend rejects the deletion', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(new Response('', { status: 500 }));

      const result = await deleteAccountById(1);

      expect(result).toEqual({ success: false, message: 'Failed to delete Account: 1' });
    });
  });
});
