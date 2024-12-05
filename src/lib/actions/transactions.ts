'use server';

import { headers as nextHeaders } from 'next/headers';
import { TransactionCreateRequest, TransactionResponse } from '@/types/dto';
import { revalidatePath, unstable_noStore } from 'next/cache';
import { getBaseUrl } from '@/lib/utils/url';
import { formatISO } from 'date-fns';
import { TransactionType } from '@/types/enums/transactionType';
import { ActionResult } from '@/types/viewModel/actionResult';

export const getTransactions = async (): Promise<TransactionResponse[]> => {
  const baseUrl = await getBaseUrl();
  const cookie = (await nextHeaders()).get('cookie')!;
  const response = await fetch(`${baseUrl}/api/transaction`, {
    headers: {
      cookie,
    },
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
  const cookie = (await nextHeaders()).get('cookie')!;
  const response = await fetch(`${baseUrl}/api/transaction/monthly/${year}/${month}`, {
    headers: {
      cookie,
    },
    next: {
      revalidate: 3600,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }
  return await response.json();
};

export const createTransaction = async (formData: FormData): Promise<TransactionResponse> => {
  unstable_noStore();
  const data = Object.fromEntries(formData);
  const payload: TransactionCreateRequest = {
    eventDate: data.eventDate ? formatISO(String(data.eventDate)) : null,
    amount: data.type === TransactionType.EXPENSE ? -Number(data.amount) : Number(data.amount),
    description: String(data.description),
    accountId: Number(data.account),
    categoryId: Number(data.category),
    subcategoryId: Number(data.subcategory),
  };
  console.log(payload);
  const baseUrl = await getBaseUrl();
  const cookie = (await nextHeaders()).get('cookie')!;
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

export const editTransaction = async (formData: FormData): Promise<TransactionResponse> => {
  // TODO: refactor after is implemented in backend
  unstable_noStore();
  const data = Object.fromEntries(formData);

  const baseUrl = await getBaseUrl();
  const cookie = (await nextHeaders()).get('cookie')!;
  const deleteResponse = await fetch(`${baseUrl}/api/transaction/${data.id}`, {
    method: 'DELETE',
    headers: { cookie },
  });
  if (!deleteResponse.ok) {
    throw new Error(`Failed to edit transaction with id: ${data.id}`);
  }
  const payload: TransactionCreateRequest = {
    eventDate: data.eventDate ? formatISO(String(data.eventDate)) : null,
    amount: data.type === TransactionType.EXPENSE ? -Number(data.amount) : Number(data.amount),
    description: String(data.description),
    accountId: Number(data.account),
    categoryId: Number(data.category),
    subcategoryId: Number(data.subcategory),
  };
  const response = await fetch(`${baseUrl}/api/transaction`, {
    method: 'POST',
    headers: {
      cookie,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Catastrophic failure. TX Lost. ${data.id}`);
  }

  revalidatePath('/dashboard');
  revalidatePath('/transactions');
  return await response.json();
};

export const deleteTransactionById = async (id: number): Promise<ActionResult> => {
  unstable_noStore();
  const baseUrl = await getBaseUrl();
  const cookie = (await nextHeaders()).get('cookie')!;
  const response = await fetch(`${baseUrl}/api/transaction/${id}`, {
    method: 'DELETE',
    headers: { cookie },
  });

  revalidatePath('/dashboard');
  revalidatePath('/transactions');
  if (!response.ok) {
    return { success: false, message: `Failed to delete Transaction: ${id}` };
  }
  return { success: true, message: `Transaction ${id} deleted` };
};
