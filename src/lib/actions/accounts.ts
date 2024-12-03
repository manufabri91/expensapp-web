'use server';

import { headers } from 'next/headers';
import { AccountResponse } from '@/types/dto/accountResponse';

export const getAccounts = async (): Promise<AccountResponse[]> => {
  const response = await fetch(`${process.env.BASE_URL}/api/account`, {
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
