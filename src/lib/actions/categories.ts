'use server';

import { headers } from 'next/headers';
import { getBaseUrl } from '@/lib/utils/url';
import { CategoryResponse } from '@/types/dto';

export const getCategories = async (): Promise<CategoryResponse[]> => {
  const baseUrl = await getBaseUrl();
  const response = await fetch(`${baseUrl}/api/category`, {
    headers: await headers(),
    next: {
      revalidate: 3600,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch accounts');
  }
  return await response.json();
};
