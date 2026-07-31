'use server';

import { revalidatePath, unstable_noStore } from 'next/cache';
import { backendFetch } from '@/lib/api/backendFetch';
import { parseCalendarDateOnly as parseDateOnly, toBackendPath } from '@/lib/utils/date';
import { RecurringTransactionRequest, RecurringTransactionResponse } from '@/types/dto';
import { RecurrenceFrequency } from '@/types/enums/recurrenceFrequency';
import { TransactionType } from '@/types/enums/transactionType';
import { ActionResult } from '@/types/viewModel/actionResult';

const buildPayload = (data: Record<string, FormDataEntryValue>, daysOfMonth: number[]): RecurringTransactionRequest => {
  const frequency = data.frequency as RecurrenceFrequency;
  return {
    type: data.type as TransactionType,
    amount: Math.abs(Number(data.amount)),
    description: String(data.description),
    accountId: Number(data.account),
    categoryId: Number(data.category),
    subcategoryId: Number(data.subcategory),
    frequency,
    intervalDays: frequency === RecurrenceFrequency.INTERVAL_DAYS ? Number(data.intervalDays) : undefined,
    daysOfMonth: frequency === RecurrenceFrequency.MONTHLY_DAYS ? daysOfMonth : undefined,
    startDate: parseDateOnly(data.startDate ? String(data.startDate) : null) ?? new Date().toISOString(),
    endDate: parseDateOnly(data.endDate ? String(data.endDate) : null),
    excludeFromTotals: data.excludeFromTotals === 'on',
  };
};

export const getRecurringTransactions = async (url: string): Promise<RecurringTransactionResponse[]> => {
  const response = await backendFetch(toBackendPath(url), { revalidate: 3600 });

  if (!response.ok) {
    throw new Error('Failed to fetch recurring transactions');
  }

  return await response.json();
};

export const createRecurringTransaction = async (formData: FormData): Promise<RecurringTransactionResponse> => {
  unstable_noStore();
  const data = Object.fromEntries(formData);
  const daysOfMonth = formData.getAll('daysOfMonth').map(Number);
  const payload = buildPayload(data, daysOfMonth);
  const response = await backendFetch('/recurrent-transaction', { method: 'POST', body: payload });

  if (!response.ok) {
    throw new Error('Failed to create recurring transaction');
  }

  revalidatePath('/dashboard');
  revalidatePath('/transactions');
  revalidatePath('/manage');
  return await response.json();
};

export const editRecurringTransaction = async (formData: FormData): Promise<RecurringTransactionResponse> => {
  unstable_noStore();
  const data = Object.fromEntries(formData);
  const daysOfMonth = formData.getAll('daysOfMonth').map(Number);
  const payload = buildPayload(data, daysOfMonth);
  const response = await backendFetch(`/recurrent-transaction/${data.id}`, { method: 'PUT', body: payload });

  if (!response.ok) {
    throw new Error(`Failed to edit recurring transaction ${data.id}. Please try again later.`);
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
