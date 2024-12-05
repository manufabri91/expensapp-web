'use server';

import { headers as nextHeaders } from 'next/headers';
import { getBaseUrl } from '@/lib/utils/url';
import { SubCategoryResponse } from '@/types/dto';

export const getSubcategories = async (): Promise<SubCategoryResponse[]> => {
  const baseUrl = await getBaseUrl();
  const headers = await nextHeaders();
  const response = await fetch(`${baseUrl}/api/subcategory`, {
    headers,
    next: {
      revalidate: 3600,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch subcategories');
  }
  return await response.json();
};
