'use server';

import { headers as nextHeaders } from 'next/headers';
import { AccountRequest, AccountResponse } from '@/types/dto';
import { getBaseUrl } from '@/lib/utils/url';
import { revalidatePath, unstable_noStore } from 'next/cache';
import { ActionResult } from '@/types/viewModel/actionResult';

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
  revalidatePath('/manage');
  return await response.json();
};

export const editAccount = async (formData: FormData): Promise<AccountResponse> => {
  unstable_noStore();
  const data = Object.fromEntries(formData);

  const payload: AccountRequest = {
    id: Number(data.id),
    name: String(data.name),
    currency: String(data.currency),
    initialBalance: Number(data.initialBalance),
  };
  const baseUrl = await getBaseUrl();
  const cookie = (await nextHeaders()).get('cookie')!;
  const response = await fetch(`${baseUrl}/api/account/${data.id}`, {
    method: 'PUT',
    headers: {
      cookie,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to edit account`);
  }

  revalidatePath('/dashboard');
  revalidatePath('/manage');
  return await response.json();
};

export const deleteAccountById = async (id: number): Promise<ActionResult> => {
  unstable_noStore();
  const baseUrl = await getBaseUrl();
  const cookie = (await nextHeaders()).get('cookie')!;
  const response = await fetch(`${baseUrl}/api/account/${id}`, {
    method: 'DELETE',
    headers: { cookie },
  });

  revalidatePath('/dashboard');
  revalidatePath('/manage');
  if (!response.ok) {
    return { success: false, message: `Failed to delete Account: ${id}` };
  }
  return { success: true, message: `Transaction ${id} deleted` };
};
