'use server';

import { headers as nextHeaders } from 'next/headers';
import { AccountResponse } from '@/types/dto';
import { getBaseUrl } from '@/lib/utils/url';

export const getAccounts = async (): Promise<AccountResponse[]> => {
  const baseUrl = await getBaseUrl();
  const headers = await nextHeaders();
  const response = await fetch(`${baseUrl}/api/account`, {
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
