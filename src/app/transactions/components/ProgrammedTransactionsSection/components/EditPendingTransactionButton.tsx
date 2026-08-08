'use client';
import { Spinner, toast } from '@heroui/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { HiPencil } from 'react-icons/hi2';
import { Button } from '@/components';
import { useTransactionForm } from '@/components/TransactionForm/TransactionFormProvider';
import { getTransactionById } from '@/lib/actions/transactions';

interface EditPendingTransactionButtonProps {
  transactionId: number;
}

/**
 * A pending ONE_TIME row only carries UpcomingTransactionItem's flat shape (no category,
 * subcategory, currency, ...), which isn't enough to seed TransactionForm. Unlike
 * EditRecurringTransactionButton (which already has the full RecurringTransactionResponse on
 * hand), this fetches the full record on press before opening the shared one-time edit form.
 */
export const EditPendingTransactionButton = ({ transactionId }: EditPendingTransactionButtonProps) => {
  const t = useTranslations('Generics');
  const tGenerics = useTranslations();
  const { showTransactionForm } = useTransactionForm();
  const [isLoading, setIsLoading] = useState(false);

  const handlePress = async () => {
    setIsLoading(true);
    try {
      const transaction = await getTransactionById(transactionId);
      showTransactionForm(transaction);
    } catch (error) {
      toast.danger(error instanceof Error ? error.message : tGenerics('TransactionForm.unexpectedError'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button size="sm" variant="secondary" onPress={handlePress} isDisabled={isLoading}>
      {isLoading ? <Spinner className="size-5" /> : <HiPencil className="size-5" />}
      <span className="hidden md:block">{t('edit')}</span>
    </Button>
  );
};
