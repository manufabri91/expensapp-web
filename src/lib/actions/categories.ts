'use server';

import { headers as nextHeaders } from 'next/headers';
import { getBaseUrl } from '@/lib/utils/url';
import { CategoryRequest, CategoryResponse } from '@/types/dto';
import { unstable_noStore } from 'next/cache';
import { ActionResult } from '@/types/viewModel/actionResult';

export const getCategories = async (): Promise<CategoryResponse[]> => {
  const baseUrl = await getBaseUrl();
  const cookie = (await nextHeaders()).get('cookie')!;
  const response = await fetch(`${baseUrl}/api/category`, {
    headers: { cookie },
    next: {
      revalidate: 3600,
    },
  });
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

  const baseUrl = await getBaseUrl();
  const cookie = (await nextHeaders()).get('cookie')!;
  const response = await fetch(`${baseUrl}/api/category`, {
    method: 'POST',
    headers: {
      cookie,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to create category`);
  }

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
  const baseUrl = await getBaseUrl();
  const cookie = (await nextHeaders()).get('cookie')!;
  const response = await fetch(`${baseUrl}/api/category/${data.id}`, {
    method: 'PUT',
    headers: {
      cookie,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to edit category`);
  }

  return await response.json();
};

export const deleteCategoryById = async (id: number): Promise<ActionResult> => {
  unstable_noStore();
  const baseUrl = await getBaseUrl();
  const cookie = (await nextHeaders()).get('cookie')!;
  const response = await fetch(`${baseUrl}/api/account/${id}`, {
    method: 'DELETE',
    headers: { cookie },
  });

  if (!response.ok) {
    return { success: false, message: `Failed to delete Category: ${id}` };
  }
  return { success: true, message: `Category ${id} deleted` };
};
