'use server';

import { headers } from 'next/headers';
import { TransactionCreateRequest, TransactionResponse } from '@/types/dto';
import { revalidatePath, unstable_noStore } from 'next/cache';
import { getBaseUrl } from '@/lib/utils/url';
import { formatISO } from 'date-fns';

export const getTransactions = async (): Promise<TransactionResponse[]> => {
  const baseUrl = await getBaseUrl();
  const response = await fetch(`${baseUrl}/api/transaction`, {
    headers: await headers(),
    next: {
      revalidate: 3600,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }
  return await response.json();
};

export const getTransactionsByMonthAndYear = async (month: number, year: number): Promise<TransactionResponse[]> => {
  const baseUrl = await getBaseUrl();
  const response = await fetch(`${baseUrl}/api/transaction/monthly/${year}/${month}`, {
    headers: await headers(),
    next: {
      revalidate: 3600,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }
  return await response.json();
};

export const createTransaction = async (_: unknown, formData: FormData): Promise<TransactionResponse> => {
  unstable_noStore();
  const data = Object.fromEntries(formData);
  const payload: TransactionCreateRequest = {
    eventDate: data.eventDate ? formatISO(String(data.eventDate)) : null,
    amount: data.type === 'expense' ? -Number(data.amount) : Number(data.amount),
    description: String(data.description),
    accountId: Number(data.account),
    categoryId: Number(data.category),
    subcategoryId: Number(data.subcategory),
  };
  const baseUrl = await getBaseUrl();
  const cookie = (await headers()).get('cookie')!;
  const response = await fetch(`${baseUrl}/api/transaction`, {
    method: 'POST',
    headers: {
      cookie,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to create transaction `);
  }

  revalidatePath('/dashboard');
  revalidatePath('/transactions');
  return await response.json();
};

export const deleteTransactionById = async (id: number): Promise<TransactionResponse[]> => {
  unstable_noStore();
  const baseUrl = await getBaseUrl();
  const response = await fetch(`${baseUrl}/api/transaction/${id}`, {
    method: 'DELETE',
    headers: await headers(),
  });

  revalidatePath('/dashboard');
  revalidatePath('/transactions');
  if (!response.ok) {
    throw new Error(`Failed to delete transaction with id ${id}`);
  }
  return await response.json();
};
