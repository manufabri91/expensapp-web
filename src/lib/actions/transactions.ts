'use server';

import { revalidatePath, unstable_noStore } from 'next/cache';
import { backendFetch } from '@/lib/api/backendFetch';
import { parseCalendarDateOnly, toBackendPath } from '@/lib/utils/date';
import { CurrencySummaryResponse, TransactionRequest, TransactionResponse } from '@/types/dto';
import { PagedResponse } from '@/types/dto/pageable';
import { TransactionType } from '@/types/enums/transactionType';
import { ActionResult } from '@/types/viewModel/actionResult';
import { TransactionFilters, transactionFiltersToQueryParams } from '@/types/viewModel/transactionFilters';

// Cache invariant: every read below uses `next: { revalidate: 3600 }` (1h). Any mutation that
// touches transactions MUST call revalidatePath for every affected page (dashboard/transactions
// /manage) below, or reads will keep serving stale data for up to an hour.

// TODO: remove this once BE ignores time (TX will care only about date)
const parseEventDate = parseCalendarDateOnly;

export const getTransactions = async (url: string): Promise<PagedResponse<TransactionResponse>> => {
  const response = await backendFetch(toBackendPath(url), { revalidate: 3600 });

  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }

  return await response.json();
};

// Shared by every page-level Server Component that prefetches a transaction table's first page
// (see TransactionsTableSection / InfiniteTransactionsTableSection), so the query-param-building
// call site isn't duplicated across pages.
export const getInitialTransactionsPage = async (
  filters: TransactionFilters
): Promise<PagedResponse<TransactionResponse>> => getTransactions(`/api/transaction${transactionFiltersToQueryParams(filters)}`);

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

// Fetches the full record for a single transaction - e.g. to populate the edit form for a pending
// one-time item, whose flat UpcomingTransactionItem shape doesn't carry enough fields (category,
// subcategory, currency, ...) to seed TransactionForm on its own. Deliberately uncached
// (unstable_noStore) since this always runs right before showing the user the current state of
// the record they're about to edit.
export const getTransactionById = async (id: number): Promise<TransactionResponse> => {
  unstable_noStore();
  const response = await backendFetch(`/transaction/${id}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch transaction ${id}`);
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

export const confirmTransaction = async (id: number): Promise<TransactionResponse> => {
  unstable_noStore();
  const response = await backendFetch(`/transaction/${id}/confirm`, { method: 'PATCH' });
  if (!response.ok) {
    throw new Error(`Failed to confirm transaction ${id}`);
  }
  revalidatePath('/dashboard');
  revalidatePath('/transactions');
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
