/**
 * @jest-environment node
 */
import { revalidatePath } from 'next/cache';
import { createCategory, deleteCategoryById, editCategory, getCategories } from '@/lib/actions/categories';
import { auth } from '@/lib/auth';
import { CategoryFormValues } from '@/schemas/category';
import { Icon } from '@/types/enums/icon';
import { TransactionType } from '@/types/enums/transactionType';

jest.mock('@/lib/auth', () => ({ auth: jest.fn() }));
jest.mock('next/cache', () => ({ revalidatePath: jest.fn(), unstable_noStore: jest.fn() }));

const mockedAuth = auth as unknown as jest.Mock;

const validCategory: CategoryFormValues = {
  name: 'Groceries',
  color: '#ffffff',
  iconName: Icon.NONE,
  type: TransactionType.EXPENSE,
};

const lastFetchRequest = () => {
  const [url, init] = (global.fetch as jest.Mock).mock.calls[0];
  return { url, init, body: init.body ? JSON.parse(init.body) : undefined };
};

describe('categories actions', () => {
  const originalApiUrl = process.env.API_URL;

  beforeEach(() => {
    process.env.API_URL = 'https://backend.test';
    global.fetch = jest.fn();
    mockedAuth.mockResolvedValue({ user: { token: 'token-123' } });
  });

  afterAll(() => {
    process.env.API_URL = originalApiUrl;
  });

  describe('getCategories', () => {
    it('fetches from the backend category endpoint', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(new Response('[]', { status: 200 }));

      const result = await getCategories();

      expect(result).toEqual([]);
      const { url } = lastFetchRequest();
      expect(url).toBe('https://backend.test/category');
    });

    it('throws when the backend response is not ok', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(new Response('', { status: 500 }));

      await expect(getCategories()).rejects.toThrow('Failed to fetch accounts');
    });
  });

  describe('createCategory', () => {
    it('posts the payload and revalidates dashboard, transactions, and manage', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(new Response('{"id":1}', { status: 201 }));

      const result = await createCategory(validCategory);

      expect(result).toEqual({ id: 1 });
      const { url, init } = lastFetchRequest();
      expect(url).toBe('https://backend.test/category');
      expect(init.method).toBe('POST');
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
      expect(revalidatePath).toHaveBeenCalledWith('/transactions');
      expect(revalidatePath).toHaveBeenCalledWith('/manage');
    });

    it('throws when the backend rejects the request', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(new Response('', { status: 400 }));

      await expect(createCategory(validCategory)).rejects.toThrow('Failed to create category');
    });

    it('throws when the data fails server-side validation', async () => {
      await expect(createCategory({ ...validCategory, name: '' })).rejects.toThrow('Invalid category data');
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('editCategory', () => {
    it('puts the payload and revalidates dashboard, transactions, and manage', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(new Response('{"id":1}', { status: 200 }));

      await editCategory({ ...validCategory, id: 1 });

      const { url, init } = lastFetchRequest();
      expect(url).toBe('https://backend.test/category/1');
      expect(init.method).toBe('PUT');
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
      expect(revalidatePath).toHaveBeenCalledWith('/transactions');
      expect(revalidatePath).toHaveBeenCalledWith('/manage');
    });
  });

  describe('deleteCategoryById', () => {
    it('returns a success result and revalidates dashboard, transactions, and manage', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(new Response('', { status: 200 }));

      const result = await deleteCategoryById(1);

      expect(result).toEqual({ success: true, message: 'Category 1 deleted' });
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
      expect(revalidatePath).toHaveBeenCalledWith('/transactions');
      expect(revalidatePath).toHaveBeenCalledWith('/manage');
    });

    it('returns a failure result without throwing when the backend rejects the deletion', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(new Response('', { status: 500 }));

      const result = await deleteCategoryById(1);

      expect(result).toEqual({ success: false, message: 'Failed to delete Category: 1' });
    });
  });
});
