'use server';

import { revalidatePath, unstable_noStore } from 'next/cache';
import { backendFetch } from '@/lib/api/backendFetch';
import { CategoryRequest, CategoryResponse } from '@/types/dto';
import { ActionResult } from '@/types/viewModel/actionResult';

// Cache invariant: every read below uses `next: { revalidate: 3600 }` (1h). Any mutation that
// touches categories MUST call revalidatePath for every affected page (dashboard/manage) below,
// or reads will keep serving stale data for up to an hour.

export const getCategories = async (): Promise<CategoryResponse[]> => {
  const response = await backendFetch('/category', { revalidate: 3600 });
  if (!response.ok) {
    throw new Error('Failed to fetch accounts');
  }
  return await response.json();
};

export const createCategory = async (formData: FormData): Promise<CategoryResponse> => {
  unstable_noStore();
  const data = Object.fromEntries(formData);

  const payload: CategoryRequest = {
    name: String(data.name),
    color: String(data.color),
    iconName: String(data.iconName),
    type: String(data.type),
  };

  const response = await backendFetch('/category', { method: 'POST', body: payload });

  if (!response.ok) {
    throw new Error(`Failed to create category`);
  }

  revalidatePath('/dashboard');
  revalidatePath('/manage');
  return await response.json();
};

export const editCategory = async (formData: FormData): Promise<CategoryResponse> => {
  unstable_noStore();
  const data = Object.fromEntries(formData);

  const payload: CategoryRequest = {
    id: Number(data.id),
    name: String(data.name),
    color: String(data.color),
    iconName: String(data.iconName),
    type: String(data.type),
  };
  const response = await backendFetch(`/category/${data.id}`, { method: 'PUT', body: payload });

  if (!response.ok) {
    throw new Error(`Failed to edit category`);
  }

  revalidatePath('/dashboard');
  revalidatePath('/manage');
  return await response.json();
};

export const deleteCategoryById = async (id: number): Promise<ActionResult> => {
  unstable_noStore();
  const response = await backendFetch(`/category/${id}`, { method: 'DELETE' });

  if (!response.ok) {
    return { success: false, message: `Failed to delete Category: ${id}` };
  }

  revalidatePath('/dashboard');
  revalidatePath('/manage');
  return { success: true, message: `Category ${id} deleted` };
};
