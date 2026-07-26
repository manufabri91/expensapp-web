'use server';

import { parseISO } from 'date-fns';
import { revalidatePath, unstable_noStore } from 'next/cache';
import { backendFetch } from '@/lib/api/backendFetch';
import { CurrencySummaryResponse, TransactionRequest, TransactionResponse } from '@/types/dto';
import { PagedResponse } from '@/types/dto/pageable';
import { TransactionType } from '@/types/enums/transactionType';
import { ActionResult } from '@/types/viewModel/actionResult';

// Cache invariant: every read below uses `next: { revalidate: 3600 }` (1h). Any mutation that
// touches transactions MUST call revalidatePath for every affected page (dashboard/transactions
// /manage) below, or reads will keep serving stale data for up to an hour.

// TODO: remove this once BE ignores time (TX will care only about date)
const parseEventDate = (eventDate: string | null): string | null => {
  if (!eventDate) return null;

  // `eventDate` arrives as a plain YYYY-MM-DD calendar date with no time/timezone info.
  // parseISO() treats a date-only string as midnight in the SERVER's local timezone, and the
  // previous implementation re-serialized it with formatISO(), which renders using that same
  // local offset - so the exact same date string could shift by a day depending on the
  // server's timezone relative to UTC. Anchor the date explicitly at UTC midnight and
  // serialize with toISOString() (always UTC, always 'Z') so the round trip is
  // timezone-independent and always represents the exact calendar date the user picked. The
  // backend deserializes this into an OffsetDateTime, which accepts this format fine.
  return parseISO(`${eventDate}T00:00:00.000Z`).toISOString();
};

// `url` historically referred to this app's own `/api/...` route handlers; the backend exposes
// the same paths without the `/api` prefix.
const toBackendPath = (url: string): string => url.replace(/^\/api/, '');

export const getTransactions = async (url: string): Promise<PagedResponse<TransactionResponse>> => {
  const response = await backendFetch(toBackendPath(url), { revalidate: 3600 });

  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }

  return await response.json();
};

export const getFilteredTotals = async (url: string): Promise<CurrencySummaryResponse[]> => {
  const response = await backendFetch(toBackendPath(url), { revalidate: 3600 });

  if (!response.ok) {
    throw new Error('Failed to fetch filtered totals');
  }

  return await response.json();
};

export const getTransactionsByMonthAndYear = async (month: number, year: number): Promise<TransactionResponse[]> => {
  const response = await backendFetch(`/transaction/monthly/${year}/${month}`, { revalidate: 3600 });

  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }

  return await response.json();
};

export const createTransaction = async (formData: FormData): Promise<TransactionResponse> => {
  unstable_noStore();
  const data = Object.fromEntries(formData);
  const payload: TransactionRequest = {
    eventDate: parseEventDate(data.eventDate ? String(data.eventDate) : null),
    amount: Math.abs(Number(data.amount)),
    description: String(data.description),
    accountId: Number(data.account),
    categoryId: Number(data.category),
    subcategoryId: Number(data.subcategory),
    type: data.type as TransactionType,
    destinationAccountId: data.destinationAccount ? Number(data.destinationAccount) : undefined,
    excludeFromTotals: data.excludeFromTotals === 'on',
  };
  const response = await backendFetch('/transaction', { method: 'POST', body: payload });

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
    eventDate: parseEventDate(data.eventDate ? String(data.eventDate) : null),
    amount: Math.abs(Number(data.amount)),
    description: String(data.description),
    accountId: Number(data.account),
    categoryId: Number(data.category),
    subcategoryId: Number(data.subcategory),
    type: data.type as TransactionType,
    destinationAccountId: data.destinationAccount ? Number(data.destinationAccount) : undefined,
    excludeFromTotals: data.excludeFromTotals === 'on',
  };
  const response = await backendFetch(`/transaction/${data.id}`, { method: 'PUT', body: payload });

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
  const response = await backendFetch(`/transaction/${id}`, { method: 'DELETE' });

  revalidatePath('/dashboard');
  revalidatePath('/transactions');
  revalidatePath('/manage');
  if (!response.ok) {
    return { success: false, message: `Failed to delete Transaction: ${id}` };
  }

  return { success: true, message: `Transaction ${id} deleted` };
};
