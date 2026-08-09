/**
 * @jest-environment node
 */
import { revalidatePath } from 'next/cache';
import {
  cancelRecurringTransaction,
  createRecurringTransaction,
  deleteRecurringTransactionById,
  editRecurringTransaction,
  getRecurringTransactions,
  pauseRecurringTransaction,
  resumeRecurringTransaction,
} from '@/lib/actions/recurringTransactions';
import { auth } from '@/lib/auth';
import { RecurrenceFrequency } from '@/types/enums/recurrenceFrequency';
import { TransactionType } from '@/types/enums/transactionType';

jest.mock('@/lib/auth', () => ({ auth: jest.fn() }));
jest.mock('next/cache', () => ({ revalidatePath: jest.fn(), unstable_noStore: jest.fn() }));

const mockedAuth = auth as unknown as jest.Mock;

const baseRecurringPayload = {
  type: TransactionType.EXPENSE,
  amount: 9.99,
  description: 'Streaming subscription',
  accountId: 1,
  categoryId: 2,
  subcategoryId: 3,
  startDate: '2024-01-01',
};

const lastFetchRequest = () => {
  const [url, init] = (global.fetch as jest.Mock).mock.calls[0];
  return { url, init, body: init.body ? JSON.parse(init.body) : undefined };
};

describe('recurringTransactions actions', () => {
  const originalApiUrl = process.env.API_URL;

  beforeEach(() => {
    process.env.API_URL = 'https://backend.test';
    global.fetch = jest.fn();
    mockedAuth.mockResolvedValue({ user: { token: 'token-123' } });
  });

  afterAll(() => {
    process.env.API_URL = originalApiUrl;
  });

  describe('getRecurringTransactions', () => {
    it('fetches from the backend recurrent-transaction endpoint', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(new Response('[]', { status: 200 }));

      const result = await getRecurringTransactions();

      expect(result).toEqual([]);
      const { url } = lastFetchRequest();
      expect(url).toBe('https://backend.test/recurrent-transaction');
    });

    it('throws when the backend response is not ok', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(new Response('', { status: 500 }));

      await expect(getRecurringTransactions()).rejects.toThrow('Failed to fetch recurring transactions');
    });
  });

  describe('createRecurringTransaction', () => {
    it('builds an interval-frequency payload and posts it to /recurrent-transaction', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(new Response('{"id":1}', { status: 201 }));

      const result = await createRecurringTransaction({
        ...baseRecurringPayload,
        frequency: RecurrenceFrequency.INTERVAL_DAYS,
        intervalDays: 30,
      });

      expect(result).toEqual({ id: 1 });
      const { url, init, body } = lastFetchRequest();
      expect(url).toBe('https://backend.test/recurrent-transaction');
      expect(init.method).toBe('POST');
      expect(body).toMatchObject({
        type: TransactionType.EXPENSE,
        amount: 9.99,
        accountId: 1,
        categoryId: 2,
        subcategoryId: 3,
        frequency: RecurrenceFrequency.INTERVAL_DAYS,
        intervalDays: 30,
      });
      expect(body.daysOfMonth).toBeUndefined();
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
      expect(revalidatePath).toHaveBeenCalledWith('/transactions');
      expect(revalidatePath).toHaveBeenCalledWith('/manage');
    });

    it('builds a monthly-frequency payload with daysOfMonth and no intervalDays', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(new Response('{"id":2}', { status: 201 }));

      await createRecurringTransaction({
        ...baseRecurringPayload,
        frequency: RecurrenceFrequency.MONTHLY_DAYS,
        daysOfMonth: [1, 15],
      });

      const { body } = lastFetchRequest();
      expect(body.daysOfMonth).toEqual([1, 15]);
      expect(body.intervalDays).toBeUndefined();
    });

    it('throws a descriptive error when the backend rejects the request', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(new Response('', { status: 400 }));

      await expect(
        createRecurringTransaction({
          ...baseRecurringPayload,
          frequency: RecurrenceFrequency.INTERVAL_DAYS,
          intervalDays: 30,
        })
      ).rejects.toThrow('Failed to create recurring transaction');
    });

    it('throws when the data fails server-side validation', async () => {
      await expect(
        createRecurringTransaction({ ...baseRecurringPayload, frequency: RecurrenceFrequency.INTERVAL_DAYS, amount: -5 })
      ).rejects.toThrow('Invalid recurring transaction data');
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('editRecurringTransaction', () => {
    it('puts the payload to /recurrent-transaction/{id}', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(new Response('{"id":1}', { status: 200 }));

      await editRecurringTransaction({
        ...baseRecurringPayload,
        id: 1,
        frequency: RecurrenceFrequency.INTERVAL_DAYS,
        intervalDays: 30,
      });

      const { url, init } = lastFetchRequest();
      expect(url).toBe('https://backend.test/recurrent-transaction/1');
      expect(init.method).toBe('PUT');
    });

    it('throws a descriptive error naming the id when the backend rejects the edit', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(new Response('', { status: 400 }));

      await expect(
        editRecurringTransaction({
          ...baseRecurringPayload,
          id: 1,
          frequency: RecurrenceFrequency.INTERVAL_DAYS,
          intervalDays: 30,
        })
      ).rejects.toThrow('Failed to edit recurring transaction 1. Please try again later.');
    });

    it('throws when no id is present', async () => {
      await expect(
        editRecurringTransaction({ ...baseRecurringPayload, frequency: RecurrenceFrequency.INTERVAL_DAYS, intervalDays: 30 })
      ).rejects.toThrow('Invalid recurring transaction data');
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('status transition actions', () => {
    it.each([
      ['pause', pauseRecurringTransaction],
      ['resume', resumeRecurringTransaction],
      ['cancel', cancelRecurringTransaction],
    ] as const)('%s PATCHes /recurrent-transaction/{id}/%s', async (action, actionFn) => {
      (global.fetch as jest.Mock).mockResolvedValue(new Response('{"id":1}', { status: 200 }));

      await actionFn(1);

      const { url, init } = lastFetchRequest();
      expect(url).toBe(`https://backend.test/recurrent-transaction/1/${action}`);
      expect(init.method).toBe('PATCH');
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
      expect(revalidatePath).toHaveBeenCalledWith('/transactions');
    });

    it('throws a descriptive error naming the failed action', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(new Response('', { status: 500 }));

      await expect(pauseRecurringTransaction(1)).rejects.toThrow('Failed to pause recurring transaction 1');
    });
  });

  describe('deleteRecurringTransactionById', () => {
    it('returns a success result and revalidates affected pages when the backend confirms deletion', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(new Response('', { status: 200 }));

      const result = await deleteRecurringTransactionById(1);

      expect(result).toEqual({ success: true, message: 'Recurring transaction 1 deleted' });
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
    });

    it('returns a failure result without throwing when the backend rejects the deletion', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(new Response('', { status: 500 }));

      const result = await deleteRecurringTransactionById(1);

      expect(result).toEqual({ success: false, message: 'Failed to delete recurring transaction: 1' });
    });
  });
});
