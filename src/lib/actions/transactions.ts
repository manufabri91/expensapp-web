'use server';

import { headers } from 'next/headers';
import { TransactionResponse } from '@/types/dto/transactionResponse';
import { revalidatePath, unstable_noStore } from 'next/cache';

export const getTransactions = async (): Promise<TransactionResponse[]> => {
  const response = await fetch(`${process.env.BASE_URL}/api/transaction`, {
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
  const response = await fetch(`${process.env.BASE_URL}/api/transaction/monthly/${year}/${month}`, {
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
  const response = await fetch(`${process.env.BASE_URL}/api/transaction/${id}`, {
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
