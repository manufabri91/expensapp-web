'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useMemo } from 'react';
import { useAccounts } from '@/lib/providers/AccountsProvider';
import { ProgrammedTransactionsResponse, RecurringTransactionResponse } from '@/types/dto';
import { ProgrammedTransactionsCard } from './components/ProgrammedTransactionsCard';
import { useProgrammedTransactions } from './useProgrammedTransactions';
import { useRecurringTransactions } from './useRecurringTransactions';

const EMPTY_PROGRAMMED_TRANSACTIONS: ProgrammedTransactionsResponse = { expenses: [], incomes: [] };

interface Props {
  initialProgrammedTransactions?: ProgrammedTransactionsResponse;
  initialRecurrences?: RecurringTransactionResponse[];
}

export const ProgrammedTransactionsSection = ({ initialProgrammedTransactions, initialRecurrences }: Props) => {
  const t = useTranslations('ProgrammedTransactions');
  const { accounts } = useAccounts();
  const { data: programmedTransactions, isLoading, mutate } = useProgrammedTransactions(initialProgrammedTransactions);
  // Recurring rows are listed by the programmed endpoint as flat occurrences; their full
  // recurrence (status, end date, schedule) - which the unchanged Edit/Pause/Cancel/Delete
  // buttons operate on - still comes from the recurring-transaction list.
  const { data: recurrences, mutate: mutateRecurrences } = useRecurringTransactions(initialRecurrences);

  const accountsById = useMemo(() => new Map(accounts.map((account) => [account.id, account])), [accounts]);
  const recurrencesById = useMemo(
    () => new Map((recurrences ?? []).map((recurrence) => [recurrence.id, recurrence])),
    [recurrences]
  );
  const lookups = useMemo(() => ({ accountsById, recurrencesById }), [accountsById, recurrencesById]);

  // Every row action can invalidate both lists (deleting a recurrence removes its occurrences;
  // confirming a pending transaction removes it from the programmed list), so revalidate both.
  const handleChanged = useCallback(() => {
    mutate();
    mutateRecurrences();
  }, [mutate, mutateRecurrences]);

  const { expenses, incomes } = programmedTransactions ?? EMPTY_PROGRAMMED_TRANSACTIONS;

  return (
    <div className="flex w-full flex-col gap-4 md:max-w-lg">
      <ProgrammedTransactionsCard
        title={t('title.payments')}
        anchorId="programmed-payments"
        items={expenses}
        isLoading={isLoading}
        lookups={lookups}
        onChanged={handleChanged}
      />
      <ProgrammedTransactionsCard
        title={t('title.incomes')}
        anchorId="programmed-incomes"
        items={incomes}
        isLoading={isLoading}
        lookups={lookups}
        onChanged={handleChanged}
      />
    </div>
  );
};
