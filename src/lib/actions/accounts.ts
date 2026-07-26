'use server';

import { revalidatePath, unstable_noStore } from 'next/cache';
import { backendFetch } from '@/lib/api/backendFetch';
import { AccountRequest, AccountResponse } from '@/types/dto';
import { ActionResult } from '@/types/viewModel/actionResult';

// Cache invariant: every read below uses `next: { revalidate: 3600 }` (1h). Any mutation that
// touches accounts MUST call revalidatePath for every affected page (dashboard/manage) below,
// or reads will keep serving stale data for up to an hour.

export const getAccounts = async (): Promise<AccountResponse[]> => {
  const response = await backendFetch('/account', { revalidate: 3600 });
  if (!response.ok) {
    throw new Error('Failed to fetch accounts');
  }
  return await response.json();
};

export const createAccount = async (formData: FormData): Promise<AccountResponse> => {
  unstable_noStore();
  const data = Object.fromEntries(formData);

  const payload: AccountRequest = {
    name: String(data.name),
    currency: String(data.currency),
    initialBalance: Number(data.initialBalance),
  };
  const response = await backendFetch('/account', { method: 'POST', body: payload });

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
  const response = await backendFetch(`/account/${data.id}`, { method: 'PUT', body: payload });

  if (!response.ok) {
    throw new Error(`Failed to edit account`);
  }

  revalidatePath('/dashboard');
  revalidatePath('/manage');
  return await response.json();
};

export const deleteAccountById = async (id: number): Promise<ActionResult> => {
  unstable_noStore();
  const response = await backendFetch(`/account/${id}`, { method: 'DELETE' });

  revalidatePath('/dashboard');
  revalidatePath('/manage');
  if (!response.ok) {
    return { success: false, message: `Failed to delete Account: ${id}` };
  }
  return { success: true, message: `Transaction ${id} deleted` };
};
