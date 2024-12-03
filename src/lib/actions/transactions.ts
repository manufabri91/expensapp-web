'use server';

import { headers } from 'next/headers';
import { TransactionResponse } from '@/types/dto/transactionResponse';
import { revalidatePath, unstable_noStore } from 'next/cache';
import { getBaseUrl } from '@/lib/utils/url';

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
