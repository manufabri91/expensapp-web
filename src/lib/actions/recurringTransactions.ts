'use server';

import { revalidatePath, unstable_noStore } from 'next/cache';
import { backendFetch } from '@/lib/api/backendFetch';
import { recurringTransactionServerSchema } from '@/schemas/transaction';
import { RecurringTransactionRequest, RecurringTransactionResponse } from '@/types/dto';
import { ActionResult } from '@/types/viewModel/actionResult';

// Unlike the other actions in this file, this one is never called with a dynamic path (its SWR
// key is always the literal '/api/recurring-transaction'), so it hardcodes the backend path
// directly rather than deriving it with toBackendPath - that helper assumes the frontend and
// backend path segments match, which isn't true here: the backend route is `/recurrent-transaction`
// (not `/recurring-transaction`).
export const getRecurringTransactions = async (): Promise<RecurringTransactionResponse[]> => {
  const response = await backendFetch('/recurrent-transaction', { revalidate: 3600 });

  if (!response.ok) {
    throw new Error('Failed to fetch recurring transactions');
  }

  return await response.json();
};

export const createRecurringTransaction = async (
  data: RecurringTransactionRequest
): Promise<RecurringTransactionResponse> => {
  unstable_noStore();
  const parsed = recurringTransactionServerSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error('Invalid recurring transaction data');
  }

  const payload: RecurringTransactionRequest = parsed.data;
  const response = await backendFetch('/recurrent-transaction', { method: 'POST', body: payload });

  if (!response.ok) {
    throw new Error('Failed to create recurring transaction');
  }

  revalidatePath('/dashboard');
  revalidatePath('/transactions');
  revalidatePath('/manage');
  return await response.json();
};

export const editRecurringTransaction = async (
  data: RecurringTransactionRequest
): Promise<RecurringTransactionResponse> => {
  unstable_noStore();
  const parsed = recurringTransactionServerSchema.safeParse(data);
  if (!parsed.success || !parsed.data.id) {
    throw new Error('Invalid recurring transaction data');
  }

  const payload: RecurringTransactionRequest = parsed.data;
  const response = await backendFetch(`/recurrent-transaction/${parsed.data.id}`, { method: 'PUT', body: payload });

  if (!response.ok) {
    throw new Error(`Failed to edit recurring transaction ${parsed.data.id}. Please try again later.`);
  }

  revalidatePath('/dashboard');
  revalidatePath('/transactions');
  revalidatePath('/manage');
  return await response.json();
};

type RecurrenceStatusAction = 'pause' | 'resume' | 'cancel';

const patchRecurringTransactionStatus = async (
  id: number,
  action: RecurrenceStatusAction
): Promise<RecurringTransactionResponse> => {
  unstable_noStore();
  const response = await backendFetch(`/recurrent-transaction/${id}/${action}`, { method: 'PATCH' });

  if (!response.ok) {
    throw new Error(`Failed to ${action} recurring transaction ${id}`);
  }

  // Dashboard's "upcoming recurring" cards (getDashboardSummaryData.ts) derive from the same
  // getRecurringTransactions() read, so a pause/resume/cancel here must also revalidate it.
  revalidatePath('/dashboard');
  revalidatePath('/transactions');
  return await response.json();
};

export const pauseRecurringTransaction = async (id: number) => patchRecurringTransactionStatus(id, 'pause');
export const resumeRecurringTransaction = async (id: number) => patchRecurringTransactionStatus(id, 'resume');
export const cancelRecurringTransaction = async (id: number) => patchRecurringTransactionStatus(id, 'cancel');

export const deleteRecurringTransactionById = async (id: number): Promise<ActionResult> => {
  unstable_noStore();
  const response = await backendFetch(`/recurrent-transaction/${id}`, { method: 'DELETE' });

  revalidatePath('/dashboard');
  revalidatePath('/transactions');
  revalidatePath('/manage');
  if (!response.ok) {
    return { success: false, message: `Failed to delete recurring transaction: ${id}` };
  }

  return { success: true, message: `Recurring transaction ${id} deleted` };
};
