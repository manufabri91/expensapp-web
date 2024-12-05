'use server';

import { headers as nextHeaders } from 'next/headers';
import { getBaseUrl } from '@/lib/utils/url';
import { CategoryResponse } from '@/types/dto';

export const getCategories = async (): Promise<CategoryResponse[]> => {
  const baseUrl = await getBaseUrl();
  const headers = await nextHeaders();
  const response = await fetch(`${baseUrl}/api/category`, {
    headers,
    next: {
      revalidate: 3600,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch accounts');
  }
  return await response.json();
};
