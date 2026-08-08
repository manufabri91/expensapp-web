/**
 * @jest-environment node
 */
import { revalidatePath } from 'next/cache';
import { confirmTransaction, createTransaction, editTransaction, getTransactionById } from '@/lib/actions/transactions';
import { auth } from '@/lib/auth';
import { TransactionType } from '@/types/enums/transactionType';

jest.mock('@/lib/auth', () => ({ auth: jest.fn() }));
jest.mock('next/cache', () => ({ revalidatePath: jest.fn(), unstable_noStore: jest.fn() }));

const mockedAuth = auth as unknown as jest.Mock;

const validTransaction = {
  amount: 50,
  eventDate: '2024-01-01',
  description: 'Groceries',
  accountId: 1,
  categoryId: 2,
  subcategoryId: 3,
  type: TransactionType.EXPENSE,
};

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

  describe('createTransaction', () => {
    it('posts the payload and revalidates dashboard, transactions, and manage', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(new Response('{"id":1}', { status: 201 }));

      const result = await createTransaction(validTransaction);

      expect(result).toEqual({ id: 1 });
      const { url, init } = lastFetchRequest();
      expect(url).toBe('https://backend.test/transaction');
      expect(init.method).toBe('POST');
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
      expect(revalidatePath).toHaveBeenCalledWith('/transactions');
      expect(revalidatePath).toHaveBeenCalledWith('/manage');
    });

    it('throws when the backend rejects the request', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(new Response('', { status: 400 }));

      await expect(createTransaction(validTransaction)).rejects.toThrow('Failed to create transaction');
    });

    it('throws when the data fails server-side validation', async () => {
      await expect(createTransaction({ ...validTransaction, amount: -5 })).rejects.toThrow('Invalid transaction data');
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('editTransaction', () => {
    it('puts the payload and revalidates dashboard, transactions, and manage', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(new Response('{"id":1}', { status: 200 }));

      await editTransaction({ ...validTransaction, id: 1 });

      const { url, init } = lastFetchRequest();
      expect(url).toBe('https://backend.test/transaction/1');
      expect(init.method).toBe('PUT');
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
      expect(revalidatePath).toHaveBeenCalledWith('/transactions');
      expect(revalidatePath).toHaveBeenCalledWith('/manage');
    });

    it('throws when no id is present', async () => {
      await expect(editTransaction(validTransaction)).rejects.toThrow('Invalid transaction data');
      expect(global.fetch).not.toHaveBeenCalled();
    });
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

  describe('getTransactionById', () => {
    it('GETs /transaction/{id} and returns the full transaction', async () => {
      const transaction = { id: 7, description: 'Rent' };
      (global.fetch as jest.Mock).mockResolvedValue(new Response(JSON.stringify(transaction), { status: 200 }));

      const result = await getTransactionById(7);

      expect(result).toEqual(transaction);
      const { url, init } = lastFetchRequest();
      expect(url).toBe('https://backend.test/transaction/7');
      expect(init.method).toBe('GET');
    });

    it('throws a descriptive error naming the id when the backend fetch fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(new Response('', { status: 404 }));

      await expect(getTransactionById(7)).rejects.toThrow('Failed to fetch transaction 7');
    });
  });
});
