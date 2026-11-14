import { toast } from '@heroui/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useSWRConfig } from 'swr';
import { TransactionMode } from '@/components/TransactionModeSelector';
import { getRecentTransactionsCacheKey } from '@/components/TransactionsTable/useInfiniteTransactions';
import { createRecurringTransaction, editRecurringTransaction } from '@/lib/actions/recurringTransactions';
import { createTransaction, editTransaction } from '@/lib/actions/transactions';
import { useAccountPreferences } from '@/lib/providers/AccountPreferencesProvider';
import { useTransactionsFilters } from '@/lib/providers/TransactionFiltersProvider';
import { RecurringTransactionRequest, TransactionRequest, TransactionResponse } from '@/types/dto';
import { PagedResponse } from '@/types/dto/pageable';
import { useTransactionForm } from './TransactionFormProvider';
import { TransactionFormValues } from './types';

export const useTransactionSubmit = ({
  form,
  mode,
  setMode,
  buildOneTimeDefaults,
}: {
  form: UseFormReturn<TransactionFormValues>;
  mode: TransactionMode;
  setMode: (mode: TransactionMode) => void;
  buildOneTimeDefaults: () => TransactionFormValues;
}) => {
  const { mutate } = useSWRConfig();
  const t = useTranslations();
  const router = useRouter();
  const { filters } = useTransactionsFilters();
  const preferences = useAccountPreferences();
  const { overlayState, clearForm, transactionFormData, recurringFormData } = useTransactionForm();
  const isEditingExisting = !!transactionFormData || !!recurringFormData;
  const { reset, getValues } = form;
  const [saveError, setSaveError] = useState('');
  const revalidateTransactions = () =>
    mutate((key) => typeof key === 'string' && key.startsWith('/api/transaction'), undefined, { revalidate: true });

  const revalidateRecurringTransactions = () =>
    mutate((key) => typeof key === 'string' && key.startsWith('/api/recurring-transaction'), undefined, {
      revalidate: true,
    });

  const insertIntoRecentTransactions = (transaction: TransactionResponse) => {
    mutate<PagedResponse<TransactionResponse>[]>(
      getRecentTransactionsCacheKey(filters),
      (pages) => {
        if (!pages || pages.length === 0) return pages;
        const [firstPage, ...rest] = pages;
        return [
          { ...firstPage, content: [transaction, ...firstPage.content], totalElements: firstPage.totalElements + 1 },
          ...rest,
        ];
      },
      { revalidate: true }
    );
  };

  const updateRecentTransactions = (transaction: TransactionResponse) => {
    mutate<PagedResponse<TransactionResponse>[]>(
      getRecentTransactionsCacheKey(filters),
      (pages) =>
        pages?.map((page) => ({
          ...page,
          content: page.content.map((item) => (item.id === transaction.id ? transaction : item)),
        })),
      { revalidate: true }
    );
  };

  const finishSuccessfully = (message: string, revalidate: () => void) => {
    if (!isEditingExisting) preferences.rememberRecent(getValues('account'));
    toast.success(message);
    clearForm();
    reset(buildOneTimeDefaults());
    setMode('oneTime');
    revalidate();
    router.refresh();
    overlayState.close();
  };

  const onValid = async (rawData: TransactionFormValues) => {
    try {
      if (mode === 'recurring') {
        const data = rawData as unknown as RecurringTransactionRequest;
        if (!recurringFormData) {
          const created = await createRecurringTransaction(data);
          finishSuccessfully(t('TransactionForm.recurringCreatedSuccess', { id: created.id }), () => {
            revalidateRecurringTransactions();
            revalidateTransactions();
          });
        } else {
          const updated = await editRecurringTransaction({ ...data, id: recurringFormData.id });
          finishSuccessfully(
            t('TransactionForm.recurringEditedSuccess', { id: updated.id }),
            revalidateRecurringTransactions
          );
        }
      } else {
        const data = rawData as unknown as TransactionRequest;
        if (!transactionFormData) {
          const created = await createTransaction(data);
          finishSuccessfully(t('TransactionForm.createdSuccess', { id: created.id }), revalidateTransactions);
          insertIntoRecentTransactions(created);
        } else {
          const updated = await editTransaction({ ...data, id: transactionFormData.id });
          finishSuccessfully(t('TransactionForm.editedSuccess', { id: updated.id }), revalidateTransactions);
          updateRecentTransactions(updated);
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : t('TransactionForm.unexpectedError');
      setSaveError(message);
      toast.danger(message);
    }
  };

  return { onValid, saveError, setSaveError };
};
