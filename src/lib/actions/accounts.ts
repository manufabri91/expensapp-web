'use server';

import { headers as nextHeaders } from 'next/headers';
import { AccountRequest, AccountResponse } from '@/types/dto';
import { getBaseUrl } from '@/lib/utils/url';
import { revalidatePath, unstable_noStore } from 'next/cache';

export const getAccounts = async (): Promise<AccountResponse[]> => {
  const baseUrl = await getBaseUrl();
  const cookie = (await nextHeaders()).get('cookie')!;
  const response = await fetch(`${baseUrl}/api/account`, {
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

export const createAccount = async (formData: FormData): Promise<AccountResponse> => {
  unstable_noStore();
  const data = Object.fromEntries(formData);

  console.log('data', data);
  const payload: AccountRequest = {
    name: String(data.name),
    currency: String(data.currency),
    initialBalance: Number(data.initialBalance),
  };
  console.log(payload);
  const baseUrl = await getBaseUrl();
  const cookie = (await nextHeaders()).get('cookie')!;
  const response = await fetch(`${baseUrl}/api/account`, {
    method: 'POST',
    headers: {
      cookie,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to create account`);
  }

  revalidatePath('/dashboard');
  revalidatePath('/accounts');
  return await response.json();
};

export const editAccount = async (formData: FormData): Promise<AccountResponse> => {
  unstable_noStore();
  const data = Object.fromEntries(formData);

  console.log('data', data);
  const payload: AccountRequest = {
    id: Number(data.id),
    name: String(data.name),
    currency: String(data.currency),
    initialBalance: Number(data.initialBalance),
  };
  const baseUrl = await getBaseUrl();
  const cookie = (await nextHeaders()).get('cookie')!;
  const response = await fetch(`${baseUrl}/api/account`, {
    method: 'POST',
    headers: {
      cookie,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to create account`);
  }

  revalidatePath('/dashboard');
  revalidatePath('/accounts');
  return await response.json();
};
