'use server';

import { headers } from 'next/headers';
import { getBaseUrl } from '@/lib/utils/url';
import { SubCategoryResponse } from '@/types/dto';

export const getSubcategories = async (): Promise<SubCategoryResponse[]> => {
  const baseUrl = await getBaseUrl();
  const response = await fetch(`${baseUrl}/api/subcategory`, {
    headers: await headers(),
    next: {
      revalidate: 3600,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch subcategories');
  }
  return await response.json();
};
