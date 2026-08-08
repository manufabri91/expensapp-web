'use server';

import { revalidatePath, unstable_noStore } from 'next/cache';
import { backendFetch } from '@/lib/api/backendFetch';
import { subcategoryFormSchema, SubcategoryFormValues } from '@/schemas/subcategory';
import { SubCategoryResponse } from '@/types/dto';
import { SubCategoryRequest } from '@/types/dto/subcategoryRequest';
import { ActionResult } from '@/types/viewModel/actionResult';

// Cache invariant: every read below uses `next: { revalidate: 3600 }` (1h). Any mutation that
// touches subcategories MUST call revalidatePath for every affected page (dashboard/transactions
// /manage) below, or reads will keep serving stale data for up to an hour.

export const getSubcategories = async (): Promise<SubCategoryResponse[]> => {
  const response = await backendFetch('/subcategory', { revalidate: 3600 });
  if (!response.ok) {
    throw new Error('Failed to fetch subcategories');
  }
  return await response.json();
};

export const createSubcategory = async (data: SubcategoryFormValues): Promise<SubCategoryResponse> => {
  unstable_noStore();
  const parsed = subcategoryFormSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error('Invalid subcategory data');
  }

  const payload: SubCategoryRequest = {
    name: parsed.data.name,
    parentCategoryId: parsed.data.parentCategoryId,
    readOnly: false, // read only is only for system categories
  };

  const response = await backendFetch('/subcategory', { method: 'POST', body: payload });

  if (!response.ok) {
    throw new Error(`Failed to create Subcategory`);
  }

  revalidatePath('/dashboard');
  revalidatePath('/transactions');
  revalidatePath('/manage');
  return await response.json();
};

export const editSubcategory = async (data: SubcategoryFormValues): Promise<SubCategoryResponse> => {
  unstable_noStore();
  const parsed = subcategoryFormSchema.safeParse(data);
  if (!parsed.success || !parsed.data.id) {
    throw new Error('Invalid subcategory data');
  }

  const payload: SubCategoryRequest = {
    name: parsed.data.name,
    parentCategoryId: parsed.data.parentCategoryId,
  };

  const response = await backendFetch(`/subcategory/${parsed.data.id}`, { method: 'PUT', body: payload });

  if (!response.ok) {
    throw new Error(`Failed to edit Subcategory`);
  }

  revalidatePath('/dashboard');
  revalidatePath('/transactions');
  revalidatePath('/manage');
  return await response.json();
};

export const deleteSubcategoryById = async (id: number): Promise<ActionResult> => {
  unstable_noStore();
  const response = await backendFetch(`/subcategory/${id}`, { method: 'DELETE' });

  if (!response.ok) {
    return { success: false, message: `Failed to delete Subcategory: ${id}` };
  }

  revalidatePath('/dashboard');
  revalidatePath('/transactions');
  revalidatePath('/manage');
  return { success: true, message: `Subcategory ${id} deleted` };
};
