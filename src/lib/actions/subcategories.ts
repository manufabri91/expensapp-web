'use server';

import { revalidatePath, unstable_noStore } from 'next/cache';
import { headers as nextHeaders } from 'next/headers';
import { getBaseUrl } from '@/lib/utils/url';
import { SubCategoryResponse } from '@/types/dto';
import { SubCategoryRequest } from '@/types/dto/subcategoryRequest';
import { ActionResult } from '@/types/viewModel/actionResult';

export const getSubcategories = async (): Promise<SubCategoryResponse[]> => {
  const baseUrl = await getBaseUrl();
  const cookie = (await nextHeaders()).get('cookie')!;
  const response = await fetch(`${baseUrl}/api/subcategory`, {
    headers: {
      cookie,
    },
    next: {
      revalidate: 3600,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch subcategories');
  }
  return await response.json();
};

export const getSubcategoriesByParentCategoryId = async (url: string): Promise<SubCategoryResponse[]> => {
  const baseUrl = await getBaseUrl();
  const cookie = (await nextHeaders()).get('cookie')!;

  const response = await fetch(`${baseUrl}${url}`, {
    headers: {
      cookie,
    },
    next: {
      revalidate: 3600,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }

  return await response.json();
};

export const createSubcategory = async (formData: FormData): Promise<SubCategoryResponse> => {
  unstable_noStore();
  const data = Object.fromEntries(formData);

  const payload: SubCategoryRequest = {
    id: Number(data.id),
    name: String(data.name),
    parentCategoryId: Number(data.parentCategoryId),
    readOnly: false, // read only is only for system categories
  };

  const baseUrl = await getBaseUrl();
  const cookie = (await nextHeaders()).get('cookie')!;
  const response = await fetch(`${baseUrl}/api/subcategory`, {
    method: 'POST',
    headers: {
      cookie,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to create Subcategory`);
  }

  revalidatePath('/dashboard');
  revalidatePath('/manage');
  return await response.json();
};

export const editSubcategory = async (formData: FormData): Promise<SubCategoryResponse> => {
  unstable_noStore();
  const data = Object.fromEntries(formData);

  const payload: SubCategoryRequest = {
    name: String(data.name),
    parentCategoryId: Number(data.parentCategoryId),
  };

  const baseUrl = await getBaseUrl();
  const cookie = (await nextHeaders()).get('cookie')!;
  const response = await fetch(`${baseUrl}/api/subcategory/${data.id}`, {
    method: 'PUT',
    headers: {
      cookie,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to edit Subcategory`);
  }

  revalidatePath('/dashboard');
  revalidatePath('/manage');
  return await response.json();
};

export const deleteSubcategoryById = async (id: number): Promise<ActionResult> => {
  unstable_noStore();
  const baseUrl = await getBaseUrl();
  const cookie = (await nextHeaders()).get('cookie')!;
  const response = await fetch(`${baseUrl}/api/subcategory/${id}`, {
    method: 'DELETE',
    headers: { cookie },
  });

  if (!response.ok) {
    return { success: false, message: `Failed to delete Subcategory: ${id}` };
  }

  revalidatePath('/dashboard');
  revalidatePath('/manage');
  return { success: true, message: `Subcategory ${id} deleted` };
};
