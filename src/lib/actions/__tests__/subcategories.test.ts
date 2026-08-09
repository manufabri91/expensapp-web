/**
 * @jest-environment node
 */
import { revalidatePath } from 'next/cache';
import { createSubcategory, deleteSubcategoryById, editSubcategory, getSubcategories } from '@/lib/actions/subcategories';
import { auth } from '@/lib/auth';

jest.mock('@/lib/auth', () => ({ auth: jest.fn() }));
jest.mock('next/cache', () => ({ revalidatePath: jest.fn(), unstable_noStore: jest.fn() }));

const mockedAuth = auth as unknown as jest.Mock;

const lastFetchRequest = () => {
  const [url, init] = (global.fetch as jest.Mock).mock.calls[0];
  return { url, init, body: init.body ? JSON.parse(init.body) : undefined };
};

describe('subcategories actions', () => {
  const originalApiUrl = process.env.API_URL;

  beforeEach(() => {
    process.env.API_URL = 'https://backend.test';
    global.fetch = jest.fn();
    mockedAuth.mockResolvedValue({ user: { token: 'token-123' } });
  });

  afterAll(() => {
    process.env.API_URL = originalApiUrl;
  });

  describe('getSubcategories', () => {
    it('fetches from the backend subcategory endpoint', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(new Response('[]', { status: 200 }));

      const result = await getSubcategories();

      expect(result).toEqual([]);
      const { url } = lastFetchRequest();
      expect(url).toBe('https://backend.test/subcategory');
    });

    it('throws when the backend response is not ok', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(new Response('', { status: 500 }));

      await expect(getSubcategories()).rejects.toThrow('Failed to fetch subcategories');
    });
  });

  describe('createSubcategory', () => {
    it('posts the payload and revalidates dashboard, transactions, and manage', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(new Response('{"id":1}', { status: 201 }));

      const result = await createSubcategory({ name: 'Streaming', parentCategoryId: 2 });

      expect(result).toEqual({ id: 1 });
      const { url, init } = lastFetchRequest();
      expect(url).toBe('https://backend.test/subcategory');
      expect(init.method).toBe('POST');
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
      expect(revalidatePath).toHaveBeenCalledWith('/transactions');
      expect(revalidatePath).toHaveBeenCalledWith('/manage');
    });

    it('throws when the backend rejects the request', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(new Response('', { status: 400 }));

      await expect(createSubcategory({ name: 'Streaming', parentCategoryId: 2 })).rejects.toThrow(
        'Failed to create Subcategory'
      );
    });

    it('throws when the data fails server-side validation', async () => {
      await expect(createSubcategory({ name: '', parentCategoryId: 2 })).rejects.toThrow('Invalid subcategory data');
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('editSubcategory', () => {
    it('puts the payload and revalidates dashboard, transactions, and manage', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(new Response('{"id":1}', { status: 200 }));

      await editSubcategory({ id: 1, name: 'Streaming', parentCategoryId: 2 });

      const { url, init } = lastFetchRequest();
      expect(url).toBe('https://backend.test/subcategory/1');
      expect(init.method).toBe('PUT');
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
      expect(revalidatePath).toHaveBeenCalledWith('/transactions');
      expect(revalidatePath).toHaveBeenCalledWith('/manage');
    });
  });

  describe('deleteSubcategoryById', () => {
    it('returns a success result and revalidates dashboard, transactions, and manage', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(new Response('', { status: 200 }));

      const result = await deleteSubcategoryById(1);

      expect(result).toEqual({ success: true, message: 'Subcategory 1 deleted' });
      expect(revalidatePath).toHaveBeenCalledWith('/dashboard');
      expect(revalidatePath).toHaveBeenCalledWith('/transactions');
      expect(revalidatePath).toHaveBeenCalledWith('/manage');
    });

    it('returns a failure result without throwing when the backend rejects the deletion', async () => {
      (global.fetch as jest.Mock).mockResolvedValue(new Response('', { status: 500 }));

      const result = await deleteSubcategoryById(1);

      expect(result).toEqual({ success: false, message: 'Failed to delete Subcategory: 1' });
    });
  });
});
