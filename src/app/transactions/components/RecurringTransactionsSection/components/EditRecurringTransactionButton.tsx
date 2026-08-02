'use client';
import { useTranslations } from 'next-intl';
import { HiPencil } from 'react-icons/hi2';
import { Button } from '@/components';
import { useTransactionForm } from '@/components/TransactionForm/TransactionFormProvider';
import { RecurringTransactionResponse } from '@/types/dto';

interface EditRecurringTransactionButtonProps {
  recurrence: RecurringTransactionResponse;
}

export const EditRecurringTransactionButton = ({ recurrence }: EditRecurringTransactionButtonProps) => {
  const t = useTranslations('Generics');
  const { showRecurringTransactionForm } = useTransactionForm();

  return (
    <Button size="sm" variant="secondary" onPress={() => showRecurringTransactionForm(recurrence)}>
      <HiPencil className="size-5" />
      <span className="hidden md:block">{t('edit')}</span>
    </Button>
  );
};
