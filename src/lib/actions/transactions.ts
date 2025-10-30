'use server';

import { formatISO } from 'date-fns';
import { revalidatePath, unstable_noStore } from 'next/cache';
import { headers as nextHeaders } from 'next/headers';
import { getBaseUrl } from '@/lib/utils/url';
import { TransactionRequest, TransactionResponse } from '@/types/dto';
import { PagedResponse } from '@/types/dto/pageable';
import { TransactionType } from '@/types/enums/transactionType';
import { ActionResult } from '@/types/viewModel/actionResult';

// TODO: remove this once BE ignores time (TX will care only about date)
const parseEventDate = (eventDate: Date | null): string | null => {
  if (!eventDate) return null;

  const utcDate = new Date(eventDate.getTime() - (eventDate.getTimezoneOffset() * -1) * 60000);
  return formatISO(utcDate);
};

export const getTransactions = async (url: string): Promise<PagedResponse<TransactionResponse>> => {
  const baseUrl = await getBaseUrl();
  const cookie = (await nextHeaders()).get('cookie')!;

  const response = await fetch(`${baseUrl}${url}`, {
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
  const payload: TransactionRequest = {
    eventDate: parseEventDate(data.eventDate ? new Date(String(data.eventDate)) : null),
    amount: Math.abs(Number(data.amount)),
    description: String(data.description),
    accountId: Number(data.account),
    categoryId: Number(data.category),
    subcategoryId: Number(data.subcategory),
    type: data.type as TransactionType,
    destinationAccountId: data.destinationAccount ? Number(data.destinationAccount) : undefined,
    excludeFromTotals: data.excludeFromTotals === 'on',
  };
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
  revalidatePath('/manage');
  return await response.json();
};

export const editTransaction = async (formData: FormData): Promise<TransactionResponse> => {
  unstable_noStore();
  const data = Object.fromEntries(formData);

  const payload: TransactionRequest = {
    eventDate: parseEventDate(data.eventDate ? new Date(String(data.eventDate)) : null),
    amount: Math.abs(Number(data.amount)),
    description: String(data.description),
    accountId: Number(data.account),
    categoryId: Number(data.category),
    subcategoryId: Number(data.subcategory),
    type: data.type as TransactionType,
    destinationAccountId: data.destinationAccount ? Number(data.destinationAccount) : undefined,
    excludeFromTotals: data.excludeFromTotals === 'on',
  };
  const baseUrl = await getBaseUrl();
  const cookie = (await nextHeaders()).get('cookie')!;
  const response = await fetch(`${baseUrl}/api/transaction/${data.id}`, {
    method: 'PUT',
    headers: {
      cookie,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to edit transaction ${data.id}. Please try again later.`);
  }

  revalidatePath('/dashboard');
  revalidatePath('/transactions');
  revalidatePath('/manage');
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
  revalidatePath('/manage');
  if (!response.ok) {
    return { success: false, message: `Failed to delete Transaction: ${id}` };
  }

  return { success: true, message: `Transaction ${id} deleted` };
};
