import { parseISO } from 'date-fns';
import { useCallback } from 'react';
import { RecurringTransactionResponse, TransactionResponse } from '@/types/dto';
import { RecurrenceFrequency } from '@/types/enums/recurrenceFrequency';
import { TransactionType } from '@/types/enums/transactionType';
import { TransactionFormValues } from './types';
export const useTransactionDefaults = (accountId?: number) => {
  const buildOneTimeDefaults = useCallback(
    (): TransactionFormValues => ({
      id: undefined,
      amount: 0,
      type: TransactionType.EXPENSE,
      account: accountId,
      destinationAccount: undefined,
      category: undefined,
      subcategory: undefined,
      description: '',
      excludeFromTotals: false,
      eventDate: new Date(),
      frequency: RecurrenceFrequency.INTERVAL_DAYS,
      intervalDays: 1,
      daysOfMonth: [],
      startDate: new Date(),
      endDate: new Date(),
      hasEndDate: false,
    }),
    [accountId]
  );

  const buildRecurringDefaults = useCallback(
    (): TransactionFormValues => ({
      ...buildOneTimeDefaults(),
      eventDate: undefined,
    }),
    [buildOneTimeDefaults]
  );

  const buildOneTimeDefaultsFromTransaction = useCallback(
    (transaction: TransactionResponse): TransactionFormValues => ({
      id: transaction.id,
      amount: Number(Math.abs(transaction.amount).toFixed(2)),
      type: transaction.type,
      account:
        transaction.type === TransactionType.TRANSFER && transaction.subcategory.name === 'TRANSFER.IN.SUBCATEGORY'
          ? transaction.linkedTransaction?.accountId
          : transaction.accountId,
      destinationAccount:
        transaction.type === TransactionType.TRANSFER
          ? transaction.subcategory.name === 'TRANSFER.IN.SUBCATEGORY'
            ? transaction.accountId
            : transaction.linkedTransaction?.accountId
          : undefined,
      category: transaction.type === TransactionType.TRANSFER ? undefined : transaction.category.id,
      subcategory: transaction.type === TransactionType.TRANSFER ? undefined : transaction.subcategory.id,
      description: transaction.description,
      excludeFromTotals: transaction.excludeFromTotals,
      eventDate: parseISO(transaction.eventDate),
      frequency: RecurrenceFrequency.INTERVAL_DAYS,
      intervalDays: 1,
      daysOfMonth: [],
      startDate: new Date(),
      endDate: new Date(),
      hasEndDate: false,
    }),
    []
  );

  const buildRecurringDefaultsFromRecurrence = useCallback(
    (recurrence: RecurringTransactionResponse): TransactionFormValues => ({
      id: recurrence.id,
      amount: recurrence.amount,
      type: recurrence.type,
      account: recurrence.accountId,
      destinationAccount: undefined,
      category: recurrence.category.id,
      subcategory: recurrence.subcategory.id,
      description: recurrence.description,
      excludeFromTotals: recurrence.excludeFromTotals,
      eventDate: undefined,
      frequency: recurrence.frequency,
      intervalDays: recurrence.intervalDays ?? 1,
      daysOfMonth: recurrence.daysOfMonth ?? [],
      startDate: parseISO(recurrence.startDate),
      endDate: recurrence.endDate ? parseISO(recurrence.endDate) : new Date(),
      hasEndDate: !!recurrence.endDate,
    }),
    []
  );

  return {
    buildOneTimeDefaults,
    buildRecurringDefaults,
    buildOneTimeDefaultsFromTransaction,
    buildRecurringDefaultsFromRecurrence,
  };
};
